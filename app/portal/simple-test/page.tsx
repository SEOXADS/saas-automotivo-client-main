'use client'

import { useState, useEffect } from 'react'

export default function SimpleTestPage() {
  const [apiStatus, setApiStatus] = useState<string>('Testando...')
  const [tenantData, setTenantData] = useState<{ name?: string; subdomain?: string; status?: string; plan?: string } | null>(null)

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🧪 Testando API simples...')

        // Teste direto da API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/tenant-info`, {
          headers: {
            'X-Tenant-Subdomain': 'ictussistemas',
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`API retornou ${response.status}`)
        }

        const data = await response.json()
        console.log('✅ API funcionando:', data)

        setApiStatus('✅ API funcionando!')
        setTenantData(data.data)

      } catch (error) {
        console.error('❌ Erro na API:', error)
        setApiStatus(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    testAPI()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste Simples da API</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Status da API</h2>
          <p className="text-lg">{apiStatus}</p>
        </div>

        {tenantData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Dados do Tenant</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Nome:</strong> {tenantData.name}</p>
              <p><strong>Subdomain:</strong> {tenantData.subdomain}</p>
              <p><strong>Status:</strong> {tenantData.status}</p>
              <p><strong>Plan:</strong> {tenantData.plan}</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <a
            href="/portal?tenant=ictussistemas"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voltar para o Portal
          </a>
        </div>
      </div>
    </div>
  )
}
