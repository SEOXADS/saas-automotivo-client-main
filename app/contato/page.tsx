'use client'

import { useState, useEffect } from 'react'
import PortalLayout from '../portal/layout'
import { useSEOMetaTags } from '@/lib/seo-metatags'

function ContatoPageContent() {
  const [tenant, setTenant] = useState<{
    id: number;
    name: string;
    subdomain: string;
    profile?: {
      company_name?: string;
      company_description?: string;
      address?: string;
      company_phone?: string;
      company_email?: string;
      logo_url?: string | null;
    };
  } | null>(null)

  useEffect(() => {
    const loadTenantData = async () => {
      try {
        console.log('🔍 Carregando dados do tenant da API...')

        // Buscar dados reais do tenant da API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.api.omegaveiculos.com.br/api'
        const response = await fetch(`${apiUrl}/portal/tenant-info`, {
          headers: {
            'X-Tenant-Subdomain': 'omegaveiculos',
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('✅ Dados do tenant carregados da API:', data)

        if (data.success && data.data) {
          const tenantData = data.data
          setTenant({
            id: tenantData.id,
            name: tenantData.name,
            subdomain: tenantData.subdomain,
            profile: {
              company_name: tenantData.profile?.company_name || tenantData.name,
              company_description: tenantData.profile?.company_description,
              address: tenantData.profile?.address,
              company_phone: tenantData.profile?.company_phone,
              company_email: tenantData.profile?.company_email,
              logo_url: tenantData.profile?.logo_url
            }
          })
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do tenant da API:', error)
        // Fallback para dados de exemplo em caso de erro
        const fallbackTenant = {
          id: 1,
          name: 'Ômega Veículos',
          subdomain: 'omegaveiculos',
          profile: {
            company_name: 'Ômega Veículos',
            company_description: 'São mais de 30 anos de história e tradição que a tornam a maior loja de seminovos da região.',
            address: 'R. Comendador Oetterer, 1483, LOJA, Vila Carvalho, Sorocaba, SP, 18060-070',
            company_phone: '(15) 3034-0800',
            company_email: 'contato@omegaveiculos.com.br',
            logo_url: undefined
          }
        }
        setTenant(fallbackTenant)
      }
    }

    loadTenantData()
  }, [])

  // Aplicar meta tags SEO completas com dados reais da API
  const metaTags = {
    title: `Entre em Contato - ${tenant?.profile?.company_name || 'Ômega Veículos'}`,
    description: tenant?.profile?.company_description || 'Estamos aqui para ajudar você a encontrar o veículo perfeito',
    keywords: 'contato, telefone, email, endereço, veículos seminovos, ômega veículos',
    canonical: typeof window !== 'undefined' ? window.location.href : '',
    robots: 'index, follow',
    author: tenant?.profile?.company_name || 'Ômega Veículos',
    publisher: tenant?.profile?.company_name || 'Ômega Veículos',
    themeColor: '#F59E0B',

    ogTitle: `Entre em Contato - ${tenant?.profile?.company_name || 'Ômega Veículos'}`,
    ogDescription: tenant?.profile?.company_description || 'Estamos aqui para ajudar você a encontrar o veículo perfeito',
    ogImage: tenant?.profile?.logo_url || undefined,
    ogUrl: typeof window !== 'undefined' ? window.location.href : '',
    ogType: 'website',
    ogSiteName: tenant?.profile?.company_name || 'Ômega Veículos',
    ogLocale: 'pt_BR',

    twitterCard: 'summary_large_image',
    twitterTitle: `Entre em Contato - ${tenant?.profile?.company_name || 'Ômega Veículos'}`,
    twitterDescription: tenant?.profile?.company_description || 'Estamos aqui para ajudar você a encontrar o veículo perfeito',
    twitterImage: tenant?.profile?.logo_url || undefined,
    twitterSite: '@omegaveiculos',
    twitterCreator: '@omegaveiculos',

    schema: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Entre em Contato",
      "description": tenant?.profile?.company_description || "Estamos aqui para ajudar você a encontrar o veículo perfeito",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "mainEntity": {
        "@type": "Organization",
        "name": tenant?.profile?.company_name || "Ômega Veículos",
        "description": tenant?.profile?.company_description || "Empresa especializada em vendas de veículos usados e seminovos",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": tenant?.profile?.address || "R. Comendador Oetterer, 1483, LOJA, Vila Carvalho, Sorocaba, SP, 18060-070",
          "addressLocality": "Sorocaba",
          "addressRegion": "SP",
          "postalCode": "18060-070",
          "addressCountry": "BR"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": tenant?.profile?.company_phone || "(15) 3034-0800",
            "contactType": "customer service",
            "availableLanguage": "Portuguese",
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "08:00",
              "closes": "18:00"
            }
          }
        ],
        "email": tenant?.profile?.company_email || "contato@omegaveiculos.com.br",
        "url": typeof window !== 'undefined' ? window.location.origin : '',
        "sameAs": [
          "https://www.facebook.com/omegaveiculos",
          "https://www.instagram.com/omegaveiculos"
        ]
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": typeof window !== 'undefined' ? window.location.origin : ''
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Contato",
            "item": typeof window !== 'undefined' ? window.location.href : ''
          }
        ]
      }
    },

    favicon: tenant?.profile?.logo_url || undefined,
    appleTouchIcon: tenant?.profile?.logo_url || undefined,
    manifest: '/manifest.json'
  }

  useSEOMetaTags(metaTags, tenant)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Entre em Contato
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              {tenant?.profile?.company_description || 'Estamos aqui para ajudar você a encontrar o veículo perfeito.'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Informações de Contato
              </h2>
              <p className="text-gray-600 mb-8">
                Nossa equipe está pronta para atendê-lo e responder todas as suas dúvidas.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                    <p className="text-gray-600">
                      {tenant?.profile?.address || 'R. Comendador Oetterer, 1483, LOJA<br />Vila Carvalho, Sorocaba - SP<br />CEP: 18060-070'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Telefone</h3>
                    <p className="text-gray-600">
                      {tenant?.profile?.company_phone || '(15) 3034-0800'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">
                      {tenant?.profile?.company_email || 'contato@omegaveiculos.com.br'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Envie sua Mensagem
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Descreva sua mensagem aqui..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContatoPage() {
  return (
    <PortalLayout>
      <ContatoPageContent />
    </PortalLayout>
  )
}
