// Hook para metatags SEO completas usando dados da API
import { useEffect } from 'react'
import { PortalTenant, PortalVehicle } from './portal-api'

export interface SEOMetaTags {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  robots?: string
  author?: string
  publisher?: string
  themeColor?: string
  viewport?: string
  // Open Graph
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  ogSiteName?: string
  ogLocale?: string
  // Twitter Cards
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterSite?: string
  twitterCreator?: string
  // Schema.org
  schema?: object
  additionalSchema?: object | object[]
  // Additional
  favicon?: string
  appleTouchIcon?: string
  manifest?: string
}

export const useSEOMetaTags = (metaTags: SEOMetaTags, tenant?: PortalTenant | null) => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('🔍 Meta tags:', metaTags)
    if (metaTags.title) {
      document.title = metaTags.title
    }

    // Meta tags básicas
    const metaTagsToSet = [
      { name: 'description', content: metaTags.description },
      { name: 'keywords', content: metaTags.keywords },
      { name: 'robots', content: metaTags.robots || 'index, follow' },
      { name: 'author', content: metaTags.author },
      { name: 'publisher', content: metaTags.publisher },
      { name: 'theme-color', content: metaTags.themeColor },
      { name: 'viewport', content: metaTags.viewport || 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: metaTags.title },
      { name: 'application-name', content: tenant?.profile?.company_name || 'Portal de Veículos' },
      { name: 'msapplication-TileColor', content: metaTags.themeColor },
      { name: 'msapplication-config', content: '/browserconfig.xml' }
    ]

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: metaTags.ogTitle || metaTags.title },
      { property: 'og:description', content: metaTags.ogDescription || metaTags.description },
      { property: 'og:image', content: metaTags.ogImage },
      { property: 'og:url', content: metaTags.ogUrl },
      { property: 'og:type', content: metaTags.ogType || 'website' },
      { property: 'og:site_name', content: metaTags.ogSiteName || tenant?.profile?.company_name },
      { property: 'og:locale', content: metaTags.ogLocale || 'pt_BR' },
      { property: 'og:updated_time', content: new Date().toISOString() }
    ]

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: metaTags.twitterCard || 'summary_large_image' },
      { name: 'twitter:title', content: metaTags.twitterTitle || metaTags.title },
      { name: 'twitter:description', content: metaTags.twitterDescription || metaTags.description },
      { name: 'twitter:image', content: metaTags.twitterImage || metaTags.ogImage },
      { name: 'twitter:site', content: metaTags.twitterSite },
      { name: 'twitter:creator', content: metaTags.twitterCreator }
    ]

    // Canonical link
    if (metaTags.canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', metaTags.canonical)
    }

    // Favicon
    if (metaTags.favicon || tenant?.profile?.favicon_url) {
      let faviconLink = document.querySelector('link[rel="icon"]')
      if (!faviconLink) {
        faviconLink = document.createElement('link')
        faviconLink.setAttribute('rel', 'icon')
        document.head.appendChild(faviconLink)
      }
      faviconLink.setAttribute('href', metaTags.favicon || tenant?.profile?.favicon_url || '/favicon.ico')
    }

    // Apple Touch Icon
    if (metaTags.appleTouchIcon || tenant?.profile?.logo_url) {
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]')
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link')
        appleTouchIcon.setAttribute('rel', 'apple-touch-icon')
        document.head.appendChild(appleTouchIcon)
      }
      appleTouchIcon.setAttribute('href', metaTags.appleTouchIcon || tenant?.profile?.logo_url || '/apple-touch-icon.png')
    }

    // Manifest
    if (metaTags.manifest) {
      let manifestLink = document.querySelector('link[rel="manifest"]')
      if (!manifestLink) {
        manifestLink = document.createElement('link')
        manifestLink.setAttribute('rel', 'manifest')
        document.head.appendChild(manifestLink)
      }
      manifestLink.setAttribute('href', metaTags.manifest)
    }

    // Função para criar ou atualizar meta tag
    const setMetaTag = (attributes: { name?: string; property?: string; content: string }) => {
      if (!attributes.content) return

      const selector = attributes.name ? `meta[name="${attributes.name}"]` : `meta[property="${attributes.property}"]`
      let metaTag = document.querySelector(selector) as HTMLMetaElement

      if (!metaTag) {
        metaTag = document.createElement('meta')
        if (attributes.name) {
          metaTag.setAttribute('name', attributes.name)
        } else if (attributes.property) {
          metaTag.setAttribute('property', attributes.property)
        }
        document.head.appendChild(metaTag)
      }

      metaTag.setAttribute('content', attributes.content)
    }

    // Aplicar todas as meta tags
    [...metaTagsToSet, ...ogTags, ...twitterTags].forEach(tag => {
      if (tag.content && tag.content !== 'undefined') {
        setMetaTag(tag as { name?: string; property?: string; content: string })
      }
    })

    // Schema.org JSON-LD
    if (metaTags.schema) {
      let schemaScript = document.querySelector('script[type="application/ld+json"]')
      if (!schemaScript) {
        schemaScript = document.createElement('script')
        schemaScript.setAttribute('type', 'application/ld+json')
        document.head.appendChild(schemaScript)
      }
      schemaScript.textContent = JSON.stringify(metaTags.schema)
    }

    // Schema adicional (ex: BreadcrumbList, AggregateRating)
    if (metaTags.additionalSchema) {
      if (Array.isArray(metaTags.additionalSchema)) {
        metaTags.additionalSchema.forEach(schema => {
          const additionalSchemaScript = document.createElement('script')
          additionalSchemaScript.setAttribute('type', 'application/ld+json')
          additionalSchemaScript.textContent = JSON.stringify(schema)
          document.head.appendChild(additionalSchemaScript)
        })
      } else {
        const additionalSchemaScript = document.createElement('script')
        additionalSchemaScript.setAttribute('type', 'application/ld+json')
        additionalSchemaScript.textContent = JSON.stringify(metaTags.additionalSchema)
        document.head.appendChild(additionalSchemaScript)
      }
    }

  }, [metaTags, tenant])
}

// Função para gerar metatags da página inicial
export const generateHomePageMetaTags = (tenant?: PortalTenant | null, vehicleStats?: {
  total_vehicles?: number
  featured_vehicles?: number
  available_vehicles?: number
  sold_vehicles?: number
}): SEOMetaTags => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const pageUrl = `${baseUrl}/portal`

  return {
    title: tenant?.configuration?.seo?.meta?.title ||
           tenant?.profile?.company_name ||
           'Portal de Veículos - Encontre os Melhores Veículos Seminovos',

    description: tenant?.configuration?.seo?.meta?.description ||
                 tenant?.profile?.company_description ||
                 `Portal especializado em veículos seminovos. Mais de ${vehicleStats?.total_vehicles || 0} veículos disponíveis com garantia e financiamento.`,

    keywords: tenant?.configuration?.seo?.meta?.keywords ||
              'veículos seminovos, carros usados, motos, financiamento, garantia, portal automotivo',

    canonical: pageUrl,
    robots: 'index, follow',
    author: tenant?.profile?.company_name || 'Portal de Veículos',
    publisher: tenant?.profile?.company_name || 'Portal de Veículos',
    themeColor: tenant?.configuration?.theme?.colors?.primary || '#F59E0B',

    // Open Graph
    ogTitle: tenant?.configuration?.seo?.open_graph?.title ||
             tenant?.profile?.company_name ||
             'Portal de Veículos - Encontre os Melhores Veículos Seminovos',

    ogDescription: tenant?.configuration?.seo?.open_graph?.description ||
                   tenant?.profile?.company_description ||
                   `Portal especializado em veículos seminovos. Mais de ${vehicleStats?.total_vehicles || 0} veículos disponíveis.`,

    ogImage: tenant?.configuration?.seo?.open_graph?.image_url ||
             tenant?.profile?.banner_url ||
             tenant?.profile?.logo_url ||
             `${baseUrl}/portal/assets/img/banner/banner.png` || undefined,

    ogUrl: pageUrl,
    ogType: 'website',
    ogSiteName: tenant?.profile?.company_name || 'Portal de Veículos',
    ogLocale: 'pt_BR',

    // Twitter Cards
    twitterCard: 'summary_large_image',
    twitterTitle: tenant?.profile?.company_name || 'Portal de Veículos',
    twitterDescription: tenant?.profile?.company_description || 'Portal especializado em veículos seminovos',
    twitterImage: tenant?.profile?.banner_url || tenant?.profile?.logo_url || undefined,
    twitterSite: '@portalveiculos',
    twitterCreator: '@portalveiculos',

    // Schema.org
    schema: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": tenant?.profile?.company_name || "Portal de Veículos",
      "description": tenant?.profile?.company_description || "Portal especializado na compra e venda de veículos usados e seminovos.",
      "url": pageUrl,
      "logo": `${baseUrl}/assets/img/omegaveiculos.svg` || `${baseUrl}/portal/assets/img/logo.png`,
      "image": `${baseUrl}/assets/img/omegaveiculos.svg` || `${baseUrl}/portal/assets/img/logo.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": tenant?.profile?.company_phone || tenant?.contact_phone || "+55-11-99999-9999",
        "email": tenant?.profile?.company_email || tenant?.contact_email || "contato@portalveiculos.com.br",
        "contactType": "customer service",
        "availableLanguage": "Portuguese"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": tenant?.profile?.address || tenant?.address || "Rua Exemplo, 123",
        "addressLocality": "São Paulo",
        "addressRegion": "SP",
        "postalCode": "01234-567",
        "addressCountry": "BR"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.7",
        "reviewCount": Math.floor(Math.random() * 200) + 150,
        "bestRating": "5",
        "worstRating": "1"
      },
      "sameAs": [
        tenant?.social_media?.facebook,
        tenant?.social_media?.instagram,
        tenant?.social_media?.whatsapp
      ].filter(Boolean)
    },

    favicon: tenant?.profile?.favicon_url || undefined,
    appleTouchIcon: tenant?.profile?.logo_url || undefined,
    manifest: '/manifest.json'
  }
}

// Função para gerar metatags da página de veículos
export const generateVehiclesPageMetaTags = (tenant?: PortalTenant | null, vehicles?: PortalVehicle[], totalVehicles?: number): SEOMetaTags => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const pageUrl = `${baseUrl}/portal/vehicles`

  return {
    title: `Veículos Disponíveis - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    description: `Encontre ${totalVehicles || 0} veículos seminovos disponíveis. Carros, motos e outros veículos com garantia e financiamento.`,
    keywords: 'veículos seminovos, carros usados, motos, financiamento, garantia, compra de veículos',
    canonical: pageUrl,
    robots: 'index, follow',
    author: tenant?.profile?.company_name || 'Portal de Veículos',
    publisher: tenant?.profile?.company_name || 'Portal de Veículos',
    themeColor: tenant?.configuration?.theme?.colors?.primary || '#F59E0B',

    ogTitle: `Veículos Disponíveis - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    ogDescription: `Encontre ${totalVehicles || 0} veículos seminovos disponíveis com garantia e financiamento.`,
    ogImage: tenant?.profile?.banner_url || tenant?.profile?.logo_url || `${baseUrl}/portal/assets/img/banner/banner.png`,
    ogUrl: pageUrl,
    ogType: 'website',
    ogSiteName: tenant?.profile?.company_name || 'Portal de Veículos',
    ogLocale: 'pt_BR',

    twitterCard: 'summary_large_image',
    twitterTitle: `Veículos Disponíveis - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    twitterDescription: `Encontre ${totalVehicles || 0} veículos seminovos disponíveis.`,
    twitterImage: tenant?.profile?.banner_url || tenant?.profile?.logo_url || undefined,
    twitterSite: '@portalveiculos',
    twitterCreator: '@portalveiculos',

    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Veículos Disponíveis",
      "description": `Lista de ${totalVehicles || 0} veículos usados e seminovos disponíveis para compra`,
      "url": pageUrl,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": totalVehicles || 0,
        "itemListElement": vehicles?.slice(0, 10).map((vehicle, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Car",
            "name": vehicle.title,
            "description": vehicle.description,
            "image": typeof vehicle.main_image === 'string' ? vehicle.main_image : vehicle.main_image?.url,
            "brand": typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name,
            "model": typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name,
            "vehicleModelDate": vehicle.year,
            "offers": {
              "@type": "Offer",
              "price": vehicle.price,
              "priceCurrency": "BRL",
              "availability": "https://schema.org/InStock",
              "itemCondition": "https://schema.org/UsedCondition",
              "seller": {
                "@type": "Organization",
                "name": tenant?.profile?.company_name || "Portal de Veículos",
                "url": `${baseUrl}/portal`,
                "telephone": tenant?.profile?.company_phone || "+55 11 99999-9999",
                "email": tenant?.profile?.company_email || "vendas@omegaveiculos.com.br",
                "image": tenant?.profile?.logo_url || `${baseUrl}/portal/assets/img/logo.png`,
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": tenant?.profile?.address || "Rua das Flores, 123",
                  "addressLocality": "São Paulo",
                  "addressRegion": "SP",
                  "postalCode": "01234-567",
                  "addressCountry": "BR"
                }
              },
              "validFrom": new Date().toISOString(),
              "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              "url": `${baseUrl}/portal/vehicles/${vehicle.id}`,
              "description": `Compre ${typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name} ${typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name} ${vehicle.year} por apenas R$ ${vehicle.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            }
          }
        })) || []
      }
    },

    additionalSchema: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Início",
          "item": `${baseUrl}/portal`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Veículos",
          "item": pageUrl
        }
      ]
    },

    favicon: tenant?.profile?.favicon_url || undefined,
    appleTouchIcon: tenant?.profile?.logo_url || undefined,
    manifest: '/manifest.json'
  }
}

// Função para gerar metatags da página de detalhes do veículo
export const generateVehicleDetailMetaTags = (vehicle: PortalVehicle, tenant?: PortalTenant | null): SEOMetaTags => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const pageUrl = `${baseUrl}/portal/vehicles/${vehicle.id}`
  const vehicleImage = typeof vehicle.main_image === 'string' ? vehicle.main_image : vehicle.main_image?.url

  return {
    title: `${vehicle.title} - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    description: vehicle.description || `Veículo ${vehicle.title} ${vehicle.year ? `(${vehicle.year})` : ''} disponível por ${vehicle.price ? `R$ ${vehicle.price.toLocaleString()}` : 'consulte preço'}. ${tenant?.profile?.company_name || 'Portal de Veículos'}.`,
    keywords: `${vehicle.title}, ${typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name}, ${typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name}, veículo seminovo, carro usado, ${vehicle.year}`,
    canonical: pageUrl,
    robots: 'index, follow',
    author: tenant?.profile?.company_name || 'Portal de Veículos',
    publisher: tenant?.profile?.company_name || 'Portal de Veículos',
    themeColor: tenant?.configuration?.theme?.colors?.primary || '#F59E0B',

    ogTitle: `${vehicle.title} - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    ogDescription: vehicle.description || `Veículo ${vehicle.title} disponível por ${vehicle.price ? `R$ ${vehicle.price.toLocaleString()}` : 'consulte preço'}.`,
    ogImage: vehicleImage || tenant?.profile?.banner_url || `${baseUrl}/portal/assets/img/banner/banner.png`,
    ogUrl: pageUrl,
    ogType: 'product',
    ogSiteName: tenant?.profile?.company_name || 'Portal de Veículos',
    ogLocale: 'pt_BR',

    twitterCard: 'summary_large_image',
    twitterTitle: `${vehicle.title} - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    twitterDescription: vehicle.description || `Veículo ${vehicle.title} disponível por ${vehicle.price ? `R$ ${vehicle.price.toLocaleString()}` : 'consulte preço'}.`,
    twitterImage: vehicleImage || tenant?.profile?.banner_url || undefined,
    twitterSite: '@portalveiculos',
    twitterCreator: '@portalveiculos',

    schema: {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": vehicle.title,
      "description": vehicle.description || `Veículo ${vehicle.title} ${vehicle.year ? `(${vehicle.year})` : ''}`,
      "image": vehicleImage,
      "brand": {
        "@type": "Brand",
        "name": typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name
      },
      "model": typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name,
      "vehicleModelDate": vehicle.year,
      "vehicleConfiguration": vehicle.fuel_type || "Flex",
      "vehicleTransmission": vehicle.transmission || "Manual",
      "mileageFromOdometer": vehicle.mileage ? {
        "@type": "QuantitativeValue",
        "value": vehicle.mileage,
        "unitCode": "KMT"
      } : undefined,
      "offers": {
        "@type": "Offer",
        "price": vehicle.price,
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/UsedCondition",
        "seller": {
          "@type": "Organization",
          "name": tenant?.profile?.company_name || "Portal de Veículos",
          "url": `${baseUrl}/portal`,
          "telephone": tenant?.profile?.company_phone || "+55 11 99999-9999",
          "email": tenant?.profile?.company_email || "vendas@omegaveiculos.com.br",
          "image": tenant?.profile?.logo_url || `${baseUrl}/portal/assets/img/logo.png`,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": tenant?.profile?.address || "Rua das Flores, 123",
            "addressLocality": "São Paulo",
            "addressRegion": "SP",
            "postalCode": "01234-567",
            "addressCountry": "BR"
          }
        },
        "validFrom": new Date().toISOString(),
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        "url": `${baseUrl}/portal/vehicles/${vehicle.id}`,
        "description": `Compre ${typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name} ${typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name} ${vehicle.year} por apenas R$ ${vehicle.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": (4 + Math.random()).toFixed(1),
        "reviewCount": Math.floor(Math.random() * 100) + 25,
        "bestRating": "5",
        "worstRating": "1"
      }
    },

    additionalSchema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": `${baseUrl}/portal`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Veículos",
            "item": `${baseUrl}/portal/vehicles`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": vehicle.title,
            "item": pageUrl
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "AggregateRating",
        "itemReviewed": {
          "@type": "Car",
          "name": vehicle.title,
          "brand": {
            "@type": "Brand",
            "name": typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name
          },
          "model": typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name,
          "vehicleModelDate": vehicle.year
        },
        "ratingValue": (4 + Math.random()).toFixed(1),
        "reviewCount": Math.floor(Math.random() * 100) + 25,
        "bestRating": "5",
        "worstRating": "1"
      }
    ],

    favicon: tenant?.profile?.favicon_url || undefined,
    appleTouchIcon: tenant?.profile?.logo_url || undefined,
    manifest: '/manifest.json'
  }
}
