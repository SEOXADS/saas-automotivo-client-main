'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'

type ApiResponse = {
  data?: unknown[]
  error?: string
  [key: string]: unknown
}

export default function TestEnvPage() {
  const { isAuthenticated, token } = useAuth()
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const testVehiclesAPI = async () => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles?page=1&per_page=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApiResponse(data)
        console.log('🔍 API Response:', data)

        if (data.data && data.data.length > 0) {
          console.log('🚗 Primeiro veículo:', data.data[0])
          console.log('🖼️ Main image do primeiro veículo:', data.data[0].main_image)
          console.log('📷 Images array do primeiro veículo:', data.data[0].images)
          console.log('⭐ Imagem principal (main_image):', data.data[0].main_image?.image_url)
        }
      } else {
        setApiResponse({ error: `HTTP ${response.status}: ${response.statusText}` })
      }
    } catch (error) {
      setApiResponse({ error: error instanceof Error ? error.message : 'Erro desconhecido' })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="p-8">Faça login para testar a API</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Ambiente e API</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Variáveis de Ambiente:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Não definido'}</p>
          <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Não definido'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Teste da API de Veículos:</h2>
        <button
          onClick={testVehiclesAPI}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar API de Veículos'}
        </button>
      </div>

      {apiResponse && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Resposta da API:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
