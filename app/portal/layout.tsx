'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import { getPortalTenantInfo, type PortalTenant } from '@/lib/portal-api'
import { applyPortalColors } from './colors.config'
import { loadBasicPlugins, initializeSlickCarousel, initializeFancybox, checkPluginsLoaded } from './plugins-simple.config'
import AccessibilityButton from '../../components/ui/AccessibilityButton'
import SEOWrapper from '@/components/SEOWrapper';
import GoogleAnalytics from '@/components/GoogleAnalytics'

// Importar CSS do portal
import './portal.css'
import '../accessibility.css'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tenant, setTenant] = useState<PortalTenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState<string | null>(null)

  const setDynamicFavicon = (faviconUrl: string | null | undefined) => {
    if (!faviconUrl) {
      console.log('⚠️ No favicon URL provided')
      return
    }

    console.log('🎯 Setting dynamic favicon...')

    // Remove ALL existing favicon links
    const existingFavicons = document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel*="icon"]'
    )
    console.log(`🗑️ Removing ${existingFavicons.length} existing favicon(s)`)
    existingFavicons.forEach(favicon => favicon.remove())

    // Function to create favicon link
    const createFaviconLink = (href: string, mimeType: string) => {
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = mimeType
      link.href = href
      document.head.insertBefore(link, document.head.firstChild)

      // Also add shortcut icon for older browsers
      const shortcutLink = document.createElement('link')
      shortcutLink.rel = 'shortcut icon'
      shortcutLink.type = mimeType
      shortcutLink.href = href
      document.head.insertBefore(shortcutLink, document.head.firstChild)

      // Apple touch icon
      const appleIcon = document.createElement('link')
      appleIcon.rel = 'apple-touch-icon'
      appleIcon.href = href
      document.head.appendChild(appleIcon)
    }

    // Check if it's a base64 data URL
    if (faviconUrl.startsWith('data:image/')) {
      // Extract mime type and base64 data
      const match = faviconUrl.match(/^data:(image\/[^;]+);base64,(.*)$/)
      
      if (match) {
        const mimeType = match[1]
        const base64Data = match[2]
        
        // Convert base64 to Blob (works better in Safari)
        try {
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: mimeType })
          const blobUrl = URL.createObjectURL(blob)
          
          createFaviconLink(blobUrl, mimeType)
          console.log('✅ Dynamic favicon set (Blob URL for Safari compatibility)!')
        } catch (error) {
          console.error('❌ Error converting base64 to blob:', error)
          // Fallback to base64 URL
          createFaviconLink(faviconUrl, mimeType)
        }
      } else {
        createFaviconLink(faviconUrl, 'image/x-icon')
      }
    } else {
      // Regular URL
      let mimeType = 'image/x-icon'
      if (faviconUrl.endsWith('.png')) mimeType = 'image/png'
      else if (faviconUrl.endsWith('.svg')) mimeType = 'image/svg+xml'
      
      createFaviconLink(faviconUrl, mimeType)
      console.log('✅ Dynamic favicon set!')
    }

    console.log('📎 Favicon URL (first 100 chars):', faviconUrl.substring(0, 100) + '...')
  }




  useEffect(() => {
    // Aplicar cores padrão do portal
    applyPortalColors()

    // Carregar plugins básicos (ícones + Slick + Fancybox)
    const loadPlugins = async () => {
      try {
        await loadBasicPlugins()
        // Aguardar um pouco para os scripts carregarem
        setTimeout(() => {
          initializeSlickCarousel()
          initializeFancybox()
          checkPluginsLoaded()
        }, 1000)
      } catch (error) {
        console.warn('⚠️ Erro ao carregar plugins básicos:', error)
      }
    }

    loadPlugins()

    // Carregar informações do tenant
    const loadTenantInfo = async () => {
      try {
        console.log("STARTED loadTenantInfo ")
        setLoading(true)
        const tenantData = await getPortalTenantInfo('omegaveiculos')
        console.log("tenantData", tenantData)
        setTenant(tenantData)
        const googleAnalytics = tenantData?.portal_settings?.integrations?.google_analytics
        let gaId: string | null = null
        if (googleAnalytics && typeof googleAnalytics === 'object' && 'id' in googleAnalytics) {
          gaId = googleAnalytics.id || null
        } 
        // Check if it's already a string
        else if (typeof googleAnalytics === 'string') {
          gaId = googleAnalytics
        }

        if (gaId) {
          console.log('✅ Google Analytics ID found:', gaId)
          setGoogleAnalyticsId(gaId)
        } else {
          console.log("NO GAID")
        }

        console.log('✅ Tenant carregado:', tenantData)
      } catch (error) {
        console.warn('⚠️ Erro ao carregar tenant:', error)
        // Usar tenant padrão se falhar
        setTenant({
          id: 1,
          name: 'Portal de Veículos',
          subdomain: 'omegaveiculos',
          custom_domain: null,
          description: 'Portal padrão para venda de veículos',
          contact_email: '',
          contact_phone: '',
          address: '',
          theme_color: '#EF4444',
          logo_url: null,
          logo: null,
          social_media: {},
          business_hours: {},
          profile: {
            company_name: 'Portal de Veículos',
            company_description: 'Portal padrão para venda de veículos',
            company_phone: '',
            company_email: '',
            company_website: null,
            address: '',
            logo_url: null,
            favicon_url: null,
            banner_url: null
          },
          theme: {
            theme: {
              name: 'default',
              version: '1.0.0',
              colors: {},
              typography: {},
              layout: {},
              components: {},
              features: {}
            },
            css: '',
            customJs: []
          },
          seo: {
            meta: {
              title: 'Portal de Veículos',
              description: 'Portal padrão para venda de veículos',
              keywords: 'veículos, carros, motos, compra, venda'
            },
            open_graph: {
              title: 'Portal de Veículos',
              description: 'Portal padrão para venda de veículos',
              image_url: null
            }
          },
          portal_settings: {
            features: [],
            display: {
              show_featured_vehicles: false
            }
          },
          configuration: {
            theme: {
              colors: {},
              typography: { font_family: 'Inter' },
              custom_css: '',
              layout: {
                border_radius: '0.5rem',
                spacing: '1rem',
                container_max_width: '1200px'
              }
            }
          }
        })
      } finally {
        setLoading(false)
      }
    }

    loadTenantInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando portal...</p>
        </div>
      </div>
    )
  }
  return (
    <SEOWrapper 
      tenantId={tenant?.id || 1} 
      defaultTitle={tenant?.profile?.company_name || tenant?.name || 'Portal de Veículos'}
      defaultDescription={tenant?.profile?.company_description || 'Portal especializado na compra e venda de veículos usados e seminovos.'}
      faviconUrl={tenant?.profile?.favicon_url}

    >
      <>
        <GoogleAnalytics measurementId={googleAnalyticsId} />
        <Head>
          <link rel="preconnect" href="https://www.api.webcarros.app.br" />
          <link rel="preconnect" href="https://production.autoforce.com" />
          <link rel="preconnect" href="https://loja.webcarros.app.br" />
          <link rel="stylesheet" href="/portal/assets/css/bootstrap.min.css" />
          <link rel="stylesheet" href="/portal/assets/css/style.css" />
          <style dangerouslySetInnerHTML={{
          __html: `
            /* CSS crítico inline para melhorar LCP */
            .min-h-screen { min-height: 100vh; }
            .bg-white { background-color: #ffffff; }
            .sticky { position: sticky; }
            .top-0 { top: 0; }
            .z-50 { z-index: 50; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .text-white { color: #ffffff; }
            .font-bold { font-weight: 700; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .h-10 { height: 2.5rem; }
            .w-auto { width: auto; }
            .object-contain { object-fit: contain; }
            .mr-3 { margin-right: 0.75rem; }
          `
        }} />
      </Head>

      <div className="min-h-screen bg-white">
      {/* Header com cores do arquivo de configuração */}
      <header
        className="sticky top-0 z-50 shadow-lg"
        style={{
          backgroundColor: 'var(--head-background)',
          color: 'var(--head-text)',
          borderBottom: '2px solid var(--head-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo do Tenant */}
            <div className="flex items-center">
              {tenant?.profile?.logo_url ? (
                <Link
                  href="/"
                  title="Ir para página inicial"
                  aria-label="Ir para página inicial"
                >
                  <Image
                    src={tenant.profile.logo_url}
                    alt={`Logo ${tenant?.profile?.company_name || tenant?.name || 'Portal de Veículos'} - Clique para ir à página inicial`}
                    width={120}
                    height={48}
                    className="h-12 w-auto object-contain mt-2 mb-2 mr-3 hover:opacity-80 transition-opacity"
                    priority
                    // loading="lazy"
                  />
                </Link>
              ) : (
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{
                    backgroundColor: 'var(--accent-color)'
                  }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold">
                    {tenant?.name || 'Portal de Veículos'}
                  </span>
                </div>
              )}
            </div>

            {/* Navegação */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="hover:text-orange-500 transition-colors duration-200"
                title="Ir para página inicial"
                aria-label="Ir para página inicial"
              >
                {tenant?.profile?.company_name || tenant?.name || 'Portal de Carros'}
              </Link>
              <Link
                href="/comprar-carro"
                className="hover:text-orange-500 transition-colors duration-200"
                title="Comprar Carros"
                aria-label="Comprar Carros"
              >
                Comprar Carros
              </Link>
              <Link
                href="#"
                className="hover:text-orange-500 transition-colors duration-200"
                title="Vender seu carro"
                aria-label="Vender seu carro"
              >
                Vender Carros
              </Link>
              <Link
                href="/sobre"
                className=" hover:text-orange-500 transition-colors duration-200"
                title="Sobre nossa empresa"
                aria-label="Sobre nossa empresa"
              >
                Sobre
              </Link>
              <Link
                href="/contato"
                className="hover:text-orange-500 transition-colors duration-200"
                title="Entre em contato conosco"
                aria-label="Entre em contato conosco"
              >
                Contato
              </Link>
            </nav>

            {/* Botões de ação */}
            <div className="flex items-center space-x-4">
              <Link
                href="/comprar-carro"
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--button-primary-background)',
                  color: 'var(--button-primary-text)',
                  border: '1px solid var(--button-primary-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--button-primary-background)'
                }}
              >
                <span className="hidden sm:inline">Comprar Veículo</span>
                <span className="sm:hidden">Comprar</span>
              </Link>

              {/* <Link
                href="/portal/vender"
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--button-secondary-background)',
                  color: 'var(--button-secondary-text)',
                  border: '1px solid var(--button-secondary-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--button-warning-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--button-warning-background)'
                }}
              >
                Vender Veículo
              </Link> */}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer com cores do arquivo de configuração */}
      <footer
        className="bg-red-500 text-white"
        style={{
          backgroundColor: 'var(--footer-background)',
          color: 'var(--footer-text)',
          borderTop: '1px solid var(--footer-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Coluna 1 - Logo e Descrição */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                {tenant?.profile?.logo_url ? (
                  <Link
                    href="/"
                    title="Ir para página inicial"
                    aria-label="Ir para página inicial"
                  >
                    <Image
                      src={tenant.profile.logo_url}
                      alt={`Logo ${tenant?.profile?.company_name || tenant?.name || 'Portal de Veículos'} - Clique para ir à página inicial`}
                      width={100}
                      height={40}
                      loading="lazy"
                      className="h-10 w-auto object-contain mr-3 hover:opacity-80 transition-opacity"
                    />
                  </Link>
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-justify justify-center mr-3" style={{
                    backgroundColor: 'var(--accent-color)'
                  }}>
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  </div>
                )}
                {/* <span className="text-xl font-bold">
                  {tenant?.name || 'Portal de Veículos'}
                </span> */}
              </div>
              <p className="text-black mb-4 align-justify text-justify" style={{ textAlign: 'justify' }}>
                {tenant?.profile?.company_description || 'Portal especializado na compra e venda de veículos usados e seminovos.'}
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/omegaveiculos" target="_blank" rel="noopener noreferrer" className="text-blue hover:text-orange-500 transition-colors" title="Siga-nos no Facebook">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/omegaveiculos" target="_blank" rel="noopener noreferrer" className="text-red hover:text-orange-500 transition-colors" title="Siga-nos no Instagram">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://wa.me/551530340800" target="_blank" rel="noopener noreferrer" className="text-green hover:text-orange-500 transition-colors" title="Entre em contato via WhatsApp">
                  <span className="sr-only">WhatsApp</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Coluna 2 - Links Rápidos */}
            <div
              className="col-span-1"
              style={{
                backgroundColor: 'var(--footer-columns-background)',
                color: 'var(--footer-columns-text)'
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--footer-columns-title)' }}
              >
                Links Rápidos
              </h3>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-orange-500 transition-colors flex items-center" title="Ir para página inicial" aria-label="Ir para página inicial">{tenant?.profile?.company_name || tenant?.name || 'Portal de Veículos'}</Link></li>
                <li><Link href="/comprar-carro" className="hover:text-white transition-colors" title="Ver veículos disponíveis para compra">Comprar Carros</Link></li>
                <li><Link href="/vender-carro" className="hover:text-orange-500 transition-colors" title="Vender seu veículo">Vender Carros</Link></li>
                <li><Link href="/sobre" className="hover:text-orange-500 transition-colors" title="Saiba mais sobre nossa empresa">Sobre</Link></li>
                <li><Link href="/contato" className="hover:text-orange-500 transition-colors" title="Entre em contato conosco">Contato</Link></li>
              </ul>
            </div>

            {/* Coluna 3 - Contato */}
            <div
              className="col-span-1"
              style={{
                backgroundColor: 'var(--footer-columns-background)',
                color: 'var(--footer-columns-text)'
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--footer-columns-title)' }}
              >
                Contato
              </h3>
              <ul className="space-y-2">
                {tenant?.profile?.company_phone && (
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    {tenant.profile.company_phone}
                  </li>
                )}
                {tenant?.profile?.company_email && (
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    {tenant.profile.company_email}
                  </li>
                )}
                {tenant?.profile?.address && (
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-sm">{tenant.profile.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Linha inferior */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-black">
            <p>&copy; {new Date().getFullYear()} {tenant?.name || 'Portal de Veículos'}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Botão de Acessibilidade */}
      <AccessibilityButton />
      </div>
    </>
  </SEOWrapper>

  )
}
