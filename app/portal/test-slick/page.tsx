'use client'

import { useEffect } from 'react'

export default function TestSlickPage() {
  useEffect(() => {
    // Aguardar um pouco para os plugins carregarem
    setTimeout(() => {
      console.log('🧪 Testando Slick Carousel...')
    }, 2000)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Teste Slick Carousel</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Carrossel de Veículos</h2>
        <div className="slick-carousel">
          <div className="p-4">
            <div className="bg-white border rounded-lg p-6 shadow-md">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Imagem do Veículo 1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Honda Civic 2023</h3>
              <p className="text-gray-600 mb-2">Automático • 2.0L • Gasolina</p>
              <p className="text-2xl font-bold text-blue-600">R$ 85.000</p>
            </div>
          </div>

          <div className="p-4">
            <div className="bg-white border rounded-lg p-6 shadow-md">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Imagem do Veículo 2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Toyota Corolla 2023</h3>
              <p className="text-gray-600 mb-2">Automático • 2.0L • Flex</p>
              <p className="text-2xl font-bold text-blue-600">R$ 95.000</p>
            </div>
          </div>

          <div className="p-4">
            <div className="bg-white border rounded-lg p-6 shadow-md">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Imagem do Veículo 3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Volkswagen Jetta 2023</h3>
              <p className="text-gray-600 mb-2">Automático • 1.4L • Flex</p>
              <p className="text-2xl font-bold text-blue-600">R$ 78.000</p>
            </div>
          </div>

          <div className="p-4">
            <div className="bg-white border rounded-lg p-6 shadow-md">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Imagem do Veículo 4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Ford Focus 2023</h3>
              <p className="text-gray-600 mb-2">Automático • 2.0L • Flex</p>
              <p className="text-2xl font-bold text-blue-600">R$ 72.000</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Carrossel de Imagens</h2>
        <div className="slick-carousel">
          <div className="p-4">
            <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
              Imagem 1
            </div>
          </div>
          <div className="p-4">
            <div className="w-full h-64 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
              Imagem 2
            </div>
          </div>
          <div className="p-4">
            <div className="w-full h-64 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl">
              Imagem 3
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Status do Carregamento:</h3>
        <p className="text-sm text-gray-600">
          Se os carrosséis funcionam (setas, dots, autoplay), o Slick Carousel está carregado corretamente.
          Verifique o console do navegador para logs de carregamento.
        </p>
      </div>
    </div>
  )
}
