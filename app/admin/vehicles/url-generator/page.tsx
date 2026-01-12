'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Save, ArrowLeft, RefreshCw, Plus, Trash2 } from 'lucide-react'
import { vehicleUrlApiHelpers } from '@/lib/vehicle-url-api'
import { generateAllVehicleUrls, checkUrlDuplicates, generateCanonicalUrls } from '@/lib/vehicle-url-generator'
import { SpinTextConfig, SyntaxTextConfig, UrlGenerationRequest, VehicleUrlGeneration } from '@/types/vehicle-urls'

export default function VehicleUrlGeneratorPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estados para configurações
  const [spinTextConfigs, setSpinTextConfigs] = useState<SpinTextConfig[]>([])
  const [syntaxTextConfigs, setSyntaxTextConfigs] = useState<SyntaxTextConfig[]>([])

  // Estados para geração de URLs
  const [vehicleData, setVehicleData] = useState<UrlGenerationRequest>({
    vehicle_id: 0,
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    city: '',
    state: '',
    neighborhood: '',
    language: 'pt-BR'
  })

  const [generatedUrls, setGeneratedUrls] = useState<VehicleUrlGeneration[]>([])
  const [duplicateCheck, setDuplicateCheck] = useState<{ url: string; is_duplicate: boolean; duplicates: string[] }[]>([])
  const [canonicalUrls, setCanonicalUrls] = useState<string[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    loadConfigurations()
  }, [isAuthenticated, router])

  const loadConfigurations = async () => {
    setIsLoading(true)
    try {
      const [spinTexts, syntaxTexts] = await Promise.all([
        vehicleUrlApiHelpers.getSpinTextConfigs(),
        vehicleUrlApiHelpers.getSyntaxTextConfigs()
      ])

      setSpinTextConfigs(spinTexts)
      setSyntaxTextConfigs(syntaxTexts)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateUrls = async () => {
    if (!vehicleData.brand || !vehicleData.model) {
      alert('Preencha pelo menos a marca e modelo do veículo')
      return
    }

    setIsGenerating(true)
    try {
      // Gerar URLs localmente primeiro
      const localGeneratedUrls = generateAllVehicleUrls(vehicleData)
      setGeneratedUrls(localGeneratedUrls)

      // Verificar duplicidades
      const allUrls = localGeneratedUrls.flatMap(item => [
        item.canonical_url,
        ...item.related_urls,
        ...item.spintext_variations,
        ...item.syntaxtext_variations
      ])

      const duplicates = checkUrlDuplicates(allUrls)
      setDuplicateCheck(duplicates)

      // Gerar URLs canônicas
      const canonical = generateCanonicalUrls(vehicleData)
      setCanonicalUrls(canonical)

      // Enviar para API para validação final
      const apiResponse = await vehicleUrlApiHelpers.generateVehicleUrls(vehicleData)

      if (apiResponse.success) {
        alert(`URLs geradas com sucesso! ${apiResponse.generated_urls.length} URLs criadas.`)
        if (apiResponse.duplicates_found.length > 0) {
          alert(`Atenção: ${apiResponse.duplicates_found.length} URLs duplicadas encontradas.`)
        }
      } else {
        alert(`Erro ao gerar URLs: ${apiResponse.message}`)
      }
    } catch (error) {
      console.error('Erro ao gerar URLs:', error)
      alert('Erro ao gerar URLs')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveConfigurations = async () => {
    setIsSaving(true)
    try {
      // Salvar configurações do SpinText
      for (const config of spinTextConfigs) {
        if (config.id) {
          await vehicleUrlApiHelpers.updateSpinTextConfig(config.id, config)
        } else {
          await vehicleUrlApiHelpers.createSpinTextConfig(config)
        }
      }

      // Salvar configurações do SyntaxText
      for (const config of syntaxTextConfigs) {
        if (config.id) {
          await vehicleUrlApiHelpers.updateSyntaxTextConfig(config.id, config)
        } else {
          await vehicleUrlApiHelpers.createSyntaxTextConfig(config)
        }
      }

      alert('Configurações salvas com sucesso!')
      loadConfigurations()
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  const addSpinTextConfig = () => {
    setSpinTextConfigs(prev => [...prev, {
      id: 0,
      name: '',
      pattern: '',
      variations: [''],
      is_active: true,
      created_at: '',
      updated_at: ''
    }])
  }

  const removeSpinTextConfig = (index: number) => {
    setSpinTextConfigs(prev => prev.filter((_, i) => i !== index))
  }

  const updateSpinTextConfig = (index: number, field: keyof SpinTextConfig, value: string | boolean | string[]) => {
    setSpinTextConfigs(prev => prev.map((config, i) =>
      i === index ? { ...config, [field]: value } : config
    ))
  }

  // Funções para SyntaxText (não implementadas na UI ainda)
  // const addSyntaxTextConfig = () => { ... }
  // const removeSyntaxTextConfig = (index: number) => { ... }
  // const updateSyntaxTextConfig = (index: number, field: keyof SyntaxTextConfig, value: string | boolean | string[]) => { ... }

  if (isLoading) {
    return (
      <AdminLayout title="Gerador de URLs" subtitle="Configure e gere URLs para veículos">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando configurações...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Gerador de URLs" subtitle="Configure e gere URLs para veículos">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerador de URLs</h1>
              <p className="text-gray-600">Configure SpinText, SyntaxText e gere URLs para veículos</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleSaveConfigurations}
              variant="outline"
              icon={<Save className="w-4 h-4" />}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button
              onClick={handleGenerateUrls}
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              disabled={isGenerating}
            >
              {isGenerating ? 'Gerando...' : 'Gerar URLs'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Veículo */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Dados do Veículo
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID do Veículo *
                    </label>
                    <input
                      type="number"
                      value={vehicleData.vehicle_id || ''}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, vehicle_id: Number(e.target.value) }))}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano *
                    </label>
                    <input
                      type="number"
                      value={vehicleData.year}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, year: Number(e.target.value) }))}
                      placeholder="2023"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca *
                    </label>
                    <input
                      type="text"
                      value={vehicleData.brand}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Honda"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      value={vehicleData.model}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Civic"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={vehicleData.city || ''}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="São Paulo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={vehicleData.state || ''}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="SP"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={vehicleData.neighborhood || ''}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      placeholder="Vila Madalena"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linguagem
                  </label>
                  <select
                    value={vehicleData.language || 'pt-BR'}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Configurações SpinText */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Configurações SpinText
                </h2>
                <Button
                  onClick={addSpinTextConfig}
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Adicionar
                </Button>
              </div>

              <div className="space-y-4">
                {spinTextConfigs.map((config, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={config.name}
                          onChange={(e) => updateSpinTextConfig(index, 'name', e.target.value)}
                          placeholder="comprar-carro"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Padrão
                        </label>
                        <input
                          type="text"
                          value={config.pattern}
                          onChange={(e) => updateSpinTextConfig(index, 'pattern', e.target.value)}
                          placeholder="{brand_slug}-{model_slug}"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variações (uma por linha)
                      </label>
                      <textarea
                        value={config.variations.join('\n')}
                        onChange={(e) => updateSpinTextConfig(index, 'variations', e.target.value.split('\n'))}
                        placeholder="comprar-carro&#10;comprar-carro-seminovo&#10;comprar-carro-novo"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.is_active}
                          onChange={(e) => updateSpinTextConfig(index, 'is_active', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Ativo
                        </label>
                      </div>
                      <Button
                        onClick={() => removeSpinTextConfig(index)}
                        variant="outline"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {/* URLs Geradas */}
            {generatedUrls.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  URLs Geradas ({generatedUrls.length})
                </h2>

                <div className="space-y-3">
                  {generatedUrls.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {item.brand_slug}-{item.model_slug}-{item.year}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        <strong>Canônica:</strong> {item.canonical_url}
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Relacionadas:</strong> {item.related_urls.length} URLs
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verificação de Duplicidades */}
            {duplicateCheck.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Verificação de Duplicidades
                </h2>

                <div className="space-y-2">
                  {duplicateCheck.filter(item => item.is_duplicate).map((item, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-red-900">
                        {item.url}
                      </div>
                      <div className="text-xs text-red-700">
                        Duplicatas: {item.duplicates.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URLs Canônicas */}
            {canonicalUrls.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  URLs Canônicas ({canonicalUrls.length})
                </h2>

                <div className="space-y-2">
                  {canonicalUrls.map((url, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-900">
                        {url}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
