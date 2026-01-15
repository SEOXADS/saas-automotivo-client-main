'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Save, ArrowLeft, RefreshCw, FileText } from 'lucide-react'
import { sitemapApiHelpers } from '@/lib/sitemap-api'

export default function RobotsTxtPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [robotsContent, setRobotsContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    loadRobotsTxt()
  }, [isAuthenticated, router])

  // Track changes
  useEffect(() => {
    setHasChanges(robotsContent !== originalContent)
  }, [robotsContent, originalContent])

  const loadRobotsTxt = async () => {
    setIsLoading(true)
    try {
      // Try to get the preview/content of robots.txt
      const result = await sitemapApiHelpers.getTenantRobotsTxtPreview()
      if (result && result.content) {
        setRobotsContent(result.content)
        setOriginalContent(result.content)
      } else {
        // Default robots.txt content
        const defaultContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

Sitemap: https://omegaveiculos.com.br/sitemap.xml`
        setRobotsContent(defaultContent)
        setOriginalContent(defaultContent)
      }
    } catch (error) {
      console.error('Erro ao carregar robots.txt:', error)
      // Set default content on error
      const defaultContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

Sitemap: https://omegaveiculos.com.br/sitemap.xml`
      setRobotsContent(defaultContent)
      setOriginalContent(defaultContent)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save the raw robots.txt content
      const result = await sitemapApiHelpers.saveRobotsTxtContent(robotsContent)
      
      if (result && result.success) {
        setOriginalContent(robotsContent)
        setHasChanges(false)
        alert('Robots.txt salvo com sucesso!')
      } else {
        alert('Erro ao salvar robots.txt: ' + (result?.message || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao salvar robots.txt:', error)
      alert('Erro ao salvar robots.txt')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Deseja descartar as alterações e voltar ao conteúdo original?')) {
      setRobotsContent(originalContent)
    }
  }

  const handleReload = async () => {
    if (hasChanges) {
      if (!confirm('Você tem alterações não salvas. Deseja recarregar mesmo assim?')) {
        return
      }
    }
    await loadRobotsTxt()
  }

  if (isLoading) {
    return (
      <AdminLayout title="Robots.txt" subtitle="Editor de robots.txt">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando robots.txt...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Robots.txt" subtitle="Editor de robots.txt">
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
              <h1 className="text-2xl font-bold text-gray-900">Robots.txt</h1>
              <p className="text-gray-600">Edite o conteúdo do arquivo robots.txt</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleReload}
              variant="outline"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Recarregar
            </Button>
            {hasChanges && (
              <Button
                onClick={handleReset}
                variant="outline"
              >
                Descartar
              </Button>
            )}
            <Button
              onClick={handleSave}
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        {hasChanges && (
          <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg inline-flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-sm text-yellow-700">Alterações não salvas</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-700">robots.txt</span>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={robotsContent}
                  onChange={(e) => setRobotsContent(e.target.value)}
                  className="w-full h-96 px-4 py-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder="# Conteúdo do robots.txt"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-3">
                📝 Como usar:
              </h3>
              <ul className="text-xs text-blue-800 space-y-2">
                <li>• Edite o conteúdo diretamente no editor</li>
                <li>• Clique em "Salvar" para aplicar as alterações</li>
                <li>• Use "Recarregar" para buscar a versão atual do servidor</li>
              </ul>
            </div>

            {/* Reference */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                📖 Referência Rápida:
              </h3>
              <ul className="text-xs text-gray-700 space-y-2">
                <li><code className="bg-gray-200 px-1 rounded">User-agent: *</code> - Todos os bots</li>
                <li><code className="bg-gray-200 px-1 rounded">Allow: /</code> - Permitir caminho</li>
                <li><code className="bg-gray-200 px-1 rounded">Disallow: /admin/</code> - Bloquear caminho</li>
                <li><code className="bg-gray-200 px-1 rounded">Sitemap: URL</code> - URL do sitemap</li>
                <li><code className="bg-gray-200 px-1 rounded">Crawl-delay: 1</code> - Delay entre requests</li>
              </ul>
            </div>

            {/* Example */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <h3 className="text-sm font-medium text-green-900 mb-3">
                ✅ Exemplo Básico:
              </h3>
              <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono bg-green-100 p-2 rounded">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://seusite.com/sitemap.xml`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
