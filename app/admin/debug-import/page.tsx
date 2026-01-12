'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { showLoading, showSuccess, showError } from '@/lib/swal'

interface ImportDebugResult {
  status: number
  headers: Record<string, string>
  body: unknown
  rawText: string
  timestamp: string
}

export default function DebugImportPage() {
  const { isAuthenticated, token } = useAuth()
  const [importUrl, setImportUrl] = useState('')
  const [selectedSource, setSelectedSource] = useState('webmotors')
  const [isImporting, setIsImporting] = useState(false)
  const [debugResults, setDebugResults] = useState<ImportDebugResult[]>([])

  const importSources = [
    {
      id: 'webmotors',
      name: 'Webmotors',
      description: 'Importar anúncios do Webmotors',
      baseUrl: 'https://www.webmotors.com.br',
      exampleUrl: 'https://www.webmotors.com.br/comprar/fiat/argo/10-firefly-flex-drive-manual/4/2024/59209372'
    },
    {
      id: 'olx',
      name: 'OLX',
      description: 'Importar anúncios da OLX',
      baseUrl: 'https://www.olx.com.br',
      exampleUrl: 'https://www.olx.com.br/veiculos/toyota-corolla-2023'
    },
    {
      id: 'icarros',
      name: 'iCarros',
      description: 'Importar anúncios do iCarros',
      baseUrl: 'https://www.icarros.com.br',
      exampleUrl: 'https://www.icarros.com.br/carros/volkswagen-golf-gti-2021'
    },
    {
      id: 'omegaveiculos',
      name: 'OmeGa Veículos',
      description: 'Importar anúncios do OmeGa Veículos',
      baseUrl: 'https://www.omegaveiculos.com.br',
      exampleUrl: 'https://www.omegaveiculos.com.br/veiculos/bmw-320i-2023'
    }
  ]

  const handleImport = async () => {
    if (!importUrl.trim()) {
      showError('Por favor, insira uma URL válida')
      return
    }

    if (!token) {
      showError('Token de autenticação não encontrado. Faça login novamente.')
      return
    }

    setIsImporting(true)
    showLoading('Debugando importação...')

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/vehicles/import/${selectedSource}`
      const results: ImportDebugResult[] = []

      console.log('🔍 Iniciando debug de importação...')
      console.log('  - URL da API:', apiUrl)
      console.log('  - URL de importação:', importUrl)
      console.log('  - Token JWT:', token ? `${token.substring(0, 20)}...` : 'NENHUM')

      // Teste 1: Query Parameters
      try {
        console.log('\n🔍 Teste 1: Query Parameters')
        const urlWithParams = `${apiUrl}?url=${encodeURIComponent(importUrl)}`

        const response1 = await fetch(urlWithParams, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        const headers1: Record<string, string> = {}
        response1.headers.forEach((value, key) => {
          headers1[key] = value
        })

        let body1: unknown = null
        let rawText1 = ''

        try {
          body1 = await response1.json()
        } catch {
          rawText1 = await response1.text()
        }

        const result1: ImportDebugResult = {
          status: response1.status,
          headers: headers1,
          body: body1,
          rawText: rawText1,
          timestamp: new Date().toISOString()
        }

        results.push(result1)
        console.log('✅ Teste 1 concluído:', result1)

      } catch (error) {
        console.error('❌ Teste 1 falhou:', error)
        results.push({
          status: 0,
          headers: {},
          body: null,
          rawText: `Erro: ${error}`,
          timestamp: new Date().toISOString()
        })
      }

      // Teste 2: Headers Customizados
      try {
        console.log('\n🔍 Teste 2: Headers Customizados')

        const response2 = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Import-URL': importUrl,
            'X-Import-Source': selectedSource
          }
        })

        const headers2: Record<string, string> = {}
        response2.headers.forEach((value, key) => {
          headers2[key] = value
        })

        let body2: unknown = null
        let rawText2 = ''

        try {
          body2 = await response2.json()
        } catch {
          rawText2 = await response2.text()
        }

        const result2: ImportDebugResult = {
          status: response2.status,
          headers: headers2,
          body: body2,
          rawText: rawText2,
          timestamp: new Date().toISOString()
        }

        results.push(result2)
        console.log('✅ Teste 2 concluído:', result2)

      } catch (error) {
        console.error('❌ Teste 2 falhou:', error)
        results.push({
          status: 0,
          headers: {},
          body: null,
          rawText: `Erro: ${error}`,
          timestamp: new Date().toISOString()
        })
      }

      // Teste 3: POST com body
      try {
        console.log('\n🔍 Teste 3: POST com body')

        const response3 = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: importUrl,
            source: selectedSource
          })
        })

        const headers3: Record<string, string> = {}
        response3.headers.forEach((value, key) => {
          headers3[key] = value
        })

        let body3: unknown = null
        let rawText3 = ''

        try {
          body3 = await response3.json()
        } catch {
          rawText3 = await response3.text()
        }

        const result3: ImportDebugResult = {
          status: response3.status,
          headers: headers3,
          body: body3,
          rawText: rawText3,
          timestamp: new Date().toISOString()
        }

        results.push(result3)
        console.log('✅ Teste 3 concluído:', result3)

      } catch (error) {
        console.error('❌ Teste 3 falhou:', error)
        results.push({
          status: 0,
          headers: {},
          body: null,
          rawText: `Erro: ${error}`,
          timestamp: new Date().toISOString()
        })
      }

      setDebugResults(results)
      showSuccess('Debug concluído! Verifique os resultados abaixo.')

      console.log('\n📊 RESUMO DOS TESTES:')
      results.forEach((result, index) => {
        console.log(`\n--- Teste ${index + 1} ---`)
        console.log('Status:', result.status)
        console.log('Body:', result.body)
        console.log('Raw Text:', result.rawText)
      })

    } catch (error) {
      console.error('❌ Erro geral no debug:', error)
      showError('Erro inesperado durante o debug')
    } finally {
      setIsImporting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout title="Debug de Importação">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🐛 Debug de Importação
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Esta página ajuda a debugar problemas na importação de veículos.
              Ela testa diferentes abordagens e mostra exatamente o que a API está retornando.
            </p>
          </div>

          {/* Seleção de Fonte */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fonte de Importação
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {importSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedSource === source.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{source.name}</div>
                  <div className="text-xs text-gray-500">{source.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* URL de Importação */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Anúncio
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Cole a URL do anúncio aqui..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={handleImport}
                disabled={isImporting || !importUrl.trim()}
                loading={isImporting}
                variant="primary"
              >
                {isImporting ? 'Debugando...' : 'Debug Importação'}
              </Button>
            </div>

            {/* URL de exemplo */}
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Exemplo para {importSources.find(s => s.id === selectedSource)?.name}:{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {importSources.find(s => s.id === selectedSource)?.exampleUrl}
                </code>
              </p>
            </div>
          </div>

          {/* Resultados do Debug */}
          {debugResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 Resultados do Debug
              </h2>

              <div className="space-y-4">
                {debugResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Teste {index + 1}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.status >= 200 && result.status < 300
                          ? 'bg-green-100 text-green-800'
                          : result.status === 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.status === 0 ? 'Erro' : `Status ${result.status}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Headers */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Headers</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(result.headers, null, 2)}
                        </pre>
                      </div>

                      {/* Body */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Body/Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                          {result.body ? JSON.stringify(result.body, null, 2) : result.rawText || 'N/A'}
                        </pre>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Timestamp: {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📋 Como interpretar os resultados:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Status 200-299:</strong> Sucesso - verifique o body para dados</li>
              <li>• <strong>Status 400-499:</strong> Erro do cliente - verifique parâmetros</li>
              <li>• <strong>Status 500+:</strong> Erro do servidor - problema na API</li>
              <li>• <strong>Body vazio:</strong> API não retornou dados estruturados</li>
              <li>• <strong>Raw Text:</strong> Resposta não-JSON da API</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
