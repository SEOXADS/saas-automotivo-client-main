'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Vehicle, VehicleImage } from '@/types'

interface VehicleAvatarProps {
  vehicle: Vehicle
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function VehicleAvatar({ vehicle, size = 'md', className = '' }: VehicleAvatarProps) {
  const [imageError, setImageError] = useState(false)

  // Tamanhos em pixels
  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  }

  // Classes de tamanho
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  // Função para obter a URL da imagem principal
  const getMainImageUrl = useCallback((): string | null => {
    try {
      // Priorizar main_image se existir
      if (vehicle.main_image?.image_url) {
        return vehicle.main_image.image_url
      }

      // Fallback para o array de imagens
      if (vehicle.images && vehicle.images.length > 0) {
        const primaryImage = vehicle.images.find((img: VehicleImage) => img.is_primary)
        if (primaryImage?.image_url) {
          return primaryImage.image_url
        }
        if (vehicle.images[0]?.image_url) {
          return vehicle.images[0].image_url
        }
      }

      return null
    } catch {
      return null
    }
  }, [vehicle])

  const imageUrl = getMainImageUrl()

  // Se não há imagem, mostrar fallback centralizado
  if (!imageUrl) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 font-medium text-xs ${className}`}
        style={{ minHeight: sizePixels[size] }}
      >
        <svg className="w-4 h-4 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-center leading-tight">Sem foto</span>
      </div>
    )
  }

  // Se há erro na imagem, mostrar fallback
  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex flex-col items-center justify-center text-red-500 font-medium text-xs ${className}`}
        style={{ minHeight: sizePixels[size] }}
      >
        <svg className="w-4 h-4 mb-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-center leading-tight">Erro</span>
      </div>
    )
  }

  // Renderizar imagem
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Image
        src={imageUrl}
        alt={`${vehicle.title || 'Veículo'} - ${vehicle.brand?.name || ''} ${vehicle.model?.name || ''}`}
        width={sizePixels[size]}
        height={sizePixels[size]}
        className="rounded-lg object-cover w-full h-full shadow-sm hover:shadow-md transition-shadow duration-200"
        onError={() => {
          setImageError(true)
        }}
        onLoad={() => {
          setImageError(false)
        }}
        priority={size === 'xl'} // Priorizar carregamento para imagens grandes
      />
    </div>
  )
}
