'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function AdminRedirect() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Aguardar o carregamento do estado de autenticação
    if (isLoading) return

    // Se não estiver logado, redirecionar para login
    if (!isAuthenticated) {
      router.replace('/admin/login')
      return
    }

    // Se estiver logado, redirecionar para dashboard
    router.replace('/admin/dashboard')
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
