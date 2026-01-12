import PortalLayout from '../portal/layout'

export default function VenderCarroPage() {
  return (
    <PortalLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vender Carro</h1>
          <p className="text-xl text-gray-600 mb-8">
            Em breve você poderá vender seu carro através desta página.
          </p>
          <a
            href="/comprar-carro"
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors"
          >
            Ver Carros à Venda
          </a>
        </div>
      </div>
    </PortalLayout>
  )
}
