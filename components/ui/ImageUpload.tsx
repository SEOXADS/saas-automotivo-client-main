'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, Download } from 'lucide-react'
import Image from 'next/image'
import Button from './Button'
import { uploadTenantImage } from '@/lib/api'

interface ImageUploadProps {
  label: string
  value?: string | null
  onChange: (url: string) => void
  accept?: string
  maxSize?: number // em MB
  className?: string
  placeholder?: string
  showPreview?: boolean
  showRemove?: boolean
  imageType?: 'logo' | 'favicon' | 'banner' // Tipo de imagem para upload
}

export default function ImageUpload({
  label,
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5,
  className = '',
  showPreview = true,
  showRemove = true,
  imageType = 'logo'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput] = useState(value || '')

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`)
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Tentar upload real para o servidor
      const result = await uploadTenantImage(imageType, file)

      if (result.success && result.data?.url) {
        // Upload bem-sucedido - usar URL do servidor
        onChange(result.data.url)
        setUrlInput(result.data.url)
        console.log('✅ Upload realizado com sucesso:', result.data.url)
      } else {
        // Fallback para base64 se o upload falhar
        console.warn('⚠️ Upload falhou, usando base64 como fallback:', result.error)
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64Result = e.target?.result as string
          onChange(base64Result)
          setUrlInput(base64Result)
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('❌ Erro no upload:', error)
      setError('Erro ao fazer upload da imagem')

      // Fallback para base64 em caso de erro
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64Result = e.target?.result as string
          onChange(base64Result)
          setUrlInput(base64Result)
        }
        reader.readAsDataURL(file)
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError)
        setError('Erro ao processar a imagem')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setUrlInput(url)
    setError('')
  }

  const handleUrlBlur = () => {
    if (urlInput && urlInput !== value) {
      onChange(urlInput)
    }
  }

  const handleUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (urlInput && urlInput !== value) {
        onChange(urlInput)
      }
    }
  }

  const handleRemove = () => {
    onChange('')
    setUrlInput('')
    setError('')
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const downloadImage = () => {
    if (value && value !== '') {
      const link = document.createElement('a')
      link.href = value
      link.download = `${label.toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${value ? 'bg-gray-50' : 'bg-white'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!value || value === '' ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Arraste e solte uma imagem aqui, ou
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={isUploading}
            >
              {isUploading ? 'Fazendo Upload...' : 'Selecionar Arquivo'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG, GIF até {maxSize}MB
            </p>
          </>
        ) : (
          <div className="space-y-4">
            {/* Preview da Imagem */}
            {showPreview && (
              <div className="relative inline-block">
                <Image
                  src={value || ''}
                  alt={label}
                  width={128}
                  height={128}
                  className="max-w-full h-32 object-contain rounded border"
                  onError={() => setError('Erro ao carregar imagem')}
                />
                {showRemove && (
                  <button
                    onClick={handleRemove}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remover imagem"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Alterar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadImage}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              {showRemove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Input de URL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Ou cole a URL da imagem
        </label>
        <input
          type="url"
          value={urlInput || ''}
          onChange={handleUrlChange}
          onBlur={handleUrlBlur}
          onKeyPress={handleUrlKeyPress}
          placeholder="https://exemplo.com/imagem.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {/* Informações da Imagem */}
      {value && value !== '' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>Imagem carregada com sucesso</p>
          {value && value.startsWith('data:') && (
            <p>Imagem em base64 (temporária)</p>
          )}
        </div>
      )}
    </div>
  )
}
