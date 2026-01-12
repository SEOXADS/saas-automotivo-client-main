'use client'

import { Bell, Search, Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function Header({ title, subtitle, onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and mobile menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-semibold text-secondary-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-secondary-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side - Search, notifications, and user menu */}
        <div className="flex items-center space-x-4">
          {/* Search - hidden on mobile */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="block w-64 pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 relative"
            >
              <Bell className="h-6 w-6" />
              {/* Notification badge */}
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-400 ring-2 ring-white"></span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-secondary-900 mb-3">Notificações</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-secondary-50">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary-900">Novo lead recebido</p>
                        <p className="text-xs text-secondary-500">João Silva interessado em Honda Civic</p>
                        <p className="text-xs text-secondary-400 mt-1">5 min atrás</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-secondary-50">
                      <div className="w-2 h-2 bg-success-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary-900">Veículo vendido</p>
                        <p className="text-xs text-secondary-500">Toyota Corolla 2020 foi vendido</p>
                        <p className="text-xs text-secondary-400 mt-1">1 hora atrás</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-secondary-50">
                      <div className="w-2 h-2 bg-warning-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary-900">Estoque baixo</p>
                        <p className="text-xs text-secondary-500">Apenas 2 veículos da marca Ford</p>
                        <p className="text-xs text-secondary-400 mt-1">2 horas atrás</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-secondary-200">
                    <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                      Ver todas as notificações
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User info */}
          {user && (
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                <p className="text-xs text-secondary-500 capitalize">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden mt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </header>
  )
}
