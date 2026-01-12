'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Input, Button, Checkbox, Select } from '@/components/ui'
import { Package, Key, Globe, Database, Zap, Save, TestTube, Eye, EyeOff, Settings } from 'lucide-react'

interface IntegrationSettings {
  // APIs Externas
  webmotors_api_key: string
  webmotors_api_secret: string
  olx_api_key: string
  olx_api_secret: string
  icarros_api_key: string
  icarros_api_secret: string

  // Serviços de Email
  smtp_host: string
  smtp_port: string
  smtp_username: string
  smtp_password: string
  smtp_encryption: 'tls' | 'ssl' | 'none'
  from_email: string
  from_name: string

  // Serviços de Pagamento
  stripe_public_key: string
  stripe_secret_key: string
  stripe_webhook_secret: string
  paypal_client_id: string
  paypal_secret: string

  // Serviços de Armazenamento
  aws_access_key: string
  aws_secret_key: string
  aws_region: string
  aws_bucket: string
  cloudinary_cloud_name: string
  cloudinary_api_key: string
  cloudinary_api_secret: string

  // Outros Serviços
  google_maps_api_key: string
  recaptcha_site_key: string
  recaptcha_secret_key: string
  facebook_app_id: string
  facebook_app_secret: string

  // Configurações
  enable_webhooks: boolean
  webhook_url: string
  enable_logs: boolean
  log_level: 'debug' | 'info' | 'warning' | 'error'
}

export default function IntegrationsSettingsPage() {
  const { user, token } = useAuth()
  const [settings, setSettings] = useState<IntegrationSettings>({
    // APIs Externas
    webmotors_api_key: '',
    webmotors_api_secret: '',
    olx_api_key: '',
    olx_api_secret: '',
    icarros_api_key: '',
    icarros_api_secret: '',

    // Serviços de Email
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: '',
    from_name: '',

    // Serviços de Pagamento
    stripe_public_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    paypal_client_id: '',
    paypal_secret: '',

    // Serviços de Armazenamento
    aws_access_key: '',
    aws_secret_key: '',
    aws_region: '',
    aws_bucket: '',
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_api_secret: '',

    // Outros Serviços
    google_maps_api_key: '',
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
    facebook_app_id: '',
    facebook_app_secret: '',

    // Configurações
    enable_webhooks: false,
    webhook_url: '',
    enable_logs: true,
    log_level: 'info'
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  // Carregar configurações atuais
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/integrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          ...data.data
        }))
      }
    } catch {
      // Silenciar erro para não bloquear a interface
    }
  }

  const handleInputChange = (field: keyof IntegrationSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setMessage(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/integrations`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações de integrações salvas com sucesso!' })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.message || 'Erro ao salvar configurações' })
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' })
    } finally {
      setIsSaving(false)
    }
  }

  const testIntegration = async (type: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/integrations/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `Teste de ${type} realizado com sucesso!` })
      } else {
        setMessage({ type: 'error', text: `Erro no teste de ${type}` })
      }
    } catch {
      setMessage({ type: 'error', text: `Erro ao testar ${type}` })
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Integrações e APIs</h2>
        <p className="text-gray-600">Configure as integrações com serviços externos e APIs</p>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* APIs de Importação */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <Package className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">APIs de Importação de Veículos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Webmotors</h4>
              <Input
                label="API Key"
                value={settings.webmotors_api_key}
                onChange={(e) => handleInputChange('webmotors_api_key', e.target.value)}
                placeholder="Digite a API Key"
              />
              <div className="relative">
                <Input
                  label="API Secret"
                  type={showSecrets.webmotors_api_secret ? 'text' : 'password'}
                  value={settings.webmotors_api_secret}
                  onChange={(e) => handleInputChange('webmotors_api_secret', e.target.value)}
                  placeholder="Digite o API Secret"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('webmotors_api_secret')}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showSecrets.webmotors_api_secret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                onClick={() => testIntegration('webmotors')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Testar Conexão
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">OLX</h4>
              <Input
                label="API Key"
                value={settings.olx_api_key}
                onChange={(e) => handleInputChange('olx_api_key', e.target.value)}
                placeholder="Digite a API Key"
              />
              <div className="relative">
                <Input
                  label="API Secret"
                  type={showSecrets.olx_api_secret ? 'text' : 'password'}
                  value={settings.olx_api_secret}
                  onChange={(e) => handleInputChange('olx_api_secret', e.target.value)}
                  placeholder="Digite o API Secret"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('olx_api_secret')}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showSecrets.olx_api_secret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                onClick={() => testIntegration('olx')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Testar Conexão
              </Button>
            </div>
          </div>
        </div>

        {/* Serviços de Email */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Serviços de Email</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Servidor SMTP"
              value={settings.smtp_host}
              onChange={(e) => handleInputChange('smtp_host', e.target.value)}
              placeholder="smtp.gmail.com"
            />

            <Input
              label="Porta SMTP"
              value={settings.smtp_port}
              onChange={(e) => handleInputChange('smtp_port', e.target.value)}
              placeholder="587"
            />

            <Input
              label="Usuário SMTP"
              value={settings.smtp_username}
              onChange={(e) => handleInputChange('smtp_username', e.target.value)}
              placeholder="seu@email.com"
            />

            <div className="relative">
              <Input
                label="Senha SMTP"
                type={showSecrets.smtp_password ? 'text' : 'password'}
                value={settings.smtp_password}
                onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                placeholder="Digite a senha"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('smtp_password')}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
              >
                {showSecrets.smtp_password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Select
              value={settings.smtp_encryption}
              onChange={(e) => handleInputChange('smtp_encryption', e.target.value)}
              options={[
                { value: 'tls', label: 'TLS' },
                { value: 'ssl', label: 'SSL' },
                { value: 'none', label: 'Nenhum' }
              ]}
              placeholder="Selecione a criptografia"
            />

            <Input
              label="Email Remetente"
              value={settings.from_email}
              onChange={(e) => handleInputChange('from_email', e.target.value)}
              placeholder="noreply@empresa.com"
            />
          </div>

          <div className="mt-6">
            <Input
              label="Nome do Remetente"
              value={settings.from_name}
              onChange={(e) => handleInputChange('from_name', e.target.value)}
              placeholder="Nome da Empresa"
            />
          </div>

          <div className="mt-6">
            <Button
              onClick={() => testIntegration('email')}
              variant="outline"
              className="w-full md:w-auto"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar Envio de Email
            </Button>
          </div>
        </div>

        {/* Serviços de Pagamento */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <Zap className="w-6 h-6 text-yellow-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Serviços de Pagamento</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Stripe</h4>
              <Input
                label="Chave Pública"
                value={settings.stripe_public_key}
                onChange={(e) => handleInputChange('stripe_public_key', e.target.value)}
                placeholder="pk_test_..."
              />
              <div className="relative">
                <Input
                  label="Chave Secreta"
                  type={showSecrets.stripe_secret_key ? 'text' : 'password'}
                  value={settings.stripe_secret_key}
                  onChange={(e) => handleInputChange('stripe_secret_key', e.target.value)}
                  placeholder="sk_test_..."
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('stripe_secret_key')}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showSecrets.stripe_secret_key ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">PayPal</h4>
              <Input
                label="Client ID"
                value={settings.paypal_client_id}
                onChange={(e) => handleInputChange('paypal_client_id', e.target.value)}
                placeholder="Digite o Client ID"
              />
              <div className="relative">
                <Input
                  label="Secret"
                  type={showSecrets.paypal_secret ? 'text' : 'password'}
                  value={settings.paypal_secret}
                  onChange={(e) => handleInputChange('paypal_secret', e.target.value)}
                  placeholder="Digite o Secret"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('paypal_secret')}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showSecrets.paypal_secret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Serviços de Armazenamento */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <Database className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Serviços de Armazenamento</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">AWS S3</h4>
              <Input
                label="Access Key"
                value={settings.aws_access_key}
                onChange={(e) => handleInputChange('aws_access_key', e.target.value)}
                placeholder="Digite a Access Key"
              />
              <div className="relative">
                <Input
                  label="Secret Key"
                  type={showSecrets.aws_secret_key ? 'text' : 'password'}
                  value={settings.aws_secret_key}
                  onChange={(e) => handleInputChange('aws_secret_key', e.target.value)}
                  placeholder="Digite a Secret Key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('aws_secret_key')}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showSecrets.aws_secret_key ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Input
                label="Região"
                value={settings.aws_region}
                onChange={(e) => handleInputChange('aws_region', e.target.value)}
                placeholder="us-east-1"
              />
              <Input
                label="Bucket"
                value={settings.aws_bucket}
                onChange={(e) => handleInputChange('aws_bucket', e.target.value)}
                placeholder="nome-do-bucket"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Cloudinary</h4>
              <Input
                label="Cloud Name"
                value={settings.cloudinary_cloud_name}
                onChange={(e) => handleInputChange('cloudinary_cloud_name', e.target.value)}
                placeholder="Digite o Cloud Name"
              />
              <Input
                label="API Key"
                value={settings.cloudinary_api_key}
                onChange={(e) => handleInputChange('cloudinary_api_key', e.target.value)}
                placeholder="Digite a API Key"
              />
              <div className="relative">
                <Input
                  label="API Secret"
                  type={showSecrets.cloudinary_api_secret ? 'text' : 'password'}
                  value={settings.cloudinary_api_secret}
                  onChange={(e) => handleInputChange('cloudinary_api_secret', e.target.value)}
                  placeholder="Digite o API Secret"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('cloudinary_api_secret')}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showSecrets.cloudinary_api_secret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Outros Serviços */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <Key className="w-6 h-6 text-indigo-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Outros Serviços</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Google Maps API Key"
              value={settings.google_maps_api_key}
              onChange={(e) => handleInputChange('google_maps_api_key', e.target.value)}
              placeholder="Digite a API Key do Google Maps"
            />

            <Input
              label="reCAPTCHA Site Key"
              value={settings.recaptcha_site_key}
              onChange={(e) => handleInputChange('recaptcha_site_key', e.target.value)}
              placeholder="Digite a Site Key do reCAPTCHA"
            />

            <Input
              label="Facebook App ID"
              value={settings.facebook_app_id}
              onChange={(e) => handleInputChange('facebook_app_id', e.target.value)}
              placeholder="Digite o App ID do Facebook"
            />
          </div>
        </div>

        {/* Configurações Gerais */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Configurações Gerais</h3>
          </div>

          <div className="space-y-4">
            <Checkbox
              label="Habilitar Webhooks"
              checked={settings.enable_webhooks}
              onChange={(e) => handleInputChange('enable_webhooks', e.target.checked)}
            />

            {settings.enable_webhooks && (
              <Input
                label="URL do Webhook"
                value={settings.webhook_url}
                onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                placeholder="https://seu-site.com/webhook"
              />
            )}

            <Checkbox
              label="Habilitar Logs"
              checked={settings.enable_logs}
              onChange={(e) => handleInputChange('enable_logs', e.target.checked)}
            />

            <Select
              value={settings.log_level}
              onChange={(e) => handleInputChange('log_level', e.target.value)}
              options={[
                { value: 'debug', label: 'Debug' },
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'error', label: 'Error' }
              ]}
              placeholder="Selecione o nível de log"
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
