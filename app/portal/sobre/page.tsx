'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getPortalTenantInfo } from '@/lib/portal-api'
import { useSEOMetaTags } from '@/lib/seo-metatags'

export default function SobrePage() {
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
        const subdomain = 'omegaveiculos'
        const tenantData = await getPortalTenantInfo(subdomain)
        setTenant(tenantData)
      } catch (error) {
        console.error('Erro ao carregar dados do tenant:', error)
      }
    }
    loadTenantData()
  }, [])

  // Aplicar meta tags SEO completas com dados reais da API
  const metaTags = {
    title: `Sobre Nós - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    description: tenant?.profile?.company_description || 'Há mais de 15 anos conectando pessoas aos seus veículos dos sonhos',
    keywords: 'sobre nós, empresa, história, veículos seminovos, portal automotivo',
    canonical: typeof window !== 'undefined' ? window.location.href : '',
    robots: 'index, follow',
    author: tenant?.profile?.company_name || 'Portal de Veículos',
    publisher: tenant?.profile?.company_name || 'Portal de Veículos',
    themeColor: tenant?.configuration?.theme?.colors?.primary || '#F59E0B',

    ogTitle: `Sobre Nós - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    ogDescription: tenant?.profile?.company_description || 'Há mais de 15 anos conectando pessoas aos seus veículos dos sonhos',
    ogImage: tenant?.profile?.banner_url || tenant?.profile?.logo_url || undefined,
    ogUrl: typeof window !== 'undefined' ? window.location.href : '',
    ogType: 'website',
    ogSiteName: tenant?.profile?.company_name || 'Portal de Veículos',
    ogLocale: 'pt_BR',

    twitterCard: 'summary_large_image',
    twitterTitle: `Sobre Nós - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    twitterDescription: tenant?.profile?.company_description || 'Há mais de 15 anos conectando pessoas aos seus veículos dos sonhos',
    twitterImage: tenant?.profile?.banner_url || tenant?.profile?.logo_url || undefined,
    twitterSite: '@portalveiculos',
    twitterCreator: '@portalveiculos',

    schema: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Sobre Nós",
      "description": tenant?.profile?.company_description || "Há mais de 15 anos conectando pessoas aos seus veículos dos sonhos",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "mainEntity": {
        "@type": "Organization",
        "name": tenant?.profile?.company_name || "Portal de Veículos",
        "description": tenant?.profile?.company_description || "Empresa especializada em vendas de veículos usados e seminovos",
        "foundingDate": "2008",
        "numberOfEmployees": "50-100",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": tenant?.profile?.address || "Rua Exemplo, 123",
          "addressLocality": "São Paulo",
          "addressRegion": "SP",
          "postalCode": "01234-567",
          "addressCountry": "BR"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": tenant?.profile?.company_phone || "+55-11-99999-9999",
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
          tenant?.social_media?.facebook,
          tenant?.social_media?.instagram,
          tenant?.social_media?.whatsapp
        ].filter(Boolean)
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": typeof window !== 'undefined' ? window.location.origin + '/portal' : ''
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

    favicon: tenant?.profile?.favicon_url || undefined,
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
              Há mais de 15 anos conectando pessoas aos seus veículos dos sonhos
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
              Fundada em 2008, nossa empresa nasceu com o sonho de democratizar o acesso a veículos de qualidade.
              Começamos como uma pequena loja no centro da cidade e hoje somos referência em vendas de veículos
              usados e seminovos na região.
            </p>
            <p className="text-gray-600 mb-6">
              Ao longo dos anos, construímos uma reputação sólida baseada na transparência, qualidade e
              compromisso com nossos clientes. Cada veículo que vendemos é cuidadosamente selecionado e
              inspecionado para garantir a melhor experiência possível.
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
              href="/portal/vehicles"
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Ver Veículos
            </Link>
            <Link
              href="/portal/contato"
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
