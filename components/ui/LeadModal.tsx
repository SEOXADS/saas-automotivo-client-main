'use client'

import { useState, useEffect } from 'react'
import { Lead } from '@/types'
import {
  X,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Car,
  User,
  MessageSquare,
  Edit,
  Save,
  Trash2
} from 'lucide-react'

interface LeadModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onSave: (lead: Lead) => void
  onDelete: (leadId: number) => void
}

export function LeadModal({ lead, isOpen, onClose, onSave, onDelete }: LeadModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Lead>>({})

  useEffect(() => {
    if (lead) {
      setFormData(lead)
    }
  }, [lead])

  if (!isOpen || !lead) return null

  const handleSave = async () => {
    try {
      // Validar dados obrigatórios
      if (!formData.name || !formData.email || !formData.phone) {
        alert('Por favor, preencha todos os campos obrigatórios.')
        return
      }

      // Chamar a função de salvamento passada como prop
      await onSave(formData as Lead)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao salvar lead:', error)
      alert('Erro ao salvar as alterações. Tente novamente.')
    }
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      onDelete(lead.id)
      onClose()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'proposal': return 'bg-purple-100 text-purple-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'won': return 'bg-emerald-100 text-emerald-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'site': return 'Website'
      case 'whatsapp': return 'WhatsApp'
      case 'phone': return 'Telefone'
      case 'email': return 'Email'
      case 'facebook': return 'Facebook'
      case 'instagram': return 'Instagram'
      case 'referral': return 'Indicação'
      default: return source
    }
  }

  const getInterestTypeLabel = (type: string) => {
    switch (type) {
      case 'buy': return 'Compra'
      case 'sell': return 'Venda'
      case 'exchange': return 'Troca'
      case 'financing': return 'Financiamento'
      default: return type
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-lg">
                {lead.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
              <p className="text-sm text-gray-500">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg"
              >
                <Save className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status e Fonte */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {isEditing ? (
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Lead['status'] }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="new">Novo</option>
                  <option value="contacted">Contactado</option>
                  <option value="qualified">Qualificado</option>
                  <option value="proposal">Proposta</option>
                  <option value="negotiation">Negociação</option>
                  <option value="won">Fechado (Ganho)</option>
                  <option value="lost">Fechado (Perdido)</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {getSourceLabel(lead.status)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Fonte:</span>
              {isEditing ? (
                <select
                  value={formData.source || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as Lead['source'] }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="site">Website</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Telefone</option>
                  <option value="email">Email</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="referral">Indicação</option>
                </select>
              ) : (
                <span className="text-sm text-gray-600">{getSourceLabel(lead.source)}</span>
              )}
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Informações Pessoais
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{lead.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {lead.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {lead.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Car className="h-4 w-4 mr-2" />
                Interesse
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo de Interesse</label>
                  {isEditing ? (
                    <select
                      value={formData.interest_type || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, interest_type: e.target.value as Lead['interest_type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="buy">Compra</option>
                      <option value="sell">Venda</option>
                      <option value="exchange">Troca</option>
                      <option value="financing">Financiamento</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-600">{getInterestTypeLabel(lead.interest_type)}</p>
                  )}
                </div>
                {lead.budget_min && lead.budget_max && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Orçamento</label>
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Mínimo"
                          value={formData.budget_min || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget_min: Number(e.target.value) }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Máximo"
                          value={formData.budget_max || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget_max: Number(e.target.value) }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        R$ {lead.budget_min.toLocaleString('pt-BR')} - R$ {lead.budget_max.toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                )}
                {lead.preferred_brand && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Marca Preferida</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.preferred_brand || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferred_brand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{lead.preferred_brand}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <h3 className="font-medium text-gray-900 flex items-center mb-2">
              <MessageSquare className="h-4 w-4 mr-2" />
              Observações
            </h3>
            {isEditing ? (
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Adicione observações sobre este lead..."
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {lead.notes || 'Nenhuma observação adicionada.'}
              </p>
            )}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-700">Criado em</label>
              <p className="text-sm text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(lead.created_at)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Atualizado em</label>
              <p className="text-sm text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(lead.updated_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
            >
              Salvar Alterações
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
