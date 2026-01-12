import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import { generateVehicleUrl, normalizeTransmissionDisplay, normalizeFuelTypeDisplay } from '@/lib/slug-utils'

interface VehicleCardProps {
  vehicle: {
    id: number
    title: string
    main_image: string | null
    city?: string | null
    price: number | null
    year: number | null
    mileage: number | null
    fuel_type: string | null
    transmission: string | null
    brand: string | { name: string } | null
    model: string | { name: string } | null
    status?: string | null
  }
  className?: string
}

// Função para extrair nome da marca
const getBrandName = (brand: string | { name: string } | null): string => {
  if (!brand) return 'Marca'
  if (typeof brand === 'string') return brand
  return brand.name || 'Marca'
}

// Função para extrair nome do modelo
const getModelName = (model: string | { name: string } | null): string => {
  if (!model) return 'Modelo'
  if (typeof model === 'string') return model
  return model.name || 'Modelo'
}

// Função para extrair as primeiras 2 palavras do título
const getShortTitle = (title: string): string => {
  const words = title.split(' ').slice(0, 2)
  return words.join(' ')
}

// Função para gerar avaliação aleatória entre 4 e 5 estrelas
const getRandomRating = (vehicleId: number) => {
  // Usar o ID do veículo como seed para consistência
  const seed = vehicleId * 12345
  const random = (seed % 100) / 100

  // Rating entre 4.0 e 5.0
  const rating = 4.0 + (random * 1.0)

  // Número de avaliações entre 1000 e 9999
  const reviews = 1000 + Math.floor(random * 9000)

  return {
    rating: Math.round(rating * 10) / 10, // Arredondar para 1 casa decimal
    reviews
  }
}

export default function VehicleCard({
  vehicle,
  className = ''
}: VehicleCardProps) {
  const { rating, reviews } = getRandomRating(vehicle.id)
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  // Gerar URL com slug (incluindo ID)
  const vehicleUrl = generateVehicleUrl({
    id: vehicle.id,
    brand: getBrandName(vehicle.brand),
    model: getModelName(vehicle.model),
    year: vehicle.year || undefined,
    fuel_type: vehicle.fuel_type || undefined,
    transmission: vehicle.transmission || undefined
  })

  return (
    <Link
      href={vehicleUrl}
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full ${className}`}
      title={`Ver detalhes do ${vehicle.title}`}
      aria-label={`Ver detalhes do ${vehicle.title}`}
      itemScope
      itemType="https://schema.org/Car"
    >
      {/* Imagem do Veículo */}
      <div className="relative h-48 bg-gray-100">
        {vehicle.main_image ? (
          <Image
            src={vehicle.main_image}
            alt={`${vehicle.title} - ${getBrandName(vehicle.brand)} ${vehicle.year} - Clique para ver detalhes`}
            title={`${vehicle.title} - ${getBrandName(vehicle.brand)} ${vehicle.year}`}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <i className="bx bx-car text-6xl"></i>
          </div>
        )}

        {/* Badges no canto superior esquerdo */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="bg-gray-800 text-white px-2 rounded-md text-xs font-semibold">
            {getBrandName(vehicle.brand)}
          </div>
          <div className="bg-green-500 text-white px-2 rounded-md text-xs font-semibold">
            Disponível
          </div>
        </div>

        {/* Ícone de favorito no canto superior direito */}
        <div className="absolute top-3 right-3">
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <i className="bx bx-heart text-gray-600 hover:text-red-500 transition-colors text-sm"></i>
          </button>
        </div>

        {/* Localização no canto inferior esquerdo */}
        <div className="absolute bottom-3 left-3 flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <i className="bx bx-map-pin text-gray-600 mr-1 text-xs"></i>
          <span className="text-gray-800 font-medium text-xs">{vehicle.city || 'São Paulo'}</span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex flex-col flex-1">
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight" title={`${vehicle.title} - Clique para ver detalhes`}>
          <span itemProp="name">{vehicle.title}</span>
        </h3>

        {/* Microdados ocultos */}
        <div style={{ display: 'none' }}>
          <div itemProp="brand" itemScope itemType="https://schema.org/Brand">
            <span itemProp="name">{getBrandName(vehicle.brand)}</span>
          </div>
          <span itemProp="model">{typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name || 'Modelo'}</span>
          <span itemProp="vehicleModelDate">{vehicle.year}</span>
          <span itemProp="vehicleTransmission">{normalizeTransmissionDisplay(vehicle.transmission || '') || 'Automático'}</span>
          <span itemProp="fuelType">{normalizeFuelTypeDisplay(vehicle.fuel_type || '') || 'Flex'}</span>
          <span itemProp="mileageFromOdometer">{vehicle.mileage || 150000}</span>
        </div>

        {/* Preço com Oferta */}
        <div className="mb-3" itemScope itemType="https://schema.org/Offer">
          {/* Valor original riscado */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 line-through">
              {formatPrice((vehicle.price || 0) + 100000)}
            </span>
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <i className="bx bx-tag text-xs"></i>
              OFERTA
            </span>
          </div>
          {/* Preço atual */}
          <div className="text-xl font-bold text-gray-900">
            <span itemProp="price">{formatPrice(vehicle.price)}</span>
            <meta itemProp="priceCurrency" content="BRL" />
            <meta itemProp="availability" content="https://schema.org/InStock" />
          </div>
        </div>

        {/* Rating e Localização */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => {
                if (i < fullStars) {
                  return <i key={i} className="bx bxs-star text-sm text-yellow-400"></i>
                } else if (i === fullStars && hasHalfStar) {
                  return <i key={i} className="bx bxs-star-half text-sm text-yellow-400"></i>
                } else {
                  return <i key={i} className="bx bxs-star text-sm text-gray-300"></i>
                }
              })}
            </div>
            <span className="text-gray-500 text-sm">({rating}) {reviews.toLocaleString()}</span>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-200 mb-3"></div>

        {/* Especificações */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <i className="bx bx-cog text-gray-400 mr-2 text-sm"></i>
            <span className="text-sm font-medium uppercase">{normalizeTransmissionDisplay(vehicle.transmission || '') || 'Automático'}</span>
          </div>
          <div className="flex items-center">
            <i className="bx bx-tachometer text-gray-400 mr-2 text-sm"></i>
            <span className="text-sm font-medium">{vehicle.mileage ? `${vehicle.mileage} KM` : '150.000 KM'}</span>
          </div>
          <div className="flex items-center">
            <i className="bx bx-gas-pump text-gray-400 mr-2 text-sm"></i>
            <span className="text-sm font-medium uppercase">{normalizeFuelTypeDisplay(vehicle.fuel_type || '') || 'Flex'}</span>
          </div>
          <div className="flex items-center">
            <i className="bx bx-calendar text-gray-400 mr-2 text-sm"></i>
            <span className="text-sm font-medium">{vehicle.year || '2024'}</span>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="mt-auto">
          <div className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold text-center block text-base">
            Comprar {getShortTitle(vehicle.title)}
          </div>
        </div>
      </div>
    </Link>
  )
}
