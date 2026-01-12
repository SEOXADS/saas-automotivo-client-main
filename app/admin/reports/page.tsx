'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { BarChart3, TrendingUp, Download, Car, Users, DollarSign } from 'lucide-react'

interface ReportData {
  vehicles: {
    total: number
    available: number
    sold: number
    maintenance: number
  }
  leads: {
    total: number
    new: number
    qualified: number
    closed: number
  }
  sales: {
    total_revenue: number
    monthly_sales: Array<{ month: string; value: number }>
    top_brands: Array<{ brand: string; count: number }>
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    // Simular carregamento de relatórios
    const timer = setTimeout(() => {
      setReportData({
        vehicles: {
          total: 25,
          available: 18,
          sold: 5,
          maintenance: 2
        },
        leads: {
          total: 45,
          new: 12,
          qualified: 8,
          closed: 25
        },
        sales: {
          total_revenue: 1250000,
          monthly_sales: [
            { month: 'Jan', value: 150000 },
            { month: 'Fev', value: 180000 },
            { month: 'Mar', value: 220000 },
            { month: 'Abr', value: 190000 },
            { month: 'Mai', value: 250000 },
            { month: 'Jun', value: 280000 }
          ],
          top_brands: [
            { brand: 'Toyota', count: 8 },
            { brand: 'Honda', count: 6 },
            { brand: 'Volkswagen', count: 5 },
            { brand: 'Ford', count: 4 },
            { brand: 'Chevrolet', count: 2 }
          ]
        }
      })
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout title="Relatórios" subtitle="Análises e métricas do negócio">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-2">Análises e métricas do negócio</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-5 w-5 mr-2" />
            Exportar Relatório
          </button>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Car className="h-7 w-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Veículos</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.vehicles.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.leads.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <DollarSign className="h-7 w-7 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData ? formatCurrency(reportData.sales.total_revenue) : 'R$ 0,00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-7 w-7 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData ? Math.round((reportData.leads.closed / reportData.leads.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendas por mês */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Mês</h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gráfico de vendas será implementado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Receita total: {reportData ? formatCurrency(reportData.sales.total_revenue) : 'R$ 0,00'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Marcas mais vendidas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Marcas Mais Vendidas</h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {reportData?.sales.top_brands.map((brand, index) => (
                  <div key={brand.brand} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-gray-900 font-medium">{brand.brand}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(brand.count / (reportData?.sales.top_brands[0]?.count || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600 font-medium">{brand.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumo detalhado */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo Detalhado</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {reportData?.vehicles.available || 0}
                </div>
                <p className="text-gray-600">Veículos Disponíveis</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {reportData?.vehicles.sold || 0}
                </div>
                <p className="text-gray-600">Veículos Vendidos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {reportData?.leads.new || 0}
                </div>
                <p className="text-gray-600">Novos Leads</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {reportData?.leads.qualified || 0}
                </div>
                <p className="text-gray-600">Leads Qualificados</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {reportData?.leads.closed || 0}
                </div>
                <p className="text-gray-600">Leads Fechados</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {reportData ? Math.round(reportData.sales.total_revenue / (reportData.vehicles.sold || 1)) : 0}
                </div>
                <p className="text-gray-600">Ticket Médio</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
