'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Users, Package, ArrowLeft } from 'lucide-react'

interface SettingsLayoutProps {
  children: React.ReactNode
}

const settingsMenuItems = [
  {
    title: 'Configurações Gerais',
    href: '/settings/configuration',
    icon: Settings,
    description: 'Perfil da empresa, tema, SEO e configurações do portal'
  },
  {
    title: 'Usuários e Permissões',
    href: '/settings/users',
    icon: Users,
    description: 'Gerenciar usuários e suas permissões'
  },
  {
    title: 'Integrações',
    href: '/settings/integrations',
    icon: Package,
    description: 'APIs e serviços externos'
  }
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Verificar se o usuário é admin
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  // Se não for admin, não renderizar nada
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar ao Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Navegação */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {settingsMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-start p-4 rounded-xl transition-all duration-200 group
                    ${isActive(item.href)
                      ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
                      : 'bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-md'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg mr-3 transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }
                  `}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`
                      font-medium transition-colors
                      ${isActive(item.href)
                        ? 'text-blue-900'
                        : 'text-gray-900 group-hover:text-blue-700'
                      }
                    `}>
                      {item.title}
                    </h3>
                    <p className={`
                      text-sm mt-1 transition-colors
                      ${isActive(item.href)
                        ? 'text-blue-700'
                        : 'text-gray-500 group-hover:text-blue-600'
                      }
                    `}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
