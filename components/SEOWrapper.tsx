// components/SEOWrapper.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getCustomSeoByUrl } from '@/lib/portal-api'

// ✅ FIX: Allow null values to match CustomSEOEntry type
interface CustomSEOData {
  page_title?: string | null;
  subtitle?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  meta_author?: string | null;
  meta_robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  og_site_name?: string | null;
  og_type?: string | null;
  og_locale?: string | null;
  twitter_card?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image_url?: string | null;
  twitter_site?: string | null;
  twitter_creator?: string | null;
  canonical_url?: string | null;
  structured_data?: Record<string, any> | null;
}

interface SEOWrapperProps {
  tenantId: number;
  defaultTitle: string;
  defaultDescription: string;
  children: React.ReactNode;
  faviconUrl?: string | null;
}

export default function SEOWrapper({ 
  tenantId, 
  defaultTitle, 
  defaultDescription, 
  faviconUrl,
  children 
}: SEOWrapperProps) {
  const [customSEO, setCustomSEO] = useState<CustomSEOData | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const faviconSetRef = useRef(false);  // ✅ Now properly imported

  // ✅ FAVICON EFFECT - Runs after other components
  useEffect(() => {
    if (!faviconUrl || faviconSetRef.current) return;

    // Delay to ensure this runs AFTER all other components
    const timeoutId = setTimeout(() => {
      console.log('🎯 SEOWrapper: Setting favicon...');
      
      // Remove ALL existing favicons
      document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel*="icon"]'
      ).forEach(el => {
        console.log('🗑️ Removing favicon:', el.getAttribute('href')?.substring(0, 50));
        el.remove();
      });

      // Create favicon from base64
      if (faviconUrl.startsWith('data:image/')) {
        const match = faviconUrl.match(/^data:(image\/[^;]+);base64,(.*)$/);
        
        if (match) {
          const [, mimeType, base64Data] = match;
          
          try {
            // Convert to Blob for better Safari compatibility
            const byteCharacters = atob(base64Data);
            const byteArray = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteArray[i] = byteCharacters.charCodeAt(i);
            }
            const blob = new Blob([byteArray], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);

            // Create main favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = mimeType;
            link.href = blobUrl;
            document.head.appendChild(link);

            // Create shortcut icon for older browsers
            const shortcutLink = document.createElement('link');
            shortcutLink.rel = 'shortcut icon';
            shortcutLink.type = mimeType;
            shortcutLink.href = blobUrl;
            document.head.appendChild(shortcutLink);

            faviconSetRef.current = true;
            console.log('✅ SEOWrapper: Favicon set successfully!');
          } catch (error) {
            console.error('❌ SEOWrapper: Error setting favicon:', error);
          }
        }
      } else {
        // Regular URL favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
        
        faviconSetRef.current = true;
        console.log('✅ SEOWrapper: Favicon set (URL)!');
      }
    }, 300);  // 300ms delay to run after other effects

    return () => clearTimeout(timeoutId);
  }, [faviconUrl]);

  useEffect(() => {
    const fetchCustomSEO = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 SEOWrapper: Loading SEO for tenant:', tenantId, 'path:', pathname);
        
        const result = await getCustomSeoByUrl(tenantId, pathname || '/');
        
        console.log('🔍 SEOWrapper API result:', {
          success: result.success,
          hasData: !!result.data,
          pathname,
          tenantId
        });
        
        if (result.success && result.data) {
          setCustomSEO(result.data);
          document.documentElement.setAttribute('data-custom-seo-applied', 'true');
          console.log('✅ Custom SEO loaded for:', pathname, result.data);
        } else {
          document.documentElement.removeAttribute('data-custom-seo-applied');
          setCustomSEO(null);
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

  // ✅ META TAGS UPDATE EFFECT
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

    document.title = title;

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

  if (loading) {
    console.log('⏳ SEOWrapper loading...');
  }

  return <>{children}</>;
}