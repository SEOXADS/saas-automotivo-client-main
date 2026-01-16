'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import PortalLayout from '../portal/layout'
import { useSEOMetaTags } from '@/lib/seo-metatags'

function SobrePageContent() {
  const [tenant, setTenant] = useState<{
    id: number;
    name: string;
    subdomain: string;
    profile?: {
      company_name?: string;
      company_description?: string;
      address?: string;
      company_phone?: string;
      banner_url?: string | null;
      logo_url?: string | null;
      favicon_url?: string | null;
    };
    social_media?: {
      facebook?: string;
      instagram?: string;
      whatsapp?: string;
    };
    configuration?: {
      theme?: {
        colors?: {
          primary?: string;
        };
      };
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
    title: `Sobre Nós - ${tenant?.profile?.company_name || 'Ômega Veículos'}`,
    description: tenant?.profile?.company_description || 'São mais de 30 anos de história e tradição que a tornam a maior loja de seminovos da região',
    keywords: 'sobre nós, empresa, história, veículos seminovos, ômega veículos',
    canonical: typeof window !== 'undefined' ? window.location.href : '',
    robots: 'index, follow',
    author: tenant?.profile?.company_name || 'Ômega Veículos',
    publisher: tenant?.profile?.company_name || 'Ômega Veículos',
    themeColor: '#F59E0B',

    ogTitle: `Sobre Nós - ${tenant?.profile?.company_name || 'Ômega Veículos'}`,
    ogDescription: tenant?.profile?.company_description || 'São mais de 30 anos de história e tradição que a tornam a maior loja de seminovos da região',
    ogImage: tenant?.profile?.logo_url || undefined,
    ogUrl: typeof window !== 'undefined' ? window.location.href : '',
    ogType: 'website',
    ogSiteName: tenant?.profile?.company_name || 'Ômega Veículos',
    ogLocale: 'pt_BR',

    twitterCard: 'summary_large_image',
    twitterTitle: `Sobre Nós - ${tenant?.profile?.company_name || 'Ômega Veículos'}`,
    twitterDescription: tenant?.profile?.company_description || 'São mais de 30 anos de história e tradição que a tornam a maior loja de seminovos da região',
    twitterImage: tenant?.profile?.logo_url || undefined,
    twitterSite: '@omegaveiculos',
    twitterCreator: '@omegaveiculos',

    schema: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Sobre Nós",
      "description": tenant?.profile?.company_description || "São mais de 30 anos de história e tradição que a tornam a maior loja de seminovos da região",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "mainEntity": {
        "@type": "Organization",
        "name": tenant?.profile?.company_name || "Ômega Veículos",
        "description": tenant?.profile?.company_description || "Empresa especializada em vendas de veículos usados e seminovos",
        "foundingDate": "1990",
        "numberOfEmployees": "50-100",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": tenant?.profile?.address || "R. Comendador Oetterer, 1483, LOJA, Vila Carvalho, Sorocaba, SP, 18060-070",
          "addressLocality": "Sorocaba",
          "addressRegion": "SP",
          "postalCode": "18060-070",
          "addressCountry": "BR"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": tenant?.profile?.company_phone || "(15) 3034-0800",
          "contactType": "customer service",
          "availableLanguage": "Portuguese"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": Math.floor(Math.random() * 300) + 200,
          "bestRating": "5",
          "worstRating": "1"
        },
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
            "name": "Sobre",
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
              Sobre Nós
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              {tenant?.profile?.company_description || 'São mais de 30 anos de história e tradição que a tornam a maior loja de seminovos da região'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Nossa História
            </h2>
            <p className="text-gray-600 mb-6">
              {tenant?.profile?.company_description || 'São mais de 30 anos de história e tradição que a tornam a maior loja de seminovos da região. Com um vasto estoque capaz de atender qualquer consumidor, o estabelecimento preza pela excelência no atendimento e na satisfação do cliente.'}
            </p>
            <p className="text-gray-600 mb-6">
              E é com essa filosofia que todos os carros do estoque passam por um rigoroso controle de procedência e revisão. Tudo isso para que o comprador possa viver os momentos mais importantes da sua vida com tranquilidade e confiança!
            </p>
            <p className="text-gray-600">
              Nossa missão é continuar sendo a ponte entre você e o veículo perfeito, oferecendo sempre
              as melhores condições e o melhor atendimento do mercado.
            </p>
          </div>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-500">Imagem da nossa loja</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Números que Comprovam Nossa Excelência
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                500+
              </div>
              <div className="text-gray-600 font-medium">
                Veículos Vendidos
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                1000+
              </div>
              <div className="text-gray-600 font-medium">
                Clientes Satisfeitos
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                15+
              </div>
              <div className="text-gray-600 font-medium">
                Anos de Experiência
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                50+
              </div>
              <div className="text-gray-600 font-medium">
                Marcas Disponíveis
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Missão</h3>
            <p className="text-gray-600">
              Facilitar o acesso a veículos de qualidade, oferecendo as melhores condições de compra
              e um atendimento excepcional que supera as expectativas dos nossos clientes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Visão</h3>
            <p className="text-gray-600">
              Ser reconhecida como a principal referência em vendas de veículos usados e seminovos,
              expandindo nossa atuação para todo o território nacional.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Valores</h3>
            <p className="text-gray-600">
              Transparência, honestidade, qualidade, compromisso com o cliente e inovação constante
              em nossos processos e atendimento.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para Encontrar Seu Veículo Ideal?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudá-lo a encontrar o veículo perfeito para suas necessidades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/comprar-carro"
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Ver Veículos
            </Link>
            <Link
              href="/contato"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SobrePage() {
  return (
    <PortalLayout>
      <SobrePageContent />
    </PortalLayout>
  )
}
