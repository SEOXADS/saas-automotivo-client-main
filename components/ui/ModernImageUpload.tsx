'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { showSuccess, showError, showLoading, closeAlert } from '@/lib/swal'

interface ModernImageUploadProps {
  label: string
  value: string
  onChange: (url: string) => void
  imageType: 'logo' | 'favicon' | 'banner'
  maxSize?: number // em MB
  className?: string
  description?: string
  required?: boolean
}

const ModernImageUpload: React.FC<ModernImageUploadProps> = ({
  label,
  value,
  onChange,
  imageType,
  maxSize = 5,
  className = '',
  description,
  required = false
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Importar a função de upload
  const uploadTenantImage = useCallback(async (file: File) => {
    try {
      console.log(`🖼️ Fazendo upload de ${imageType}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        imageType: imageType
      })

      // Log específico para favicon
      if (imageType === 'favicon') {
        console.log('🔍 Upload específico do favicon:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          isImage: file.type.startsWith('image/'),
          maxSizeAllowed: maxSize * 1024 * 1024
        })
      }

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione apenas arquivos de imagem')
      }

      // Validar tamanho
      const maxSizeBytes = maxSize * 1024 * 1024
      if (file.size > maxSizeBytes) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`)
      }

      // Criar FormData seguindo o mesmo padrão dos veículos
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', imageType)

      // Tentar upload para endpoint específico do tenant
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenant/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        const uploadResult = {
          success: true,
          url: result.image_url || result.url
        }

        // Log específico para favicon
        if (imageType === 'favicon') {
          console.log('✅ Upload do favicon bem-sucedido:', {
            result: result,
            finalUrl: uploadResult.url,
            urlLength: uploadResult.url?.length || 0
          })
        }

        return uploadResult
      } else {
        const errorText = await response.text()
        console.error(`❌ Erro no upload do ${imageType}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Erro no servidor: ${response.status}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.warn('⚠️ Upload para servidor falhou, usando base64 como fallback:', errorMessage)

      // Fallback para base64
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64Result = e.target?.result as string
          const fallbackResult = {
            success: true,
            url: base64Result
          }

          // Log específico para favicon fallback
          if (imageType === 'favicon') {
            console.log('⚠️ Favicon usando fallback Base64:', {
              base64Length: base64Result.length,
              isDataUrl: base64Result.startsWith('data:image/'),
              error: errorMessage
            })
          }

          resolve(fallbackResult)
        }
        reader.onerror = () => {
          const errorResult = {
            success: false,
            error: 'Erro ao processar a imagem'
          }

          // Log específico para favicon error
          if (imageType === 'favicon') {
            console.error('❌ Erro no processamento do favicon:', errorResult)
          }

          resolve(errorResult)
        }
        reader.readAsDataURL(file)
      })
    }
  }, [imageType, maxSize])

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    setError('')
    setSuccess(false)
    showLoading(`Enviando ${imageType}...`)

    try {
      const result = await uploadTenantImage(file) as { success: boolean; url?: string; error?: string }

      closeAlert() // Fechar loading

      if (result.success && result.url) {
        onChange(result.url)
        setSuccess(true)
        await showSuccess(
          `${imageType.charAt(0).toUpperCase() + imageType.slice(1)} enviado com sucesso!`,
          '✅ Upload Concluído'
        )
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const errorMsg = result.error || 'Erro ao fazer upload da imagem'
        setError(errorMsg)
        await showError(errorMsg, '❌ Erro no Upload')
      }
    } catch (error: unknown) {
      closeAlert() // Fechar loading se houver erro
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar a imagem'
      setError(errorMessage)
      await showError(errorMessage, '❌ Erro no Upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleRemove = () => {
    onChange('')
    setError('')
    setSuccess(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getImageDimensions = () => {
    switch (imageType) {
      case 'logo':
        return { width: 200, height: 100 }
      case 'favicon':
        return { width: 64, height: 64 }
      case 'banner':
        return { width: 400, height: 200 }
      default:
        return { width: 200, height: 200 }
    }
  }

  const getRecommendedSize = () => {
    switch (imageType) {
      case 'logo':
        return 'Recomendado: 200x100px'
      case 'favicon':
        return 'Recomendado: 64x64px (quadrado)'
      case 'banner':
        return 'Recomendado: 1200x400px'
      default:
        return ''
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {value && (
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${success ? 'border-green-300 bg-green-50' : ''}
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {value ? (
          // Preview da imagem
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Image
                src={value}
                alt={label}
                {...getImageDimensions()}
                className="object-contain rounded border"
                onError={() => setError('Erro ao carregar imagem')}
              />
              {success && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Imagem carregada com sucesso</p>
              <p className="text-xs text-gray-500">{getRecommendedSize()}</p>
            </div>
          </div>
        ) : (
          // Área de upload vazia
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {isUploading ? 'Enviando...' : 'Clique ou arraste uma imagem aqui'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getRecommendedSize()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Máximo {maxSize}MB • JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <Check className="h-4 w-4" />
          <span>Imagem enviada com sucesso!</span>
        </div>
      )}
    </div>
  )
}

export default ModernImageUpload
