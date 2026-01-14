// lib/hooks/useCustomSEO.ts
import { useState, useEffect } from 'react';

interface CustomSEOData {
  page_title: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
  canonical_url?: string;
  meta_robots?: string;
  twitter_card?: string;
}

export const useCustomSEO = (tenantId: number, currentPath: string) => {
  const [customSEO, setCustomSEO] = useState<CustomSEOData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomSEO = async () => {
      if (!tenantId || !currentPath) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/custom-seo/get-by-url?tenant_id=${tenantId}&url=${encodeURIComponent(currentPath)}`
        );
        const data = await response.json();
        
        if (data.success && data.data) {
          setCustomSEO(data.data);
        }
      } catch (error) {
        console.error('Error fetching custom SEO:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomSEO();
  }, [tenantId, currentPath]);

  const applyCustomSEO = (defaultTitle?: string, defaultDescription?: string) => {
    if (!customSEO) {
      // Apply default SEO if no custom SEO found
      if (defaultTitle) {
        document.title = defaultTitle;
      }
      return;
    }

    // Apply custom title
    if (customSEO.page_title) {
      document.title = customSEO.page_title;
    }

    // Apply meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Apply meta description
    if (customSEO.meta_description) {
      updateMetaTag('description', customSEO.meta_description);
    }

    // Apply meta keywords
    if (customSEO.meta_keywords) {
      updateMetaTag('keywords', customSEO.meta_keywords);
    }

    // Apply meta robots
    if (customSEO.meta_robots) {
      updateMetaTag('robots', customSEO.meta_robots);
    }

    // Apply Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    if (customSEO.og_title) {
      updateOGTag('og:title', customSEO.og_title);
    }
    if (customSEO.og_description) {
      updateOGTag('og:description', customSEO.og_description);
    }
    if (customSEO.og_image_url) {
      updateOGTag('og:image', customSEO.og_image_url);
    }
    updateOGTag('og:type', 'website');
    updateOGTag('og:locale', 'pt_BR');

    // Apply Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateTwitterTag('twitter:card', customSEO.twitter_card || 'summary');
    if (customSEO.twitter_title) {
      updateTwitterTag('twitter:title', customSEO.twitter_title);
    }
    if (customSEO.twitter_description) {
      updateTwitterTag('twitter:description', customSEO.twitter_description);
    }
    if (customSEO.twitter_image_url) {
      updateTwitterTag('twitter:image', customSEO.twitter_image_url);
    }

    // Apply canonical URL
    if (customSEO.canonical_url) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', customSEO.canonical_url);
    }
  };

  return { customSEO, loading, applyCustomSEO };
};