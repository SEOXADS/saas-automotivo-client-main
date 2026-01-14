'use client'

import { usePathname } from 'next/navigation'
import { getCustomSEOByUrl } from '@/lib/api'
import React, { useEffect } from 'react' 

export default function GlobalSEOWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const tenantId = 1; // Default tenant ID - you might want to get this from context/auth

  const updateMetaTags = (seoData: any) => {
    if (!seoData) return;

    console.log('🌐 GlobalSEOWrapper updating tags for:', pathname, seoData);

    // Update title if exists
    if (seoData.page_title) {
      document.title = seoData.page_title;
    }

    const updateMeta = (name: string, value: string, attr: string = 'name') => {
      if (!value) return;
      
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (meta) {
        meta.setAttribute('content', value);
      }
    };

    // Update basic meta tags
    updateMeta('description', seoData.meta_description);
    updateMeta('keywords', seoData.meta_keywords);
    updateMeta('author', seoData.meta_author);
    updateMeta('robots', seoData.meta_robots);

    // Update Open Graph
    updateMeta('og:title', seoData.og_title || seoData.page_title, 'property');
    updateMeta('og:description', seoData.og_description || seoData.meta_description, 'property');
    updateMeta('og:image', seoData.og_image_url, 'property');
    updateMeta('og:type', seoData.og_type, 'property');

    // Update Twitter
    updateMeta('twitter:title', seoData.twitter_title || seoData.og_title || seoData.page_title);
    updateMeta('twitter:description', seoData.twitter_description || seoData.og_description || seoData.meta_description);
    updateMeta('twitter:image', seoData.twitter_image_url || seoData.og_image_url);
  };

  // Fetch and update SEO when pathname changes
  const updateSEO = async () => {
    try {
      const result = await getCustomSEOByUrl(tenantId, pathname);
      if (result.success && result.data) {
        updateMetaTags(result.data);
      }
    } catch (error) {
      console.error('Error fetching SEO:', error);
    }
  };

  // Run on pathname change
  React.useEffect(() => {
    updateSEO();
  }, [pathname]);

  return <>{children}</>;
}