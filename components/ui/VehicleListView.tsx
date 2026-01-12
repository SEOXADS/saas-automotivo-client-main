'use client'

import { useState } from 'react'
import { Vehicle } from '@/types'
import VehicleCard from './VehicleCard'

interface VehicleListViewProps {
  vehicles: Vehicle[]
}

export default function VehicleListView({
  vehicles
}: VehicleListViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  if (viewMode === 'cards') {
    return (
      <div className="space-y-4">
        {/* Controles de visualização */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              📊 Tabela
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white"
            >
              🎴 Cards
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} encontrado{vehicles.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            // Converter o tipo de main_image para compatibilidade com VehicleCard
            const convertedVehicle = {
              ...vehicle,
              main_image: vehicle.main_image?.url || null,
              city: (vehicle as Vehicle & { city?: string }).city || null,
              price: vehicle.price ? parseFloat(vehicle.price) : null,
              brand: vehicle.brand?.name || 'Marca',
              model: vehicle.model?.name || 'Modelo'
            }

            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={convertedVehicle}
              />
            )
          })}
        </div>

        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Nenhum veículo encontrado</div>
            <div className="text-gray-400 text-sm mt-2">
              Tente ajustar os filtros ou adicionar um novo veículo
            </div>
          </div>
        )}
      </div>
    )
  }

  // Modo tabela (será implementado pelo componente pai)
  return null
}
