'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { VehicleImage, VehicleImageUpdate } from '@/types'
import {
  getVehicleImages,
  updateVehicleImage,
  deleteVehicleImage,
  setPrimaryImage
} from '@/lib/api'
import { showSuccess, showError, showConfirm, showLoading } from '@/lib/swal'

interface VehicleImageManagerProps {
  vehicleId: number
  onImagesChange?: (images: VehicleImage[]) => void
}

export default function VehicleImageManager({ vehicleId, onImagesChange }: VehicleImageManagerProps) {
  const [images, setImages] = useState<VehicleImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingImage, setEditingImage] = useState<VehicleImage | null>(null)

  // Carregar imagens do veículo
    const loadImages = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getVehicleImages(vehicleId)
      console.log('📦 Resposta da API de imagens:', response)

      // Extrair array de imagens da resposta da API
      let imagesArray: VehicleImage[] = []
      if (Array.isArray(response.data)) {
        imagesArray = response.data
      } else if (response.data && typeof response.data === 'object') {
        const dataObj = response.data as Record<string, unknown>
        if (Array.isArray(dataObj.images)) {
          imagesArray = dataObj.images as VehicleImage[]
        }
      }

      // Debug detalhado da resposta
      console.log('🖼️ Resposta completa da API:', response)
      console.log('🖼️ Array de imagens extraído:', imagesArray)
      console.log('🖼️ Estrutura da primeira imagem:', imagesArray[0])

      // Verificar se as URLs das imagens estão corretas
      imagesArray.forEach((img, index) => {
        console.log(`🖼️ Imagem ${index + 1}:`, {
          id: img.id,
          url: img.image_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order
        })
      })

      setImages(imagesArray)
      // Só chamar onImagesChange se for uma função estável
      if (onImagesChange && typeof onImagesChange === 'function') {
        onImagesChange(imagesArray)
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error)
      showError('Erro ao carregar imagens')
    } finally {
      setIsLoading(false)
    }
  }, [vehicleId]) // Removido onImagesChange das dependências

  useEffect(() => {
    if (vehicleId) {
      loadImages()
    }
  }, [vehicleId, loadImages])

  // Definir imagem como principal
  const handleSetPrimary = async (imageId: number) => {
    try {
      showLoading('Definindo imagem principal...')
      await setPrimaryImage(vehicleId, imageId)
      await loadImages() // Recarregar para atualizar o estado
      showSuccess('Imagem definida como principal')
    } catch (error) {
      console.error('Erro ao definir imagem principal:', error)
      showError('Erro ao definir imagem principal')
    }
  }

  // Atualizar imagem
  const handleUpdateImage = async (imageId: number, data: Partial<VehicleImageUpdate>) => {
    try {
      showLoading('Atualizando imagem...')
      await updateVehicleImage(vehicleId, imageId, data)
      await loadImages() // Recarregar para atualizar o estado
      showSuccess('Imagem atualizada com sucesso')
      setEditingImage(null)
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error)
      showError('Erro ao atualizar imagem')
    }
  }

  // Excluir imagem
  const handleDeleteImage = async (imageId: number) => {
    try {
      const confirmed = await showConfirm(
        'Tem certeza que deseja excluir esta imagem?',
        'Esta ação não pode ser desfeita.'
      )

      if (!confirmed) return

      showLoading('Excluindo imagem...')
      await deleteVehicleImage(vehicleId, imageId)
      await loadImages() // Recarregar para atualizar o estado
      showSuccess('Imagem excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir imagem:', error)
      showError('Erro ao excluir imagem')
    }
  }

  // Iniciar edição
  const startEditing = (image: VehicleImage) => {
    setEditingImage(image)
  }

  // Cancelar edição
  const cancelEditing = () => {
    setEditingImage(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhuma imagem cadastrada para este veículo.
      </div>
    )
  }

  // Debug: verificar dados das imagens
  console.log('🖼️ VehicleImageManager - Dados das imagens:', {
    total: images.length,
    images: images.map(img => ({
      id: img.id,
      url: img.image_url,
      is_primary: img.is_primary,
      sort_order: img.sort_order
    }))
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Imagens do Veículo</h3>

      {/* Imagem de Capa */}
      {images.find(img => img.is_primary) && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">🖼️ Imagem de Capa</h4>
          <div className="relative max-w-md">
            {(() => {
              const primaryImage = images.find(img => img.is_primary)
              return primaryImage && primaryImage.image_url && primaryImage.image_url.trim() !== '' ? (
                <Image
                  src={primaryImage.image_url}
                  alt="Imagem de Capa"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg border-4 border-blue-500 shadow-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg border-4 border-blue-500 shadow-lg flex flex-col items-center justify-center text-gray-500">
                  <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Sem imagem de capa</span>
                </div>
              )
            })()}
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              CAPA
            </div>
          </div>
        </div>
      )}

      {/* Todas as Imagens */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">📷 Todas as Imagens</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              {/* Imagem */}
              <div className="relative aspect-video bg-white rounded-lg overflow-hidden border border-gray-200">
                {image.image_url && image.image_url.trim() !== '' ? (
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || `Imagem ${image.sort_order + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                    priority={image.sort_order === 0} // Prioridade para a primeira imagem (LCP)
                    onError={(e) => {
                      console.error('❌ Erro ao carregar imagem:', image.image_url)
                      // Fallback visual quando a imagem falha
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      // Mostrar placeholder
                      const placeholder = document.createElement('div')
                      placeholder.className = 'w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-sm'
                      placeholder.innerHTML = `
                        <div class="text-center">
                          <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p>Erro na imagem</p>
                        </div>
                      `
                      target.parentNode?.appendChild(placeholder)
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Sem imagem</span>
                  </div>
                )}

                {/* Overlay com ações */}
                <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                    {!image.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(image.id)}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        title="Definir como principal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => startEditing(image)}
                      className="bg-yellow-600 text-white p-2 rounded-full hover:bg-yellow-700 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Badge de imagem principal */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    Principal
                  </div>
                )}

                {/* Ordem da imagem */}
                <div className="absolute top-2 right-2 bg-gray-700 bg-opacity-90 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {image.sort_order + 1}
                </div>
              </div>

              {/* Informações da imagem */}
              <div className="mt-2 text-sm text-gray-600">
                {image.alt_text && (
                  <p className="font-medium">{image.alt_text}</p>
                )}
                {image.caption && (
                  <p className="text-gray-500">{image.caption}</p>
                )}
                <p className="text-xs text-gray-400">
                  {image.width && image.height && `${image.width}x${image.height}`}
                  {image.file_size && ` • ${(image.file_size / 1024).toFixed(1)}KB`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de edição */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Imagem</h3>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleUpdateImage(editingImage.id, {
                alt_text: formData.get('alt_text') as string,
                caption: formData.get('caption') as string,
                sort_order: parseInt(formData.get('sort_order') as string)
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto Alternativo
                  </label>
                  <input
                    type="text"
                    name="alt_text"
                    defaultValue={editingImage.alt_text || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição da imagem para acessibilidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Legenda
                  </label>
                  <textarea
                    name="caption"
                    defaultValue={editingImage.caption || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Legenda da imagem"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    defaultValue={editingImage.sort_order}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
