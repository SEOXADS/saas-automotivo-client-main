'use client'

import { useEffect } from 'react'

interface SchemaOrgData {
  '@context': string
  '@type': string
  name: string
  description?: string
  url?: string
  logo?: string | null
  address?: {
    '@type': string
    streetAddress: string
    addressLocality: string | undefined
    addressRegion: string | undefined
    postalCode: string | undefined
    addressCountry: string
  }
  contactPoint?: {
    '@type': string
    telephone: string
    contactType: string
  }
  sameAs?: (string | undefined)[]
  [key: string]: unknown
}

interface UseMetaTagsProps {
  title?: string
  description?: string
  keywords?: string
  author?: string
  robots?: string
  canonical?: string

  // Open Graph
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  ogSiteName?: string
  ogLocale?: string

  // Twitter Card
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCreator?: string
  twitterSite?: string

  // Schema.org
  schemaOrg?: SchemaOrgData

  // Favicon
  favicon?: string | null

  // Theme Color
  themeColor?: string
}

export function useMetaTags({
  title,
  description,
  keywords,
  author,
  robots,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  ogSiteName,
  ogLocale,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCreator,
  twitterSite,
  schemaOrg,
  favicon,
  themeColor
}: UseMetaTagsProps) {

  useEffect(() => {
    // Atualizar título da página
    if (title) {
      document.title = title
    }

    // Função para atualizar ou criar meta tag
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`) as HTMLMetaElement

      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }

      meta.setAttribute('content', content)
    }

    // Função para remover meta tag
    const removeMetaTag = (name: string, property?: string) => {
      const meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`)
      if (meta) {
        meta.remove()
      }
    }

    // Meta tags básicas
    if (description) updateMetaTag('description', description)
    if (keywords) updateMetaTag('keywords', keywords)
    if (author) updateMetaTag('author', author)
    if (robots) updateMetaTag('robots', robots)

    // Canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.rel = 'canonical'
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.href = canonical
    }

    // Open Graph tags
    if (ogTitle) updateMetaTag('og:title', ogTitle, 'property')
    if (ogDescription) updateMetaTag('og:description', ogDescription, 'property')
    if (ogImage) updateMetaTag('og:image', ogImage, 'property')
    if (ogUrl) updateMetaTag('og:url', ogUrl, 'property')
    if (ogType) updateMetaTag('og:type', ogType, 'property')
    if (ogSiteName) updateMetaTag('og:site_name', ogSiteName, 'property')
    if (ogLocale) updateMetaTag('og:locale', ogLocale, 'property')

    // Twitter Card tags
    if (twitterCard) updateMetaTag('twitter:card', twitterCard)
    if (twitterTitle) updateMetaTag('twitter:title', twitterTitle)
    if (twitterDescription) updateMetaTag('twitter:description', twitterDescription)
    if (twitterImage) updateMetaTag('twitter:image', twitterImage)
    if (twitterCreator) updateMetaTag('twitter:creator', twitterCreator)
    if (twitterSite) updateMetaTag('twitter:site', twitterSite)

    // Favicon
    if (favicon) {
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (!faviconLink) {
        faviconLink = document.createElement('link')
        faviconLink.rel = 'icon'
        document.head.appendChild(faviconLink)
      }
      faviconLink.href = favicon
    }

    // Theme Color
    if (themeColor) {
      let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta')
        themeColorMeta.name = 'theme-color'
        document.head.appendChild(themeColorMeta)
      }
      themeColorMeta.content = themeColor
    }

    // Schema.org structured data
    if (schemaOrg) {
      // Remover script anterior se existir
      const existingScript = document.querySelector('script[type="application/ld+json"]')
      if (existingScript) {
        existingScript.remove()
      }

      // Criar novo script
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(schemaOrg)
      document.head.appendChild(script)
    }

    // Cleanup function
    return () => {
      // Remover meta tags criadas dinamicamente
      if (description) removeMetaTag('description')
      if (keywords) removeMetaTag('keywords')
      if (author) removeMetaTag('author')
      if (robots) removeMetaTag('robots')

      // Remover canonical
      if (canonical) {
        const canonicalLink = document.querySelector('link[rel="canonical"]')
        if (canonicalLink) canonicalLink.remove()
      }

      // Remover Open Graph
      if (ogTitle) removeMetaTag('og:title', 'property')
      if (ogDescription) removeMetaTag('og:description', 'property')
      if (ogImage) removeMetaTag('og:image', 'property')
      if (ogUrl) removeMetaTag('og:url', 'property')
      if (ogType) removeMetaTag('og:type', 'property')
      if (ogSiteName) removeMetaTag('og:site_name', 'property')
      if (ogLocale) removeMetaTag('og:locale', 'property')

      // Remover Twitter Card
      if (twitterCard) removeMetaTag('twitter:card')
      if (twitterTitle) removeMetaTag('twitter:title')
      if (twitterDescription) removeMetaTag('twitter:description')
      if (twitterImage) removeMetaTag('twitter:image')
      if (twitterCreator) removeMetaTag('twitter:creator')
      if (twitterSite) removeMetaTag('twitter:site')

      // Remover Schema.org
      if (schemaOrg) {
        const script = document.querySelector('script[type="application/ld+json"]')
        if (script) script.remove()
      }
    }
  }, [
    title,
    description,
    keywords,
    author,
    robots,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    ogSiteName,
    ogLocale,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCreator,
    twitterSite,
    schemaOrg,
    favicon,
    themeColor
  ])
}
