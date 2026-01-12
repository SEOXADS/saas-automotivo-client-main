'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Input, Select, Button } from '@/components/ui'
import { Users, UserPlus, Shield, Edit, Trash2, Save, X } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'salesperson' | 'user'
  is_active: boolean
  last_login_at?: string
  created_at: string
}

interface UserFormData {
  name: string
  email: string
  role: 'admin' | 'manager' | 'salesperson' | 'user'
  password: string
  password_confirmation: string
}

export default function UsersSettingsPage() {
  const { user: currentUser, token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    password: '',
    password_confirmation: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Carregar usuários
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔧 Usuários carregados:', data)
        setUsers(data.data || [])
      } else {
        console.error('❌ Erro ao carregar usuários:', response.status, response.statusText)
        setMessage({ type: 'error', text: 'Erro ao carregar usuários' })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
      setMessage({ type: 'error', text: 'Erro de conexão' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.password_confirmation) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      return
    }

    try {
      const url = editingUser
        ? `${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/users`

      const method = editingUser ? 'PUT' : 'POST'

      // Preparar dados para a API
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.password && { password: formData.password }),
        ...(formData.password && { password_confirmation: formData.password_confirmation })
      }

      console.log('🔧 Enviando dados do usuário:', userData)

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Resposta da API:', responseData)

        setMessage({
          type: 'success',
          text: editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!'
        })
        resetForm()
        loadUsers()
      } else {
        const errorData = await response.json()
        console.error('❌ Erro da API:', errorData)
        setMessage({ type: 'error', text: errorData.message || 'Erro ao salvar usuário' })
      }
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error)
      setMessage({ type: 'error', text: 'Erro de conexão' })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      password_confirmation: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Usuário excluído:', responseData)

        setMessage({ type: 'success', text: 'Usuário excluído com sucesso!' })
        loadUsers()
      } else {
        const errorData = await response.json()
        console.error('❌ Erro ao excluir usuário:', errorData)
        setMessage({ type: 'error', text: errorData.message || 'Erro ao excluir usuário' })
      }
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      setMessage({ type: 'error', text: 'Erro de conexão' })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      password: '',
      password_confirmation: ''
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'salesperson': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'manager': return 'Gerente'
      case 'salesperson': return 'Vendedor'
      default: return 'Usuário'
    }
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Usuários e Permissões</h2>
        <p className="text-gray-600">Gerencie usuários e suas permissões no sistema</p>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Botão Adicionar Usuário */}
      <div className="mb-6">
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome completo"
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                options={[
                  { value: 'user', label: 'Usuário' },
                  { value: 'salesperson', label: 'Vendedor' },
                  { value: 'manager', label: 'Gerente' },
                  { value: 'admin', label: 'Administrador' }
                ]}
                placeholder="Selecione o papel"
              />

              <Input
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={editingUser ? 'Deixe em branco para manter' : 'Digite a senha'}
                required={!editingUser}
              />

              <Input
                label="Confirmar Senha"
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                placeholder="Confirme a senha"
                required={!editingUser}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="px-6 py-3"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Save className="w-5 h-5 mr-2" />
                {editingUser ? 'Atualizar' : 'Criar'} Usuário
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Usuários do Sistema</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h4>
            <p className="text-gray-500">Comece adicionando o primeiro usuário ao sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Papel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar usuário"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
  )
}
