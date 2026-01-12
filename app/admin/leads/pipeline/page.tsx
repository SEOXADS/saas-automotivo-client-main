'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { Lead } from '@/types'
import {
  Users,
  Plus,
  Filter,
  Search,
  AlertCircle,
  Phone,
  Mail,
  DollarSign,
  Car,
  MoreVertical,
  Instagram,
  Facebook,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { LeadModal } from '@/components/ui/LeadModal'

// Definir colunas do Kanban
const KANBAN_COLUMNS = [
  { id: 'new', title: 'Novos', color: 'bg-blue-50 border-blue-200' },
  { id: 'contacted', title: 'Contactados', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'qualified', title: 'Qualificados', color: 'bg-green-50 border-green-200' },
  { id: 'proposal', title: 'Proposta', color: 'bg-purple-50 border-purple-200' },
  { id: 'negotiation', title: 'Negociação', color: 'bg-orange-50 border-orange-200' },
  { id: 'won', title: 'Fechados (Ganho)', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'lost', title: 'Fechados (Perdido)', color: 'bg-red-50 border-red-200' }
]

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [movingLeads, setMovingLeads] = useState<Set<number>>(new Set())

  // Carregar leads
  const loadLeads = useCallback(async () => {
    try {
      const token = useAuth.getState().token
      if (!token) {
        console.error('❌ PipelinePage: Token JWT não encontrado')
        setIsLoading(false)
        return
      }

      console.log('🔍 PipelinePage: Carregando leads...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
        }
      })

      if (!response.ok) {
        console.log('⚠️ PipelinePage: API retornou erro:', response.status, response.statusText)
        throw new Error(`API retornou erro: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('📦 PipelinePage: Resposta da API:', responseData)

      let leadsArray: Lead[] = []

      if (Array.isArray(responseData)) {
        leadsArray = responseData
      } else if (responseData.data && Array.isArray(responseData.data)) {
        leadsArray = responseData.data
      } else {
        leadsArray = []
      }

      setLeads(leadsArray)
      setIsUsingFallback(false)
      console.log('✅ PipelinePage: Leads carregados:', leadsArray.length)
    } catch (error) {
      console.error('❌ PipelinePage: Erro ao carregar leads:', error)
      // Dados de fallback para demonstração
      const fallbackLeads: Lead[] = [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao@exemplo.com',
          phone: '(11) 99999-9999',
          source: 'site',
          status: 'new',
          notes: 'Interessado em SUV',
          interest_type: 'buy',
          budget_min: 50000,
          budget_max: 80000,
          preferred_brand: 'Toyota',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenant_id: 1
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria@exemplo.com',
          phone: '(11) 88888-8888',
          source: 'whatsapp',
          status: 'contacted',
          notes: 'Quer agendar test drive',
          interest_type: 'buy',
          budget_min: 30000,
          budget_max: 50000,
          preferred_brand: 'Honda',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenant_id: 1
        },
        {
          id: 3,
          name: 'Carlos Oliveira',
          email: 'carlos@exemplo.com',
          phone: '(11) 77777-7777',
          source: 'phone',
          status: 'qualified',
          notes: 'Cliente qualificado, orçamento aprovado',
          interest_type: 'buy',
          budget_min: 100000,
          budget_max: 150000,
          preferred_brand: 'BMW',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenant_id: 1
        },
        {
          id: 4,
          name: 'Ana Costa',
          email: 'ana@exemplo.com',
          phone: '(11) 66666-6666',
          source: 'email',
          status: 'proposal',
          notes: 'Proposta enviada, aguardando resposta',
          interest_type: 'buy',
          budget_min: 40000,
          budget_max: 60000,
          preferred_brand: 'Volkswagen',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenant_id: 1
        },
        {
          id: 5,
          name: 'Pedro Lima',
          email: 'pedro@exemplo.com',
          phone: '(11) 55555-5555',
          source: 'facebook',
          status: 'negotiation',
          notes: 'Em negociação de preço',
          interest_type: 'buy',
          budget_min: 20000,
          budget_max: 35000,
          preferred_brand: 'Ford',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenant_id: 1
        },
        {
          id: 6,
          name: 'Lucia Ferreira',
          email: 'lucia@exemplo.com',
          phone: '(11) 44444-4444',
          source: 'referral',
          status: 'won',
          notes: 'Venda concluída com sucesso',
          interest_type: 'buy',
          budget_min: 60000,
          budget_max: 90000,
          preferred_brand: 'Audi',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenant_id: 1
        }
      ]
      setLeads(fallbackLeads)
      setIsUsingFallback(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSource = selectedSource === 'all' || lead.source === selectedSource
    return matchesSearch && matchesSource
  })

  // Agrupar leads por status
  const leadsByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredLeads.filter(lead => lead.status === column.id)
    return acc
  }, {} as Record<string, Lead[]>)

  // Atualizar status do lead
  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const token = useAuth.getState().token
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      // Adicionar lead à lista de leads sendo movidos
      setMovingLeads(prev => new Set(prev).add(leadId))

      console.log('🔄 Atualizando status do lead:', leadId, 'para:', newStatus)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Status do lead atualizado com sucesso:', responseData)

        // Atualizar o estado local com os dados retornados pela API
        const updatedLeadFromAPI = responseData.data || responseData
        setLeads(prev => prev.map(lead =>
          lead.id === leadId ? { ...lead, ...updatedLeadFromAPI } : lead
        ))

        // Se o lead selecionado for o mesmo, atualizar também
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead({ ...selectedLead, ...updatedLeadFromAPI })
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Erro na API ao atualizar status:', response.status, errorData)

        // Reverter a mudança otimista em caso de erro
        setLeads(prev => prev.map(lead =>
          lead.id === leadId ? { ...lead, status: 'new' as Lead['status'] } : lead
        ))

        alert(`Erro ao atualizar status: ${errorData.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status do lead:', error)

      // Reverter a mudança otimista em caso de erro de conexão
      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, status: 'new' as Lead['status'] } : lead
      ))

      alert('Erro de conexão ao atualizar status. Tente novamente.')
    } finally {
      // Remover lead da lista de leads sendo movidos
      setMovingLeads(prev => {
        const newSet = new Set(prev)
        newSet.delete(leadId)
        return newSet
      })
    }
  }

  // Atualizar lead
  const updateLead = async (updatedLead: Lead) => {
    try {
      const token = useAuth.getState().token
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      console.log('🔄 Atualizando lead:', updatedLead.id, updatedLead)
      console.log('🔗 URL da API:', `${process.env.NEXT_PUBLIC_API_URL}/leads/${updatedLead.id}`)
      console.log('🔑 Token:', token ? 'Presente' : 'Ausente')
      console.log('🏢 Tenant:', useAuth.getState().user?.tenant.subdomain || 'demo')

      // Preparar dados para envio (apenas campos necessários)
      const leadData = {
        name: updatedLead.name || '',
        email: updatedLead.email || '',
        phone: updatedLead.phone || '',
        source: updatedLead.source || 'site',
        status: updatedLead.status || 'new',
        notes: updatedLead.notes || '',
        interest_type: updatedLead.interest_type || 'buy',
        budget_min: updatedLead.budget_min || 0,
        budget_max: updatedLead.budget_max || 0,
        preferred_brand: updatedLead.preferred_brand || ''
      }

      console.log('📤 Dados sendo enviados:', leadData)
      console.log('📤 JSON stringify:', JSON.stringify(leadData))

      // Validação básica
      if (!leadData.name || !leadData.email) {
        alert('Nome e email são obrigatórios')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${updatedLead.id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
        },
        body: JSON.stringify(leadData)
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Lead atualizado com sucesso:', responseData)

        // Atualizar o estado local com os dados retornados pela API
        const updatedLeadFromAPI = responseData.data || responseData
        setLeads(prev => prev.map(lead =>
          lead.id === updatedLead.id ? { ...lead, ...updatedLeadFromAPI } : lead
        ))
        setSelectedLead({ ...updatedLead, ...updatedLeadFromAPI })

        // Mostrar mensagem de sucesso
        alert('Lead atualizado com sucesso!')
      } else {
        console.error('❌ Erro na API - Status:', response.status, response.statusText)
        console.error('❌ Headers da resposta:', response.headers)

        let errorData = {}
        let errorMessage = 'Erro interno do servidor'

        try {
          errorData = await response.json()
          console.error('❌ Dados do erro (JSON):', errorData)
          errorMessage = (errorData as { message?: string; error?: string }).message ||
                        (errorData as { message?: string; error?: string }).error ||
                        'Erro interno do servidor'
        } catch (jsonError) {
          console.error('❌ Erro ao parsear JSON da resposta:', jsonError)
          try {
            const textResponse = await response.text()
            console.error('❌ Resposta como texto:', textResponse)
            errorMessage = textResponse || 'Erro interno do servidor'
          } catch (textError) {
            console.error('❌ Erro ao ler resposta como texto:', textError)
            errorMessage = 'Erro interno do servidor'
          }
        }

        alert(`Erro ao atualizar lead (${response.status}): ${errorMessage}`)
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error)
      alert('Erro de conexão ao atualizar lead. Tente novamente.')
    }
  }

  // Excluir lead
  const deleteLead = async (leadId: number) => {
    try {
      const token = useAuth.getState().token
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      console.log('🗑️ Excluindo lead:', leadId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
        }
      })

      if (response.ok) {
        console.log('✅ Lead excluído com sucesso')
        setLeads(prev => prev.filter(lead => lead.id !== leadId))
        setIsModalOpen(false)
        setSelectedLead(null)
        alert('Lead excluído com sucesso!')
      } else {
        const errorData = await response.json()
        console.error('❌ Erro na API ao excluir lead:', response.status, errorData)
        alert(`Erro ao excluir lead: ${errorData.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('❌ Erro ao excluir lead:', error)
      alert('Erro de conexão ao excluir lead. Tente novamente.')
    }
  }

  // Abrir modal
  const openLeadModal = (lead: Lead) => {
    setSelectedLead(lead)
    setIsModalOpen(true)
  }

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId) return

    const leadId = parseInt(draggableId)
    const newStatus = destination.droppableId

    // Atualização otimista - move o lead imediatamente no estado local
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus as Lead['status'] } : lead
    ))

    // Chama a API em background
    updateLeadStatus(leadId, newStatus)
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100'
      case 'contacted': return 'text-yellow-600 bg-yellow-100'
      case 'qualified': return 'text-green-600 bg-green-100'
      case 'proposal': return 'text-purple-600 bg-purple-100'
      case 'negotiation': return 'text-orange-600 bg-orange-100'
      case 'won': return 'text-emerald-600 bg-emerald-100'
      case 'lost': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Obter ícone do source
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'phone': return <Phone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'site': return <Car className="h-4 w-4" />
      case 'whatsapp': return <Phone className="h-4 w-  4" />
      case 'facebook': return <Facebook className="h-4 w-4" />
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'referral': return <Users className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <AdminLayout title="Pipeline de Vendas" subtitle="Gerencie seu funil de vendas com quadro Kanban">
      <div className="p-6 space-y-6 display-fixed">
        {isUsingFallback && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Dados de Demonstração</p>
                <p className="text-sm text-yellow-700">Exibindo dados de exemplo enquanto a API não está disponível.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pipeline de Vendas</h1>
              <p className="text-sm text-gray-600">Gerencie seu funil de vendas com drag & drop</p>
            </div>
          </div>
          <Link
            href="/admin/leads/create"
            className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Lead
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.length > 0 ? Math.round((leadsByStatus['won']?.length || 0) / leads.length * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Negociação</p>
                <p className="text-2xl font-bold text-gray-900">{leadsByStatus['negotiation']?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Novos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.filter(lead => {
                    const today = new Date()
                    const leadDate = new Date(lead.created_at)
                    return leadDate.toDateString() === today.toDateString()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todas as Fontes</option>
                <option value="site">Website</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Telefone</option>
                <option value="email">Email</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="referral">Indicação</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quadro Kanban */}
        <div className="overflow-x-auto">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando Pipeline</h3>
              <p className="text-gray-600">Buscando leads...</p>
            </div>
        ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedSource !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro lead'
                }
              </p>
              {!searchTerm && selectedSource === 'all' && (
                <Link
                  href="/admin/leads/create"
                  className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Lead
                </Link>
              )}
          </div>
        ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex space-x-3 pb-4 min-w-max gap-4 overflow-x-auto">
              {KANBAN_COLUMNS.map((column) => (
                <div key={column.id} className={`rounded-lg border-2 ${column.color} min-h-[500px] w-100 flex-shrink-0`}>
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <span className="text-sm text-gray-500">
                      {leadsByStatus[column.id]?.length || 0} leads
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 space-y-3 min-h-[400px] ${
                          snapshot.isDraggingOver ? 'bg-gray-50' : ''
                        }`}
                      >
                        {leadsByStatus[column.id]?.map((lead, index) => (
                          <Draggable
                            key={lead.id}
                            draggableId={lead.id.toString()}
                            index={index}
                            isDragDisabled={movingLeads.has(lead.id)}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 ${
                                  movingLeads.has(lead.id)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-move hover:shadow-md'
                                } ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                      <span className="text-primary-600 font-semibold text-sm">
                                        {lead.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 truncate">{lead.name}</h4>
                                      <p className="text-sm text-gray-500 truncate">{lead.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {movingLeads.has(lead.id) && (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                                    )}
                                    <div className={`p-1 rounded ${getStatusColor(lead.source)}`}>
                                      {getSourceIcon(lead.source)}
                                    </div>
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                      <MoreVertical className="h-4 w-4 text-gray-400" />
                                    </button>
                                  </div>
                                </div>

                                {lead.phone && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{lead.phone}</span>
                                  </div>
                                )}

                                {lead.budget_min && lead.budget_max && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>
                                      R$ {lead.budget_min.toLocaleString('pt-BR')} - R$ {lead.budget_max.toLocaleString('pt-BR')}
                                    </span>
                                  </div>
                                )}

                                {lead.preferred_brand && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                    <Car className="h-4 w-4" />
                                    <span>{lead.preferred_brand}</span>
                                  </div>
                                )}

                                {lead.notes && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lead.notes}</p>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>{formatDate(lead.created_at)}</span>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => openLeadModal(lead)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      <Eye className="h-4 w-4" />
                          </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
              </div>
            </DragDropContext>
          )}
          </div>

        {/* Modal */}
        <LeadModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedLead(null)
          }}
          onSave={updateLead}
          onDelete={deleteLead}
        />
      </div>
    </AdminLayout>
  )
}
