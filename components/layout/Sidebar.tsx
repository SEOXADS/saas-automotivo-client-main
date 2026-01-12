'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Car,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Package,
  Target,
  Home,
  LogOut,
  ChevronDown,
  ChevronRight,
  Download,
  Bug,
  Globe,
  MapPin,
  Building2,
  Home as HomeIcon,
  Link as LinkIcon,
  ArrowRight,
  FileText
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'

interface SidebarItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: SidebarItem[]
  roles?: string[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    title: 'Veículos',
    icon: Car,
    children: [
      { title: 'Todos os Veículos', href: '/admin/vehicles', icon: Car },
      { title: 'Adicionar Veículo', href: '/admin/vehicles/create', icon: Car },
      { title: 'Importar Veículos', href: '/admin/vehicles/import', icon: Download, roles: ['admin'] },
      { title: 'Gerador de URLs', href: '/admin/vehicles/url-generator', icon: LinkIcon, roles: ['admin'] },
      { title: 'Debug Importação', href: '/admin/debug-import', icon: Bug, roles: ['admin'] },
      { title: 'Marcas e Modelos', href: '/admin/vehicles/brands', icon: Package, roles: ['admin'] },
    ],
  },
  {
    title: 'Leads',
    icon: Target,
    children: [
      { title: 'Todos os Leads', href: '/admin/leads', icon: Target },
      { title: 'Adicionar Lead', href: '/admin/leads/create', icon: Target },
      { title: 'Pipeline de Vendas', href: '/admin/leads/pipeline', icon: BarChart3 },
    ],
  },
  {
    title: 'Relatórios',
    href: '/admin/reports',
    icon: BarChart3,
    roles: ['admin', 'manager'],
  },
  {
    title: 'Usuários',
    href: '/admin/settings/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Mensagens',
    href: '/admin/messages',
    icon: MessageSquare,
    roles: ['admin'],
  },
  {
    title: 'Localizações',
    icon: Globe,
    roles: ['admin'],
    children: [
      { title: 'Visão Geral', href: '/admin/locations', icon: Globe },
      { title: 'Países', href: '/admin/locations/countries', icon: Globe },
      { title: 'Estados', href: '/admin/locations/states', icon: MapPin },
      { title: 'Cidades', href: '/admin/locations/cities', icon: Building2 },
      { title: 'Bairros', href: '/admin/locations/neighborhoods', icon: HomeIcon },
    ],
  },
  {
    title: 'URLs Personalizadas',
    icon: LinkIcon,
    roles: ['admin'],
    children: [
      { title: 'Patterns de URL', href: '/admin/urls/patterns', icon: LinkIcon },
      { title: 'Redirects', href: '/admin/urls/redirects', icon: ArrowRight },
    ],
  },
  {
    title: 'SEO e Sitemap',
    icon: FileText,
    roles: ['admin'],
    children: [
      { title: 'Configurações de Sitemap', href: '/admin/sitemap/configs', icon: FileText },
      { title: 'Robots.txt', href: '/admin/sitemap/robots-txt', icon: FileText },
    ],
  },
  {
    title: 'Configurações',
    icon: Settings,
    roles: ['admin'],
    children: [
      { title: 'Configurações do Portal', href: '/admin/settings/configuration', icon: Settings },
      { title: 'Usuários e Permissões', href: '/admin/settings/users', icon: Users },
      { title: 'Integrações', href: '/admin/settings/integrations', icon: Package },
    ],
  },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const hasPermission = (roles?: string[]) => {
    if (!roles) return true
    return user && roles.includes(user.role)
  }

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  // Expand somente o grupo que contém a rota ativa
  const parentsWithActiveChild = sidebarItems
    .filter(item => item.children && item.children.some(child => child.href && (pathname === child.href || pathname.startsWith(child.href + '/'))))
    .map(item => item.title)

  // Sincroniza expansão com rota ativa sem forçar abertura de todos
  // Mantém escolhas do usuário, mas garante que o grupo ativo esteja aberto
  useEffect(() => {
    setExpandedItems(prev => Array.from(new Set([...prev.filter(t => !parentsWithActiveChild.includes(t)), ...parentsWithActiveChild])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderSidebarItem = (item: SidebarItem) => {
    if (!hasPermission(item.roles)) return null

    const isExpanded = expandedItems.includes(item.title)
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <div key={item.title} className="mb-1">
          <button
            onClick={() => toggleExpand(item.title)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center">
              <item.icon className="h-5 w-5 mr-3" />
              {item.title}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children?.map(child => renderSidebarItem(child))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
          ${isActive(item.href!)
            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
            : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
          }
        `}
      >
        <item.icon className="h-5 w-5 mr-3" />
        {item.title}
      </Link>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-secondary-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-secondary-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-secondary-900">Portal Veículos</h1>
            <p className="text-xs text-secondary-500">Painel Administrativo</p>
          </div>
        </div>
      </div>

      {/* Informações do usuário */}
      {user && (
        <div className="px-6 py-4 border-b border-secondary-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary-900">{user.name}</p>
              <p className="text-xs text-secondary-500 capitalize">{user.role}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-secondary-400">{user.tenant.name}</p>
            <span className={`
              inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
              ${user.tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                user.tenant.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'}
            `}>
              {user.tenant.plan}
            </span>
          </div>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {sidebarItems.map(renderSidebarItem)}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-secondary-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-danger-600 hover:text-danger-700 hover:bg-danger-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </button>
      </div>
    </div>
  )
}
