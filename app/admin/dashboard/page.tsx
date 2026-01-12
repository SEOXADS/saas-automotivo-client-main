'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Car, Users, TrendingUp, CheckCircle, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import { adminApiHelpers } from '@/lib/admin-api'

interface DashboardStats {
  total_vehicles?: number
  active_vehicles?: number
  total_leads?: number
  new_leads?: number
}

interface DashboardData {
  stats?: DashboardStats
}

// Componente de Card de Métrica
const MetricCard = ({ title, value, change, changeType, icon: Icon, color }: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }> // Icon é obrigatório
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-semibold text-secondary-900">{value}</p>
          {change && (
            <p className={`text-sm ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' :
              'text-secondary-500'
            }`}>
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_vehicles: 0,
    available_vehicles: 0,
    sold_vehicles: 0,
    total_leads: 0,
    new_leads: 0,
    conversion_rate: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Tentar buscar dados reais da API
        const apiData = await adminApiHelpers.getDashboardData()

        if (apiData && typeof apiData === 'object' && 'stats' in apiData && apiData.stats) {
          const stats = (apiData as DashboardData).stats
          if (stats) {
            setStats({
              total_vehicles: stats.total_vehicles || 0,
              available_vehicles: stats.active_vehicles || 0,
              sold_vehicles: (stats.total_vehicles ?? 0) - (stats.active_vehicles ?? 0),
              total_leads: stats.total_leads || 0,
              new_leads: stats.new_leads || 0,
              conversion_rate: (stats.total_leads ?? 0) > 0
                ? Math.round((((stats.total_leads ?? 0) - (stats.new_leads ?? 0)) / (stats.total_leads ?? 1)) * 100)
                : 0
            })
          }
        } else {
          // Fallback para dados mock
          setStats({
            total_vehicles: 12,
            available_vehicles: 8,
            sold_vehicles: 4,
            total_leads: 25,
            new_leads: 3,
            conversion_rate: 16
          })
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        // Fallback para dados mock em caso de erro
        setStats({
          total_vehicles: 12,
          available_vehicles: 8,
          sold_vehicles: 4,
          total_leads: 25,
          new_leads: 3,
          conversion_rate: 16
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Visão geral do seu negócio">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard" subtitle={`Bem-vindo, ${user?.name || 'Usuário'}!`}>
      <div className="space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Veículos"
            value={stats.total_vehicles}
            change="+3 este mês"
            changeType="positive"
            icon={Car}
            color="blue"
          />
          <MetricCard
            title="Veículos Disponíveis"
            value={stats.available_vehicles}
            change={`${stats.sold_vehicles} vendidos`}
            changeType="neutral"
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Novos Leads"
            value={stats.new_leads}
            change="+12% vs mês anterior"
            changeType="positive"
            icon={Users}
            color="yellow"
          />
          <MetricCard
            title="Taxa de Conversão"
            value={`${stats.conversion_rate}%`}
            change="+2.1% vs mês anterior"
            changeType="positive"
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Ações rápidas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/vehicles/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Novo Veículo</p>
                <p className="text-sm text-gray-500">Cadastrar veículo</p>
              </div>
            </Link>

            <Link
              href="/admin/vehicles"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Ver Veículos</p>
                <p className="text-sm text-gray-500">Gerenciar estoque</p>
              </div>
            </Link>

            <Link
              href="/admin/leads"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Gerenciar Leads</p>
                <p className="text-sm text-gray-500">Ver leads</p>
              </div>
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Relatórios</p>
                <p className="text-sm text-gray-500">Ver análises</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Atividades recentes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Novo lead: João Silva interessado em Honda Civic</p>
                <p className="text-xs text-gray-500">5 min atrás</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Veículo vendido: Toyota Corolla 2020</p>
                <p className="text-xs text-gray-500">1 hora atrás</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
                <Car className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Novo veículo cadastrado: Honda Civic 2023</p>
                <p className="text-xs text-gray-500">2 horas atrás</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
