'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, initializeAuthFromCookies } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)

  // Inicializar autenticação a partir dos cookies apenas uma vez
  useEffect(() => {
    if (isInitializing) {
      // Dar um pequeno delay para garantir que o Zustand esteja pronto
      const timer = setTimeout(() => {
        initializeAuthFromCookies()
        setIsInitializing(false)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isInitializing])

  // Redirecionar para login se não autenticado (apenas uma vez)
  const redirectToLogin = useCallback(() => {
    if (hasRedirected) return
    setHasRedirected(true)
    router.replace('/admin/login')
  }, [hasRedirected, router])

  useEffect(() => {
    if (isInitializing) return

    if (!isLoading && !isAuthenticated && !hasRedirected) {
      redirectToLogin()
    } else if (isAuthenticated) {
      setHasRedirected(false)
    }
  }, [isAuthenticated, isLoading, isInitializing, hasRedirected, redirectToLogin])

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Show loading spinner while checking authentication
  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 flex z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="fixed inset-0 bg-secondary-600 bg-opacity-75" />
          <div
            className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
                <Header
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
