// 🚗 Dados Mock para Endpoints FIPE
// Usado quando a API FIPE não está disponível (modo demo)

import {
  FipeReference,
  FipeBrand,
  FipeModel,
  FipeYear,
  FipeVehicle,
  VehicleType
} from '../types/fipe'

// Referências de meses da FIPE
export const mockFipeReferences: FipeReference[] = [
  { id: 1, month: 'Janeiro 2025', code: 324, year: 2025, is_active: true },
  { id: 2, month: 'Dezembro 2024', code: 323, year: 2024, is_active: false },
  { id: 3, month: 'Novembro 2024', code: 322, year: 2024, is_active: false },
  { id: 4, month: 'Outubro 2024', code: 321, year: 2024, is_active: false }
]

// Marcas por tipo de veículo
export const mockFipeBrands: Record<VehicleType, FipeBrand[]> = {
  cars: [
    { id: 1, name: 'Toyota', code: 'TOYOTA', vehicle_type: 'cars', is_active: true },
    { id: 2, name: 'Honda', code: 'HONDA', vehicle_type: 'cars', is_active: true },
    { id: 3, name: 'Ford', code: 'FORD', vehicle_type: 'cars', is_active: true },
    { id: 4, name: 'Volkswagen', code: 'VOLKSWAGEN', vehicle_type: 'cars', is_active: true },
    { id: 5, name: 'Chevrolet', code: 'CHEVROLET', vehicle_type: 'cars', is_active: true },
    { id: 6, name: 'Hyundai', code: 'HYUNDAI', vehicle_type: 'cars', is_active: true },
    { id: 7, name: 'Nissan', code: 'NISSAN', vehicle_type: 'cars', is_active: true },
    { id: 8, name: 'BMW', code: 'BMW', vehicle_type: 'cars', is_active: true }
  ],
  motorcycles: [
    { id: 101, name: 'Honda', code: 'HONDA', vehicle_type: 'motorcycles', is_active: true },
    { id: 102, name: 'Yamaha', code: 'YAMAHA', vehicle_type: 'motorcycles', is_active: true },
    { id: 103, name: 'Suzuki', code: 'SUZUKI', vehicle_type: 'motorcycles', is_active: true },
    { id: 104, name: 'Kawasaki', code: 'KAWASAKI', vehicle_type: 'motorcycles', is_active: true },
    { id: 105, name: 'Ducati', code: 'DUCATI', vehicle_type: 'motorcycles', is_active: true }
  ],
  trucks: [
    { id: 201, name: 'Volkswagen', code: 'VOLKSWAGEN', vehicle_type: 'trucks', is_active: true },
    { id: 202, name: 'Mercedes-Benz', code: 'MERCEDES-BENZ', vehicle_type: 'trucks', is_active: true },
    { id: 203, name: 'Scania', code: 'SCANIA', vehicle_type: 'trucks', is_active: true },
    { id: 204, name: 'Volvo', code: 'VOLVO', vehicle_type: 'trucks', is_active: true },
    { id: 205, name: 'Iveco', code: 'IVECO', vehicle_type: 'trucks', is_active: true }
  ]
}

// Modelos por marca
export const mockFipeModels: Record<VehicleType, Record<number, FipeModel[]>> = {
  cars: {
    1: [ // Toyota
      { id: 1, name: 'Corolla', code: 'COROLLA', brand_id: 1, vehicle_type: 'cars', is_active: true },
      { id: 2, name: 'Camry', code: 'CAMRY', brand_id: 1, vehicle_type: 'cars', is_active: true },
      { id: 3, name: 'RAV4', code: 'RAV4', brand_id: 1, vehicle_type: 'cars', is_active: true },
      { id: 4, name: 'Hilux', code: 'HILUX', brand_id: 1, vehicle_type: 'cars', is_active: true }
    ],
    2: [ // Honda
      { id: 5, name: 'Civic', code: 'CIVIC', brand_id: 2, vehicle_type: 'cars', is_active: true },
      { id: 6, name: 'Accord', code: 'ACCORD', brand_id: 2, vehicle_type: 'cars', is_active: true },
      { id: 7, name: 'CR-V', code: 'CR-V', brand_id: 2, vehicle_type: 'cars', is_active: true },
      { id: 8, name: 'HR-V', code: 'HR-V', brand_id: 2, vehicle_type: 'cars', is_active: true }
    ],
    3: [ // Ford
      { id: 9, name: 'Focus', code: 'FOCUS', brand_id: 3, vehicle_type: 'cars', is_active: true },
      { id: 10, name: 'Fusion', code: 'FUSION', brand_id: 3, vehicle_type: 'cars', is_active: true },
      { id: 11, name: 'EcoSport', code: 'ECOSPORT', brand_id: 3, vehicle_type: 'cars', is_active: true },
      { id: 12, name: 'Ranger', code: 'RANGER', brand_id: 3, vehicle_type: 'cars', is_active: true }
    ]
  },
  motorcycles: {
    101: [ // Honda
      { id: 201, name: 'CG 150', code: 'CG150', brand_id: 101, vehicle_type: 'motorcycles', is_active: true },
      { id: 202, name: 'CB 300R', code: 'CB300R', brand_id: 101, vehicle_type: 'motorcycles', is_active: true },
      { id: 203, name: 'CB 500F', code: 'CB500F', brand_id: 101, vehicle_type: 'motorcycles', is_active: true },
      { id: 204, name: 'CBR 600RR', code: 'CBR600RR', brand_id: 101, vehicle_type: 'motorcycles', is_active: true }
    ],
    102: [ // Yamaha
      { id: 205, name: 'YBR 125', code: 'YBR125', brand_id: 102, vehicle_type: 'motorcycles', is_active: true },
      { id: 206, name: 'MT-03', code: 'MT03', brand_id: 102, vehicle_type: 'motorcycles', is_active: true },
      { id: 207, name: 'R3', code: 'R3', brand_id: 102, vehicle_type: 'motorcycles', is_active: true }
    ]
  },
  trucks: {
    201: [ // Volkswagen
      { id: 301, name: 'Delivery', code: 'DELIVERY', brand_id: 201, vehicle_type: 'trucks', is_active: true },
      { id: 302, name: 'Constellation', code: 'CONSTELLATION', brand_id: 201, vehicle_type: 'trucks', is_active: true }
    ],
    202: [ // Mercedes-Benz
      { id: 303, name: 'Sprinter', code: 'SPRINTER', brand_id: 202, vehicle_type: 'trucks', is_active: true },
      { id: 304, name: 'Actros', code: 'ACTROS', brand_id: 202, vehicle_type: 'trucks', is_active: true }
    ]
  }
}

// Anos por modelo
export const mockFipeYears: Record<VehicleType, Record<number, FipeYear[]>> = {
  cars: {
    1: [ // Corolla
      { id: 1, year: 2025, model_id: 1, brand_id: 1, vehicle_type: 'cars', is_active: true },
      { id: 2, year: 2024, model_id: 1, brand_id: 1, vehicle_type: 'cars', is_active: true },
      { id: 3, year: 2023, model_id: 1, brand_id: 1, vehicle_type: 'cars', is_active: true },
      { id: 4, year: 2022, model_id: 1, brand_id: 1, vehicle_type: 'cars', is_active: true }
    ],
    5: [ // Civic
      { id: 5, year: 2025, model_id: 5, brand_id: 2, vehicle_type: 'cars', is_active: true },
      { id: 6, year: 2024, model_id: 5, brand_id: 2, vehicle_type: 'cars', is_active: true },
      { id: 7, year: 2023, model_id: 5, brand_id: 2, vehicle_type: 'cars', is_active: true }
    ]
  },
  motorcycles: {
    201: [ // CG 150
      { id: 101, year: 2025, model_id: 201, brand_id: 101, vehicle_type: 'motorcycles', is_active: true },
      { id: 102, year: 2024, model_id: 201, brand_id: 101, vehicle_type: 'motorcycles', is_active: true },
      { id: 103, year: 2023, model_id: 201, brand_id: 101, vehicle_type: 'motorcycles', is_active: true }
    ]
  },
  trucks: {
    301: [ // Delivery
      { id: 201, year: 2025, model_id: 301, brand_id: 201, vehicle_type: 'trucks', is_active: true },
      { id: 202, year: 2024, model_id: 301, brand_id: 201, vehicle_type: 'trucks', is_active: true }
    ]
  }
}

// Veículos completos com especificações
export const mockFipeVehicles: FipeVehicle[] = [
  {
    id: 1,
    brand: mockFipeBrands.cars[0], // Toyota
    model: mockFipeModels.cars[1][0], // Corolla
    year: mockFipeYears.cars[1][0], // 2025
    vehicle_type: 'cars',
    reference: 324,
    fipe_price: 125000,
    fipe_code: '001004-9',
    fuel_type: 'Flex',
    transmission: 'Automático',
    engine_size: '2.0',
    doors: 4,
    seats: 5,
    specifications: {
      'Potência': '169 cv',
      'Torque': '20.4 kgfm',
      'Consumo urbano': '8.5 km/l',
      'Consumo rodoviário': '12.3 km/l',
      '0-100 km/h': '9.2s',
      'Velocidade máxima': '200 km/h'
    }
  },
  {
    id: 2,
    brand: mockFipeBrands.cars[1], // Honda
    model: mockFipeModels.cars[2][0], // Civic
    year: mockFipeYears.cars[5][0], // 2025
    vehicle_type: 'cars',
    reference: 324,
    fipe_price: 135000,
    fipe_code: '001005-7',
    fuel_type: 'Flex',
    transmission: 'Automático',
    engine_size: '2.0',
    doors: 4,
    seats: 5,
    specifications: {
      'Potência': '155 cv',
      'Torque': '19.4 kgfm',
      'Consumo urbano': '8.8 km/l',
      'Consumo rodoviário': '12.8 km/l',
      '0-100 km/h': '8.9s',
      'Velocidade máxima': '195 km/h'
    }
  },
  {
    id: 3,
    brand: mockFipeBrands.motorcycles[0], // Honda
    model: mockFipeModels.motorcycles[101][0], // CG 150
    year: mockFipeYears.motorcycles[201][0], // 2025
    vehicle_type: 'motorcycles',
    reference: 324,
    fipe_price: 8500,
    fipe_code: '001006-5',
    fuel_type: 'Flex',
    transmission: 'Manual',
    engine_size: '150cc',
    doors: 0,
    seats: 2,
    specifications: {
      'Potência': '13.1 cv',
      'Torque': '1.2 kgfm',
      'Consumo urbano': '35 km/l',
      'Consumo rodoviário': '45 km/l',
      '0-100 km/h': 'N/A',
      'Velocidade máxima': '110 km/h'
    }
  }
]

// Funções auxiliares para buscar dados mock
export const getMockFipeBrands = (vehicleType: VehicleType): FipeBrand[] => {
  return mockFipeBrands[vehicleType] || []
}

export const getMockFipeModels = (vehicleType: VehicleType, brandId: number): FipeModel[] => {
  return mockFipeModels[vehicleType]?.[brandId] || []
}

export const getMockFipeYears = (vehicleType: VehicleType, brandId: number, modelId: number): FipeYear[] => {
  return mockFipeYears[vehicleType]?.[modelId] || []
}

export const getMockFipeVehicle = (
  vehicleType: VehicleType,
  brandId: number,
  modelId: number,
  yearId: number
): FipeVehicle | undefined => {
  return mockFipeVehicles.find(vehicle =>
    vehicle.vehicle_type === vehicleType &&
    vehicle.brand.id === brandId &&
    vehicle.model.id === modelId &&
    vehicle.year.id === yearId
  )
}

export const searchMockFipeVehicles = (params: {
  vehicle_type: VehicleType
  brand_id?: number
  model_id?: number
  year?: number
}): FipeVehicle[] => {
  return mockFipeVehicles.filter(vehicle => {
    if (vehicle.vehicle_type !== params.vehicle_type) return false
    if (params.brand_id && vehicle.brand.id !== params.brand_id) return false
    if (params.model_id && vehicle.model.id !== params.model_id) return false
    if (params.year && vehicle.year.year !== params.year) return false
    return true
  })
}
