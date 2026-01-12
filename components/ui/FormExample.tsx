'use client'

import { useState } from 'react'
import { Input, Select, Select2, Textarea, Checkbox, Radio } from './index'

export default function FormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vehicleType: '',
    brand: '',
    description: '',
    acceptTerms: false,
    condition: 'used'
  })

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Exemplo de Formulário Padronizado</h2>

      {/* Input padrão */}
      <Input
        label="Nome Completo"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        placeholder="Digite seu nome completo"
        helperText="Nome como aparece no documento"
      />

      {/* Input com erro */}
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        placeholder="seu@email.com"
        error="Email inválido"
      />

      {/* Select padrão */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Veículo</label>
        <Select
          value={formData.vehicleType}
          onChange={(e) => handleInputChange('vehicleType', e.target.value)}
          options={[
            { value: 'car', label: '🚗 Carro' },
            { value: 'motorcycle', label: '🏍️ Moto' },
            { value: 'truck', label: '🚛 Caminhão' }
          ]}
          placeholder="Selecione o tipo"
        />
      </div>

      {/* Select2 avançado */}
      <Select2
        value={formData.brand}
        onChange={(value) => handleInputChange('brand', value)}
        options={[
          { value: 'toyota', label: 'Toyota' },
          { value: 'honda', label: 'Honda' },
          { value: 'ford', label: 'Ford' },
          { value: 'chevrolet', label: 'Chevrolet' }
        ]}
        placeholder="Selecione a marca"
      />

      {/* Textarea */}
      <Textarea
        label="Descrição"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Descreva o veículo..."
        rows={4}
        helperText="Mínimo 10 caracteres"
      />

      {/* Checkbox */}
      <Checkbox
        label="Aceito os termos e condições"
        checked={formData.acceptTerms}
        onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
        variant="success"
      />

      {/* Radio buttons */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Condição do Veículo
        </label>
        <div className="flex gap-3">
          <Radio
            label="0km"
            value="new"
            checked={formData.condition === 'new'}
            onChange={(e) => handleInputChange('condition', e.target.value)}
          />
          <Radio
            label="Usado"
            value="used"
            checked={formData.condition === 'used'}
            onChange={(e) => handleInputChange('condition', e.target.value)}
          />
        </div>
      </div>

      {/* Botão de envio */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        🚗 Enviar Formulário
      </button>
    </div>
  )
}
