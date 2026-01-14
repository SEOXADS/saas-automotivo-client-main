// components/SEOWrapper.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getCustomSEOByUrl } from '@/lib/api'

interface CustomSEOData {
  page_title?: string;
  subtitle?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_author?: string;
  meta_robots?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  og_site_name?: string;
  og_type?: string;
  og_locale?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
  twitter_site?: string;
  twitter_creator?: string;
  canonical_url?: string;
  structured_data?: Record<string, any>;
}

interface SEOWrapperProps {
  tenantId: number;
  defaultTitle: string;
  defaultDescription: string;
  children: React.ReactNode;
}

export default function SEOWrapper({ 
  tenantId, 
  defaultTitle, 
  defaultDescription, 
  children 
}: SEOWrapperProps) {
  const [customSEO, setCustomSEO] = useState<CustomSEOData | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCustomSEO = async () => {
      try {
        setLoading(true);
        
        // Use your API client function
        const result = await getCustomSEOByUrl(tenantId, pathname);
        
        console.log('🔍 SEOWrapper API result:', {
          success: result.success,
          hasData: !!result.data,
          pathname,
          tenantId
        });
        
        if (result.success && result.data) {
          setCustomSEO(result.data);
          console.log('✅ Custom SEO loaded for:', pathname, result.data);
        } else {
          setCustomSEO(null);
          console.log('ℹ️ No custom SEO for:', pathname, '(using defaults)');
        }
      } catch (error) {
        console.error('❌ Error fetching custom SEO:', error);
        setCustomSEO(null);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId && pathname) {
      fetchCustomSEO();
    }
  }, [tenantId, pathname]);

  // ✅ CRITICAL: Update meta tags when SEO data changes
  useEffect(() => {
    if (!customSEO && !defaultTitle && !defaultDescription) return;

    const title = customSEO?.page_title || defaultTitle;
    const description = customSEO?.meta_description || defaultDescription;
    const keywords = customSEO?.meta_keywords || '';
    const author = customSEO?.meta_author || '';
    const robots = customSEO?.meta_robots || 'index, follow';
    const canonical = customSEO?.canonical_url || (typeof window !== 'undefined' ? window.location.href : '');
    
    // Open Graph
    const ogTitle = customSEO?.og_title || customSEO?.page_title || defaultTitle;
    const ogDescription = customSEO?.og_description || customSEO?.meta_description || defaultDescription;
    const ogImage = customSEO?.og_image_url || '';
    const ogSiteName = customSEO?.og_site_name || defaultTitle;
    const ogType = customSEO?.og_type || 'website';
    const ogLocale = customSEO?.og_locale || 'pt_BR';
    
    // Twitter
    const twitterCard = customSEO?.twitter_card || 'summary_large_image';
    const twitterTitle = customSEO?.twitter_title || customSEO?.page_title || defaultTitle;
    const twitterDescription = customSEO?.twitter_description || customSEO?.meta_description || defaultDescription;
    const twitterImage = customSEO?.twitter_image_url || customSEO?.og_image_url || '';
    const twitterSite = customSEO?.twitter_site || '';
    const twitterCreator = customSEO?.twitter_creator || '';

    console.log('🔄 Updating meta tags with:', { title, description });

    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    updateMetaTag('robots', robots);

    // Open Graph meta tags
    updateMetaTag('og:title', ogTitle, 'property');
    updateMetaTag('og:description', ogDescription, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:locale', ogLocale, 'property');
    updateMetaTag('og:site_name', ogSiteName, 'property');
    updateMetaTag('og:image', ogImage, 'property');

    // Twitter Card meta tags
    updateMetaTag('twitter:card', twitterCard);
    updateMetaTag('twitter:title', twitterTitle);
    updateMetaTag('twitter:description', twitterDescription);
    updateMetaTag('twitter:image', twitterImage);
    if (twitterSite) updateMetaTag('twitter:site', twitterSite);
    if (twitterCreator) updateMetaTag('twitter:creator', twitterCreator);

    // Canonical link
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

    // Structured data
    const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
    if (existingStructuredData) {
      existingStructuredData.remove();
    }

    if (customSEO?.structured_data && Object.keys(customSEO.structured_data).length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(customSEO.structured_data);
      document.head.appendChild(script);
    }

    console.log('✅ Meta tags updated!');
  }, [customSEO, defaultTitle, defaultDescription]);

  // Optional: Show loading state
  if (loading) {
    console.log('⏳ SEOWrapper loading...');
  }

  return <>{children}</>;
}