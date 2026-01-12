"use client"

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { VehicleBrand } from '@/types'
import { Package, Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function VehicleBrandsPage() {
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // Obter token JWT do estado de autenticação
        const token = useAuth.getState().token
        if (!token) {
          console.error('❌ VehicleBrandsPage: Token JWT não encontrado')
          setIsLoading(false)
          return
        }

        console.log('🔍 VehicleBrandsPage: Carregando marcas...')

                // Verificar se está em modo demo
        const isDemoMode = token === 'demo_token_123' || token?.startsWith('fallback_')

        console.log('🔍 VehicleBrandsPage: Token detectado:', token ? `${token.substring(0, 20)}...` : 'null')
        console.log('🔍 VehicleBrandsPage: Modo demo:', isDemoMode)

        if (isDemoMode) {
          console.log('🎭 VehicleBrandsPage: Modo demo detectado, usando dados mock')
          // Usar dados mock para modo demo
          const mockBrands: VehicleBrand[] = [
            {
              id: 1,
              name: 'Toyota',
              slug: 'toyota',
              logo: null,
              description: 'Veículos da marca Toyota',
              is_active: true,
              sort_order: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              name: 'Honda',
              slug: 'honda',
              logo: null,
              description: 'Veículos da marca Honda',
              is_active: true,
              sort_order: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              name: 'Ford',
              slug: 'ford',
              logo: null,
              description: 'Veículos da marca Ford',
              is_active: true,
              sort_order: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 4,
              name: 'Volkswagen',
              slug: 'volkswagen',
              logo: null,
              description: 'Veículos da marca Volkswagen',
              is_active: true,
              sort_order: 4,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 5,
              name: 'Chevrolet',
              slug: 'chevrolet',
              logo: null,
              description: 'Veículos da marca Chevrolet',
              is_active: true,
              sort_order: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]

          setBrands(mockBrands)
          setIsUsingFallback(true)
          console.log('✅ VehicleBrandsPage: Marcas mock carregadas:', mockBrands.length)
          return
                }

        console.log('🌐 VehicleBrandsPage: Modo real detectado, fazendo requisição para API...')

        // Se não for demo, fazer requisição real para a API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
          }
        })

        if (!response.ok) {
          console.log('⚠️ VehicleBrandsPage: API retornou erro:', response.status, response.statusText)
          throw new Error(`API retornou erro: ${response.status}`)
        }

        const responseData = await response.json()
        console.log('📦 VehicleBrandsPage: Resposta da API:', responseData)

        // Verificar se é array direto ou objeto com estrutura { success, data }
        let brandsArray: VehicleBrand[] = []

        if (Array.isArray(responseData)) {
          // API retorna array direto: [{...}, {...}, ...]
          console.log('✅ VehicleBrandsPage: API retorna array direto com', responseData.length, 'marcas')
          brandsArray = responseData
        } else if (responseData.success && responseData.data && Array.isArray(responseData.data)) {
          // API retorna objeto estruturado: { success: true, data: [...], message: "..." }
          console.log('✅ VehicleBrandsPage: API retorna objeto estruturado com', responseData.data.length, 'marcas')
          brandsArray = responseData.data
        } else {
          console.log('⚠️ VehicleBrandsPage: Formato de resposta inválido:', responseData)
          brandsArray = []
        }

        setBrands(brandsArray)
        setIsUsingFallback(false)
        console.log('✅ VehicleBrandsPage: Marcas carregadas:', brandsArray.length)
      } catch (error) {
        console.error('❌ VehicleBrandsPage: Erro ao carregar marcas:', error)
        // Em caso de erro da API, mostrar erro mas não usar fallback automático
        setBrands([])
        setIsUsingFallback(false)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBrands()
  }, [])

  return (
    <AdminLayout title="Marcas e Modelos" subtitle={`${brands.length} marcas cadastradas`}>
      <div className="p-6 space-y-6">
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Gerencie as marcas e seus modelos</p>
            </div>
          </div>
          <Link href="/admin/vehicles/create" className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Veículo
          </Link>
        </div>

        {isLoading ? (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-24"></div>
            ))}
          </div>
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div key={brand.id} className="bg-white rounded-lg shadow-soft p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-900">{brand.name}</p>
                  <p className="text-xs text-secondary-500">{brand.is_active ? 'Ativa' : 'Inativa'}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-secondary-100 text-secondary-700">
                  Marca ativa
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Nenhuma marca encontrada</h3>
            <p className="text-secondary-500">Cadastre veículos para começar a gerenciar marcas e modelos.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
