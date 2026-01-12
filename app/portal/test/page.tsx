'use client'

import { useState, useEffect } from 'react'
import { getPortalTenantInfo, getPortalVehicles } from '@/lib/portal-api'

export default function TestPage() {
  const [tenantData, setTenantData] = useState<any>(null)
  const [vehiclesData, setVehiclesData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🧪 Testando API do portal...')

        // Testar tenant info
        const tenant = await getPortalTenantInfo('ictussistemas')
        console.log('✅ Tenant carregado:', tenant)
        setTenantData(tenant)

        // Testar veículos
        const vehicles = await getPortalVehicles('ictussistemas', { featured: true, per_page: 3 })
        console.log('✅ Veículos carregados:', vehicles)
        setVehiclesData(vehicles)

      } catch (err) {
        console.error('❌ Erro no teste:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    testAPI()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testando API...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">Erro no Teste</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste da API do Portal</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tenant Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Dados do Tenant</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(tenantData, null, 2)}
            </pre>
          </div>

          {/* Vehicles */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Dados dos Veículos</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(vehiclesData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold">✅ Teste Concluído com Sucesso!</h2>
          <p>A API está funcionando corretamente.</p>
        </div>
      </div>
    </div>
  )
}
