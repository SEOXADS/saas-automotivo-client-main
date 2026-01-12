'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Users, Phone, Mail, Calendar, Plus, Eye, Edit } from 'lucide-react'
import Link from 'next/link'

interface Lead {
  id: number
  name: string
  email: string
  phone: string
  vehicle_interest: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed'
  created_at: string
  notes?: string
}

export default function LeadsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    // Simular carregamento de leads
    const timer = setTimeout(() => {
      setLeads([
        {
          id: 1,
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          vehicle_interest: 'Honda Civic 2020',
          status: 'new',
          created_at: '2024-01-15T10:30:00Z',
          notes: 'Interessado em financiamento'
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(11) 88888-8888',
          vehicle_interest: 'Toyota Corolla 2021',
          status: 'contacted',
          created_at: '2024-01-14T14:20:00Z',
          notes: 'Já visitou a loja'
        },
        {
          id: 3,
          name: 'Pedro Costa',
          email: 'pedro@email.com',
          phone: '(11) 77777-7777',
          vehicle_interest: 'Volkswagen Golf 2019',
          status: 'qualified',
          created_at: '2024-01-13T09:15:00Z',
          notes: 'Pronto para fechar negócio'
        }
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'proposal': return 'bg-purple-100 text-purple-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Novo'
      case 'contacted': return 'Contatado'
      case 'qualified': return 'Qualificado'
      case 'proposal': return 'Proposta'
      case 'closed': return 'Fechado'
      default: return 'Desconhecido'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout title="Leads" subtitle="Gerencie seus leads de vendas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600 mt-2">Gerencie seus leads de vendas</p>
          </div>
          <Link
            href="/admin/leads/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Lead
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Novos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.filter(l => l.status === 'new').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Users className="h-7 w-7 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Qualificados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.filter(l => l.status === 'qualified').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fechados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.filter(l => l.status === 'closed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de leads */}
        <div className="bg-white rounded-xl shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Nenhum lead encontrado</p>
              <Link
                href="/admin/leads/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar primeiro lead
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interesse
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {lead.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {lead.name}
                            </div>
                            {lead.notes && (
                              <div className="text-sm text-gray-500">
                                {lead.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {lead.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {lead.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900">
                          {lead.vehicle_interest}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                          {getStatusText(lead.status)}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(lead.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-medium">
                        <div className="flex space-x-3">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
