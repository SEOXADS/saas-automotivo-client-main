'use client'

import { Suspense } from 'react'

function ColorTestContent() {
  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Teste de Cores do Portal
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Cores Primárias */}
          <div className="p-6 rounded-lg border border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Cores Primárias</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-blue-500"></div>
                <span>Primary: #3B82F6</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-gray-500"></div>
                <span>Secondary: #6c757d</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-green-500"></div>
                <span>Accent: #28a745</span>
              </div>
            </div>
          </div>

          {/* Cores de Status */}
          <div className="p-6 rounded-lg border border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Cores de Status</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-green-500"></div>
                <span>Success: #28a745</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-yellow-500"></div>
                <span>Warning: #ffc107</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-red-500"></div>
                <span>Danger: #dc3545</span>
              </div>
            </div>
          </div>

          {/* Cores de Texto */}
          <div className="p-6 rounded-lg border border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Cores de Texto</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-black"></div>
                <span>Text: #000000</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-gray-500"></div>
                <span>Text Muted: #6c757d</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status das Cores */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Status das Cores</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
              <span>Cores aplicadas: Sim (estático)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
              <span>Dados do tenant: Carregados (estático)</span>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Informações</h3>
          <p className="text-gray-600">
            Esta é uma versão estática da página de teste de cores para evitar problemas de build.
            As cores são exibidas como valores estáticos para demonstração.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ColorTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando teste de cores...</p>
        </div>
      </div>
    }>
      <ColorTestContent />
    </Suspense>
  )
}
