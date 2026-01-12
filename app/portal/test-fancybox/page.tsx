'use client'

import { useEffect } from 'react'

export default function TestFancyboxPage() {
  useEffect(() => {
    // Aguardar um pouco para os plugins carregarem
    setTimeout(() => {
      console.log('🧪 Testando Fancybox...')
    }, 2000)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Teste Fancybox</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Galeria de Imagens Simples</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/portal/assets/img/cars/car-01.jpg"
            data-fancybox="gallery1"
            className="block"
          >
            <img
              src="/portal/assets/img/cars/car-01.jpg"
              alt="Carro 1"
              className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
          <a
            href="/portal/assets/img/cars/car-02.jpg"
            data-fancybox="gallery1"
            className="block"
          >
            <img
              src="/portal/assets/img/cars/car-02.jpg"
              alt="Carro 2"
              className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
          <a
            href="/portal/assets/img/cars/car-03.jpg"
            data-fancybox="gallery1"
            className="block"
          >
            <img
              src="/portal/assets/img/cars/car-03.jpg"
              alt="Carro 3"
              className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
          <a
            href="/portal/assets/img/cars/car-04.jpg"
            data-fancybox="gallery1"
            className="block"
          >
            <img
              src="/portal/assets/img/cars/car-04.jpg"
              alt="Carro 4"
              className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Galeria com Títulos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <a
            href="/portal/assets/img/cars/car-01.jpg"
            data-fancybox="gallery2"
            data-caption="Honda Civic 2023 - Automático, 2.0L, Gasolina"
            className="block"
          >
            <img
              src="/portal/assets/img/cars/car-01.jpg"
              alt="Honda Civic"
              className="w-full h-40 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
            <p className="mt-2 text-sm font-medium">Honda Civic 2023</p>
          </a>
          <a
            href="/portal/assets/img/cars/car-02.jpg"
            data-fancybox="gallery2"
            data-caption="Toyota Corolla 2023 - Automático, 2.0L, Flex"
            className="block"
          >
            <img
              src="/portal/assets/img/cars/car-02.jpg"
              alt="Toyota Corolla"
              className="w-full h-40 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
            <p className="mt-2 text-sm font-medium">Toyota Corolla 2023</p>
          </a>
          <a
            href="/portal/assets/img/cars/car-03.jpg"
            data-fancybox="gallery2"
            data-caption="Volkswagen Jetta 2023 - Automático, 1.4L, Flex"
            className="block"
          >
            <img
              src="/portal/assets/img/cars/car-03.jpg"
              alt="Volkswagen Jetta"
              className="w-full h-40 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
            <p className="mt-2 text-sm font-medium">Volkswagen Jetta 2023</p>
          </a>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Imagem Individual</h2>
        <div className="flex justify-center">
          <a
            href="/portal/assets/img/cars/car-01.jpg"
            data-fancybox="single"
            data-caption="Imagem individual do veículo"
            className="block"
          >
            <img
              src="/portal/assets/img/cars/car-01.jpg"
              alt="Imagem individual"
              className="w-64 h-48 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Botões de Teste</h2>
        <div className="flex gap-4">
          <a
            href="/portal/assets/img/cars/car-01.jpg"
            data-fancybox="buttons"
            data-caption="Teste de botão"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <i className="bx bx-image mr-2"></i>
            Abrir Imagem
          </a>
          <a
            href="/portal/assets/img/cars/car-02.jpg"
            data-fancybox="buttons"
            data-caption="Outro teste"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <i className="bx bx-photo mr-2"></i>
            Ver Foto
          </a>
        </div>
      </div>

      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Status do Carregamento:</h3>
        <p className="text-sm text-gray-600">
          Se as imagens abrem em modal com zoom, navegação e controles, o Fancybox está funcionando.
          Verifique o console do navegador para logs de carregamento.
        </p>
        <div className="mt-2 text-xs text-gray-500">
          <p>• Clique nas imagens para abrir no Fancybox</p>
          <p>• Use as setas para navegar entre imagens da mesma galeria</p>
          <p>• Use os controles de zoom e rotação</p>
        </div>
      </div>
    </div>
  )
}
