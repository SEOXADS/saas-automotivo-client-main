'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/Button'
import { Switch } from '@/components/ui/switch'
import ModernImageUpload from '@/components/ui/ModernImageUpload'
import { showSuccess, showError, showWarning, showLoading, closeAlert } from '@/lib/swal'
import {
  Building2,
  Palette,
  Search,
  Settings,
  MapPin,
  Share2,
  Save,
  Globe,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import {
  getTenantConfiguration,
  updateTenantProfile,
  updateTenantTheme,
  updateTenantSeo,
  updateTenantPortalSettings,
  getAllCustomSEO,   
  updateCustomSEO,       
  deleteCustomSEO,       
  CustomSEOEntry         
} from '@/lib/api'
import { TenantConfiguration } from '@/types'

const newSEOTemplate: CustomSEOEntry = {
  id: 0,
  tenant_id: 0,
  page_url: '',
  page_title: '',
  subtitle: '',
  meta_description: '',
  meta_keywords: '',
  meta_author: '',
  meta_robots: 'index, follow',
  og_title: '',
  og_description: '',
  og_image_url: '',
  og_site_name: '',
  og_type: 'website',
  og_locale: 'pt_BR',
  twitter_card: 'summary',
  twitter_title: '',
  twitter_description: '',
  twitter_image_url: '',
  twitter_site: '',
  twitter_creator: '',
  canonical_url: '',
  structured_data: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Componente de seletor de cores (keep as is)
const ColorPicker = ({
  label,
  value,
  onChange,
  className = ""
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}) => (
  <div className={className}>
    <Label htmlFor={label.toLowerCase().replace(/\s+/g, '_')} className="capitalize mb-2 block">
      {label}
    </Label>
    <div className="flex gap-2 items-center">
      <Input
        id={label.toLowerCase().replace(/\s+/g, '_')}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 h-10 p-1 border rounded cursor-pointer"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1"
      />
      <div
        className="w-10 h-10 rounded border shadow-inner"
        style={{ backgroundColor: value }}
      />
    </div>
  </div>
)

export default function ConfigurationPage() {
  const [config, setConfig] = useState<TenantConfiguration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [customSeoList, setCustomSeoList] = useState<CustomSEOEntry[]>([])
  const [editingSeo, setEditingSeo] = useState<CustomSEOEntry | null>(null)
  const [seoLoading, setSeoLoading] = useState(false)

  // Carregar configurações iniciais
  useEffect(() => {
    console.log('🚀 useEffect - Iniciando carregamento de configurações...')
    loadConfiguration()
  }, [])

  // Debug: Log das configurações quando mudarem
    useEffect(() => {
    if (config?.profile?.id) {
      loadCustomSEO();
    }
  }, [config?.profile?.id])

  const loadCustomSEO = async () => {
    try {
      setSeoLoading(true);
      const tenantId = config?.profile?.id;
      if (!tenantId) {
        console.error('Tenant ID não encontrado');
        return;
      }
      
      const response = await getAllCustomSEO(tenantId);
      if (response.success && response.data) {
        // ✅ FIX: Add type assertion with array validation
        const seoData = Array.isArray(response.data) 
          ? (response.data as CustomSEOEntry[]) 
          : [];
        setCustomSeoList(seoData);
        console.log('✅ Custom SEO carregado:', seoData);
      } else {
        console.error('Erro ao carregar custom SEO:', response.error);
        setCustomSeoList([]); // ✅ Reset to empty array on error
      }
    } catch (error) {
      console.error('Error loading custom SEO:', error);
      setCustomSeoList([]); // ✅ Reset to empty array on exception
    } finally {
      setSeoLoading(false);
    }
  };

  const saveCustomSEO = async (seoData: CustomSEOEntry) => {
    try {
      showLoading('Salvando configuração SEO...');
      
      const tenantId = config?.profile?.id;
      if (!tenantId) {
        throw new Error('Tenant ID não encontrado');
      }

      // ✅ Build data matching the imported CustomSEOEntry type
      const dataToSave: Partial<CustomSEOEntry> = {
        tenant_id: tenantId,
        page_url: seoData.page_url?.trim() || '',
        page_title: seoData.page_title?.trim() || '',
        
        // Use undefined instead of null OR keep null (both work now)
        subtitle: seoData.subtitle?.trim() || undefined,
        meta_description: seoData.meta_description?.trim() || undefined,
        meta_keywords: seoData.meta_keywords?.trim() || undefined,
        meta_author: seoData.meta_author?.trim() || undefined,
        meta_robots: seoData.meta_robots || 'index, follow',
        
        og_title: seoData.og_title?.trim() || undefined,
        og_description: seoData.og_description?.trim() || undefined,
        og_image_url: seoData.og_image_url?.trim() || undefined,
        og_site_name: seoData.og_site_name?.trim() || undefined,
        og_type: seoData.og_type || 'website',
        og_locale: seoData.og_locale || 'pt_BR',
        
        twitter_card: seoData.twitter_card || 'summary',
        twitter_title: seoData.twitter_title?.trim() || undefined,
        twitter_description: seoData.twitter_description?.trim() || undefined,
        twitter_image_url: seoData.twitter_image_url?.trim() || undefined,
        twitter_site: seoData.twitter_site?.trim() || undefined,
        twitter_creator: seoData.twitter_creator?.trim() || undefined,
        
        canonical_url: seoData.canonical_url?.trim() || undefined,
        structured_data: Object.keys(seoData.structured_data || {}).length > 0 
          ? seoData.structured_data 
          : undefined,
      };

      if (seoData.id && seoData.id > 0) {
        dataToSave.id = seoData.id;
      }

      console.log('📤 Dados a serem enviados:', JSON.stringify(dataToSave, null, 2));
      
      const response = await updateCustomSEO(dataToSave);
      
      closeAlert();
      
      if (response.success) {
        await showSuccess('Configuração SEO salva com sucesso!', '✅ Salvo');
        setEditingSeo(null);
        loadCustomSEO();
      } else {
        const errorMsg = response.errors 
          ? `Erros de validação: ${JSON.stringify(response.errors)}`
          : (response.error || 'Erro ao salvar');
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Erro ao salvar custom SEO:', error);
      closeAlert();
      await showError(error.message || 'Erro ao salvar configuração SEO', '❌ Erro');
    }
  };



  const handleDeleteCustomSEO = async (id: number) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta configuração SEO?')) {
        return;
      }
      
      showLoading('Excluindo configuração...');
      
      const response = await deleteCustomSEO(id);
      
      closeAlert();
      
      if (response.success) {
        await showSuccess('Configuração excluída com sucesso!', '✅ Excluído');
        loadCustomSEO();
      } else {
        throw new Error(response.error || 'Erro ao excluir');
      }
    } catch (error: any) {
      console.error('Erro ao excluir custom SEO:', error);
      closeAlert();
      await showError(error.message || 'Erro ao excluir configuração SEO', '❌ Erro');
    }
  };

  
  useEffect(() => {
    console.log('🔄 useEffect - config mudou:', config)
    if (config) {
      console.log('🔍 Debug - Configuração completa:', config)
      console.log('🔍 Debug - Tema:', config.theme)
      console.log('🔍 Debug - Cores do tema:', config.theme?.colors)
      console.log('🔍 Debug - Object.entries das cores:', Object.entries(config.theme?.colors || {}))
    } else {
      console.log('❌ useEffect - config é null/undefined')
    }
  }, [config])

  const loadConfiguration = async () => {
    try {
      setLoading(true)
      console.log('🔄 Iniciando carregamento de configurações...')

      // Tentar carregar configurações da API
      const response = await getTenantConfiguration()
      console.log('📡 Resposta da API:', response)

      if (response.success && response.data) {
        console.log('✅ Configurações carregadas da API:', response.data)
        console.log('🔍 Tipo de response.data:', typeof response.data)
        console.log('🔍 Estrutura de response.data:', Object.keys(response.data))

        // Verificar se response.data tem a estrutura esperada
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiData = response.data as any
        console.log('🔍 Profile na API:', apiData?.profile)
        console.log('🔍 Theme na API:', apiData?.theme)
        console.log('🔍 SEO na API:', apiData?.seo)
        console.log('🔍 Portal na API:', apiData?.portal_settings)

        // Garantir que sempre haja cores padrão
        const defaultColors = {
          primary: '#3B82F6',
          secondary: '#64748B',
          accent: '#F59E0B',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
          background: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#1E293B',
          text_muted: '#64748B'
        }

        // Mapear dados da API para estrutura do frontend
        const mappedConfig = {
          profile: {
            id: apiData.profile?.id || apiData.id || 1,
            name: apiData.profile?.company_name || apiData.company_name || apiData.profile?.name || '',
            description: apiData.profile?.company_description || apiData.company_description || apiData.profile?.description || '',
            cnpj: apiData.profile?.company_cnpj || apiData.company_cnpj || apiData.profile?.cnpj || '',
            phone: apiData.profile?.company_phone || apiData.company_phone || apiData.profile?.phone || '',
            email: apiData.profile?.company_email || apiData.company_email || apiData.profile?.email || '',
            website: apiData.profile?.company_website || apiData.company_website || apiData.profile?.website || '',
            address: {
              street: apiData.profile?.address_street || apiData.address_street || '',
              number: apiData.profile?.address_number || apiData.address_number || '',
              complement: apiData.profile?.address_complement || apiData.address_complement || '',
              neighborhood: apiData.profile?.address_district || apiData.address_district || '',
              city: apiData.profile?.address_city || apiData.address_city || '',
              state: apiData.profile?.address_state || apiData.address_state || '',
              zip_code: apiData.profile?.address_zipcode || apiData.address_zipcode || '',
              country: apiData.profile?.address_country || apiData.address_country || 'Brasil'
            },
            business_hours: apiData.profile?.business_hours || {
              monday: ['08:00', '18:00'],
              tuesday: ['08:00', '18:00'],
              wednesday: ['08:00', '18:00'],
              thursday: ['08:00', '18:00'],
              friday: ['08:00', '18:00'],
              saturday: ['08:00', '12:00'],
              sunday: []
            },
            social_media: apiData.profile?.social_media ?
              (typeof apiData.profile.social_media === 'string' ?
                JSON.parse(apiData.profile.social_media) :
                apiData.profile.social_media) :
              {
                facebook: '',
                instagram: '',
                twitter: '',
                linkedin: '',
                youtube: '',
                whatsapp: ''
              },
            logo_url: apiData.profile?.logo_url || apiData.logo_url || '',
            favicon_url: apiData.profile?.favicon_url || apiData.favicon_url || '',
            banner_url: apiData.profile?.banner_url || apiData.banner_url || '',
            created_at: apiData.profile?.created_at || new Date().toISOString(),
            updated_at: apiData.profile?.updated_at || new Date().toISOString()
          },
          theme: {
            id: apiData.theme?.id || 1,
            colors: {
              ...defaultColors,
              primary: apiData.theme?.primary_color || apiData.primary_color || defaultColors.primary,
              secondary: apiData.theme?.secondary_color || apiData.secondary_color || defaultColors.secondary,
              accent: apiData.theme?.accent_color || apiData.accent_color || defaultColors.accent,
              ...(apiData.theme?.colors || {})
            },
            typography: {
              font_family: apiData.theme?.font_family || 'Inter',
              font_sizes: apiData.theme?.font_sizes || {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem'
              },
              font_weights: {
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700
              }
            },
            layout: {
              border_radius: apiData.theme?.border_radius || '0.5rem',
              spacing: '1rem',
              container_max_width: '1200px',
              sidebar_width: '280px'
            },
            components: apiData.theme?.components || {
              buttons: {
                primary_style: 'rounded',
                secondary_style: 'rounded',
                size: 'medium'
              },
              cards: {
                shadow: 'medium',
                border: 'subtle'
              },
              forms: {
                layout: 'vertical',
                spacing: 'medium'
              }
            },
            features: apiData.theme?.features || {
              dark_mode: false,
              animations: true,
              transitions: true
            },
            custom_css: apiData.theme?.custom_css || '',
            css_variables: apiData.theme?.css_variables || {},
            created_at: apiData.theme?.created_at || new Date().toISOString(),
            updated_at: apiData.theme?.updated_at || new Date().toISOString()
          },
          seo: {
          id: apiData.seo?.id || 1,
          meta: {
            // Prioridade: 1) SEO title específico, 2) OG title, 3) Nome da empresa como último fallback
            title: apiData.seo?.meta_title 
              || apiData.meta_title 
              || apiData.seo?.og_title 
              || apiData.og_title 
              || apiData.profile?.company_name  // fallback final
              || '',
            description: apiData.seo?.meta_description 
              || apiData.meta_description 
              || apiData.profile?.company_description 
              || '',
            keywords: apiData.seo?.meta_keywords || apiData.meta_keywords || '',
            author: apiData.seo?.meta_author || apiData.meta_author || '',
            robots: apiData.seo?.meta_robots || apiData.meta_robots || 'index, follow',
            canonical_url: apiData.seo?.canonical_url || apiData.canonical_url || ''
          },
          open_graph: {
            // OG title deve herdar do meta title se não existir
            title: apiData.seo?.og_title 
              || apiData.og_title 
              || apiData.seo?.meta_title  // Herda do SEO title
              || apiData.meta_title 
              || '',
            description: apiData.seo?.og_description || apiData.og_description || '',
            image_url: apiData.seo?.og_image || apiData.og_image || '',
            // site_name é diferente de title - é o nome do site/marca
            site_name: apiData.seo?.og_site_name 
              || apiData.og_site_name 
              || apiData.profile?.company_name  // Nome da empresa para site_name
              || '',
            type: apiData.seo?.og_type || apiData.og_type || 'website',
            locale: apiData.seo?.og_locale || apiData.og_locale || 'pt_BR'
          },
            twitter_card: {
              card_type: apiData.seo?.twitter_card || 'summary',
              title: apiData.seo?.twitter_title || apiData.twitter_title || '',
              description: apiData.seo?.twitter_description || apiData.twitter_description || '',
              image_url: apiData.seo?.twitter_image || apiData.twitter_image || '',
              creator: apiData.seo?.twitter_creator || apiData.twitter_creator || '',
              site: apiData.seo?.twitter_site || apiData.twitter_site || ''
            },
            schema_org: {
              organization_type: 'Organization',
              industry: 'Automotive',
              founding_date: '',
              contact_point: {
                type: 'customer service',
                telephone: '',
                contact_type: 'customer service'
              },
              same_as: []
            },
            advanced: {
              amp_enabled: false,
              sitemap_enabled: apiData.seo?.enable_sitemap || apiData.enable_sitemap || true,
              structured_data: true
            },
            created_at: apiData.seo?.created_at || new Date().toISOString(),
            updated_at: apiData.seo?.updated_at || new Date().toISOString()
          },
          portal_settings: {
            id: apiData.portal_settings?.id || 1,
            features: {
              search: apiData.portal_settings?.enable_search ?? apiData.enable_search ?? true,
              filters: apiData.portal_settings?.enable_filters ?? apiData.enable_filters ?? true,
              comparison: apiData.portal_settings?.enable_comparison ?? apiData.enable_comparison ?? true,
              wishlist: apiData.portal_settings?.enable_favorites ?? apiData.enable_favorites ?? false,
              reviews: apiData.portal_settings?.enable_reviews ?? apiData.enable_reviews ?? false,
              financing_calculator: false,
              vehicle_history: false,
              whatsapp_button: apiData.portal_settings?.enable_contact_form ?? apiData.enable_contact_form ?? true
            },
            display: {
              vehicles_per_page: apiData.portal_settings?.vehicles_per_page || apiData.vehicles_per_page || 12,
              max_comparison_items: 3,
              show_prices: apiData.portal_settings?.show_price ?? apiData.show_price ?? true,
              show_mileage: apiData.portal_settings?.show_mileage ?? apiData.show_mileage ?? true,
              show_fuel_consumption: true,
              image_gallery: true,
              video_support: false
            },
            forms: {
              required_fields: ['name', 'email', 'phone'],
              captcha_enabled: false,
              gdpr_compliance: true,
              privacy_policy_url: '',
              terms_url: ''
            },
            integrations: {
              google_analytics_id: apiData.portal_settings?.google_analytics_id || apiData.google_analytics_id || '',
              facebook_pixel_id: apiData.portal_settings?.facebook_pixel_id || apiData.facebook_pixel_id || '',
              whatsapp_number: apiData.portal_settings?.whatsapp_number || apiData.whatsapp_number || '',
              google_maps_api_key: apiData.portal_settings?.google_maps_api_key || apiData.google_maps_api_key || '',
              recaptcha_site_key: apiData.portal_settings?.recaptcha_site_key || apiData.recaptcha_site_key || ''
            },
            performance: {
              image_optimization: apiData.portal_settings?.image_optimization ?? apiData.image_optimization ?? true,
              lazy_loading: apiData.portal_settings?.lazy_loading ?? apiData.lazy_loading ?? true,
              cache_enabled: apiData.portal_settings?.cache_enabled ?? apiData.cache_enabled ?? true,
              cdn_enabled: apiData.portal_settings?.cdn_enabled ?? apiData.cdn_enabled ?? false
            },
            created_at: apiData.portal_settings?.created_at || new Date().toISOString(),
            updated_at: apiData.portal_settings?.updated_at || new Date().toISOString()
          }
        }

        console.log('🔧 Configuração mapeada:', mappedConfig)
        console.log('🔧 mappedConfig.profile.name:', mappedConfig.profile.name)
        console.log('🔧 mappedConfig.profile.email:', mappedConfig.profile.email)
        console.log('🔧 mappedConfig.theme.colors:', mappedConfig.theme.colors)

        setConfig(mappedConfig as unknown as TenantConfiguration)
      } else {
        console.log('⚠️ API não retornou dados, usando configurações padrão')
        console.log('❌ Erro da API:', response.error)
        console.log('🔍 Fonte do erro:', response._source)

        // Mostrar mensagem específica baseada no tipo de erro
        let errorMessage = 'Erro ao carregar configurações'
        if (response._source === 'no_token') {
          errorMessage = 'Usuário não autenticado. Faça login para continuar.'
        } else if (response._source === 'unauthorized') {
          errorMessage = 'Sessão expirada. Faça login novamente.'
        } else if (response._source === 'not_found') {
          errorMessage = 'Serviço de configurações não disponível.'
        } else if (response._source === 'api_error') {
          errorMessage = `Erro da API: ${response.error}`
        }

        await showWarning(errorMessage, '⚠️ Aviso')

        // Usar dados padrão se a API não retornar dados
        const defaultConfig: TenantConfiguration = {
          profile: {
            id: 1,
            name: 'ÔMEGA Veículos',
            description: 'Concessionária especializada em veículos seminovos',
            cnpj: '12.345.678/0001-90',
            phone: '(11) 99999-9999',
            email: 'contato@omegaveiculos.com.br',
            website: 'https://omegaveiculos.com.br',
            address: {
              street: 'Rua das Flores',
              number: '123',
              complement: 'Sala 45',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
              zip_code: '01234-567',
              country: 'Brasil'
            },
            business_hours: {
              monday: ['08:00', '18:00'],
              tuesday: ['08:00', '18:00'],
              wednesday: ['08:00', '18:00'],
              thursday: ['08:00', '18:00'],
              friday: ['08:00', '18:00'],
              saturday: ['08:00', '12:00'],
              sunday: []
            },
            social_media: {
              facebook: 'https://facebook.com/omegaveiculos',
              instagram: 'https://instagram.com/omegaveiculos',
              twitter: 'https://twitter.com/omegaveiculos',
              linkedin: 'https://linkedin.com/company/omegaveiculos',
              youtube: 'https://youtube.com/omegaveiculos',
              whatsapp: '(11) 99999-9999'
            },
            logo_url: '',
            favicon_url: '',
            banner_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          theme: {
            id: 1,
            colors: {
              primary: '#3B82F6',
              secondary: '#64748B',
              accent: '#F59E0B',
              success: '#10B981',
              warning: '#F59E0B',
              danger: '#EF4444',
              info: '#3B82F6',
              background: '#F8FAFC',
              surface: '#FFFFFF',
              text: '#1E293B',
              text_muted: '#64748B',

              // Cores do Head
              head: {
                background: '#EF4444',
                text: '#FFFFFF',
                border: '#DC2626'
              },

              // Cores do Footer
              footer: {
                background: '#1F2937',
                text: '#F9FAFB',
                border: '#374151',
                columns: {
                  background: '#111827',
                  text: '#D1D5DB',
                  title: '#F9FAFB'
                }
              },

              // Cores do Banner
              banner: {
                background: '#1F2937',
                text: '#FFFFFF',
                overlay: 'rgba(0, 0, 0, 0.5)'
              },

              // Cores dos Botões
              buttons: {
                primary: {
                  background: '#3B82F6',
                  text: '#FFFFFF',
                  hover_background: '#2563EB',
                  hover_text: '#FFFFFF',
                  border: '#3B82F6'
                },
                secondary: {
                  background: '#64748B',
                  text: '#FFFFFF',
                  hover_background: '#475569',
                  hover_text: '#FFFFFF',
                  border: '#64748B'
                },
                accent: {
                  background: '#F59E0B',
                  text: '#FFFFFF',
                  hover_background: '#D97706',
                  hover_text: '#FFFFFF',
                  border: '#F59E0B'
                }
              }
            },
            typography: {
              font_family: 'Inter',
              font_sizes: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem'
              },
              font_weights: {
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700
              }
            },
            layout: {
              border_radius: '0.5rem',
              spacing: '1rem',
              container_max_width: '1200px',
              sidebar_width: '280px'
            },
            components: {
              buttons: {
                primary_style: 'filled',
                secondary_style: 'outlined',
                size: 'medium'
              },
              cards: {
                shadow: 'medium',
                border: 'thin'
              },
              forms: {
                input_style: 'outlined',
                label_style: 'floating'
              }
            },
            features: {
              dark_mode: false,
              animations: true,
              transitions: true
            },
            custom_css: '',
            css_variables: {
              '--primary-color': '#3B82F6',
              '--secondary-color': '#64748B',
              '--accent-color': '#F59E0B',
              '--success-color': '#10B981',
              '--warning-color': '#F59E0B',
              '--danger-color': '#EF4444',
              '--info-color': '#3B82F6',
              '--background-color': '#F8FAFC',
              '--surface-color': '#FFFFFF',
              '--text-color': '#1E293B',
              '--text-muted-color': '#64748B'
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          seo: {
            id: 1,
            meta: {
              title: 'ÔMEGA Veículos - Seminovos de Qualidade',
              description: 'Encontre o carro dos seus sonhos na ÔMEGA Veículos. Seminovos selecionados com garantia.',
              keywords: 'carros seminovos, veículos usados, concessionária, São Paulo',
              author: 'ÔMEGA Veículos',
              robots: 'index, follow',
              canonical_url: 'https://omegaveiculos.com.br'
            },
            open_graph: {
              title: 'ÔMEGA Veículos - Seminovos de Qualidade',
              description: 'Encontre o carro dos seus sonhos na ÔMEGA Veículos',
              image_url: '',
              site_name: 'ÔMEGA Veículos',
              type: 'website',
              locale: 'pt_BR'
            },
            twitter_card: {
              card_type: 'summary_large_image',
              title: 'ÔMEGA Veículos - Seminovos de Qualidade',
              description: 'Encontre o carro dos seus sonhos',
              image_url: '',
              creator: '@omegaveiculos',
              site: '@omegaveiculos'
            },
            schema_org: {
              organization_type: 'AutomotiveBusiness',
              industry: 'Automotive',
              founding_date: '2020-01-01',
              contact_point: {
                type: 'ContactPoint',
                telephone: '(11) 99999-9999',
                contact_type: 'customer service'
              },
              same_as: [
                'https://facebook.com/omegaveiculos',
                'https://instagram.com/omegaveiculos'
              ]
            },
            advanced: {
              amp_enabled: false,
              sitemap_enabled: true,
              structured_data: true
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          portal_settings: {
            id: 1,
            features: {
              search: true,
              filters: true,
              comparison: true,
              wishlist: true,
              reviews: true,
              financing_calculator: true,
              vehicle_history: true,
              whatsapp_button: true
            },
            display: {
              vehicles_per_page: 12,
              max_comparison_items: 3,
              show_prices: true,
              show_mileage: true,
              show_fuel_consumption: true,
              image_gallery: true,
              video_support: false
            },
            forms: {
              required_fields: ['name', 'email', 'phone'],
              captcha_enabled: true,
              gdpr_compliance: true,
              privacy_policy_url: 'https://omegaveiculos.com.br/privacidade',
              terms_url: 'https://omegaveiculos.com.br/termos'
            },
            integrations: {
              google_analytics_id: '',
              facebook_pixel_id: '',
              whatsapp_number: '(11) 99999-9999',
              google_maps_api_key: '',
              recaptcha_site_key: ''
            },
            performance: {
              image_optimization: true,
              lazy_loading: true,
              cache_enabled: true,
              cdn_enabled: false
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }

        setConfig(defaultConfig as unknown as TenantConfiguration)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      await showError('Não foi possível carregar as configurações', '❌ Erro')
    } finally {
      setLoading(false)
    }
  }

  const saveConfiguration = async () => {
    if (!config) return

    try {
      setSaving(true)
      showLoading('Salvando configurações...')

      console.log('💾 Salvando configurações:', config)
      console.log('🔍 Profile a ser salvo:', config.profile)
      console.log('🔍 Theme a ser salvo:', config.theme)
      console.log('🔍 SEO a ser salvo:', config.seo)
      console.log('🔍 Portal a ser salvo:', config.portal_settings)

      // Salvar cada seção separadamente
      const results = await Promise.allSettled([
        updateTenantProfile(config.profile),
        updateTenantTheme(config.theme),
        updateTenantSeo(config.seo),
        updateTenantPortalSettings(config.portal_settings)
      ])

      console.log('📊 Resultados das operações:', results)

      // Verificar resultados
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value?.success).length
      const totalCount = results.length

      console.log(`📈 Sucessos: ${successCount}/${totalCount}`)

      closeAlert() // Fechar loading

      if (successCount === totalCount) {
        await showSuccess(
          'Todas as configurações foram salvas com sucesso!',
          '✅ Configurações Salvas'
        )
      } else if (successCount > 0) {
        await showWarning(
          `${successCount} de ${totalCount} seções foram salvas. Algumas configurações podem não ter sido aplicadas.`,
          '⚠️ Parcialmente Salvo'
        )
      } else {
        throw new Error('Nenhuma configuração foi salva')
      }

      console.log('✅ Configurações salvas com sucesso')
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
      closeAlert() // Fechar loading se houver erro

      await showError(
        'Não foi possível salvar as configurações. Verifique o console para mais detalhes.',
        '❌ Erro ao Salvar'
      )
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (section: keyof TenantConfiguration, updates: Partial<TenantConfiguration[keyof TenantConfiguration]>) => {
    if (!config) return
    setConfig(prev => prev ? { ...prev, [section]: { ...prev[section], ...updates } } : null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
          <p className="text-gray-600">Não foi possível carregar as configurações.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações do Portal</h1>
        <p className="text-gray-600">
          Gerencie todas as configurações do seu portal de veículos em um só lugar
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5"> {/* Change from 4 to 5 */}
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Empresa
        </TabsTrigger>
        <TabsTrigger value="theme" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Tema
        </TabsTrigger>
        <TabsTrigger value="seo" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          SEO Geral
        </TabsTrigger>
        <TabsTrigger value="custom-seo" className="flex items-center gap-2">
          <Globe className="h-4 w-4" /> {/* Use Globe icon instead of Settings */}
          SEO Personalizado
        </TabsTrigger>
        <TabsTrigger value="portal" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Portal
        </TabsTrigger>
      </TabsList>

        {/* Aba: Perfil da Empresa */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Configure as informações básicas da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={config.profile?.name || ''}
                    onChange={(e) => updateConfig('profile', { name: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={config.profile?.cnpj || ''}
                    onChange={(e) => updateConfig('profile', { cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={config.profile?.phone || ''}
                    onChange={(e) => updateConfig('profile', { phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.profile?.email || ''}
                    onChange={(e) => updateConfig('profile', { email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={config.profile?.website || ''}
                    onChange={(e) => updateConfig('profile', { website: e.target.value })}
                    placeholder="https://empresa.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={config.profile?.description || ''}
                  onChange={(e) => updateConfig('profile', { description: e.target.value })}
                  placeholder="Descreva sua empresa..."
                  rows={3}
                />
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={config.profile?.address?.street || ''}
                      onChange={(e) => updateConfig('profile', {
                        address: {
                          street: e.target.value,
                          number: config.profile?.address?.number || '',
                          complement: config.profile?.address?.complement || '',
                          neighborhood: config.profile?.address?.neighborhood || '',
                          city: config.profile?.address?.city || '',
                          state: config.profile?.address?.state || '',
                          zip_code: config.profile?.address?.zip_code || '',
                          country: config.profile?.address?.country || ''
                        }
                      })}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={config.profile?.address?.number || ''}
                      onChange={(e) => updateConfig('profile', {
                        address: {
                          street: config.profile?.address?.street || '',
                          number: e.target.value,
                          complement: config.profile?.address?.complement || '',
                          neighborhood: config.profile?.address?.neighborhood || '',
                          city: config.profile?.address?.city || '',
                          state: config.profile?.address?.state || '',
                          zip_code: config.profile?.address?.zip_code || '',
                          country: config.profile?.address?.country || ''
                        }
                      })}
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={config.profile?.address?.complement || ''}
                      onChange={(e) => updateConfig('profile', {
                        address: {
                          street: config.profile?.address?.street || '',
                          number: config.profile?.address?.number || '',
                          complement: e.target.value,
                          neighborhood: config.profile?.address?.neighborhood || '',
                          city: config.profile?.address?.city || '',
                          state: config.profile?.address?.state || '',
                          zip_code: config.profile?.address?.zip_code || '',
                          country: config.profile?.address?.country || ''
                        }
                      })}
                      placeholder="Sala 45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={config.profile.address?.neighborhood || ''}
                      onChange={(e) => updateConfig('profile', {
                        address: {
                          street: config.profile.address?.street || '',
                          number: config.profile.address?.number || '',
                          complement: config.profile.address?.complement || '',
                          neighborhood: e.target.value,
                          city: config.profile.address?.city || '',
                          state: config.profile.address?.state || '',
                          zip_code: config.profile.address?.zip_code || '',
                          country: config.profile.address?.country || ''
                        }
                      })}
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={config.profile.address?.city || ''}
                      onChange={(e) => updateConfig('profile', {
                        address: {
                          street: config.profile.address?.street || '',
                          number: config.profile.address?.number || '',
                          complement: config.profile.address?.complement || '',
                          neighborhood: config.profile.address?.neighborhood || '',
                          city: e.target.value,
                          state: config.profile.address?.state || '',
                          zip_code: config.profile.address?.zip_code || '',
                          country: config.profile.address?.country || ''
                        }
                      })}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={config.profile.address?.state || ''}
                      onChange={(e) => updateConfig('profile', {
                        address: {
                          street: config.profile.address?.street || '',
                          number: config.profile.address?.number || '',
                          complement: config.profile.address?.complement || '',
                          neighborhood: config.profile.address?.neighborhood || '',
                          city: config.profile.address?.city || '',
                          state: e.target.value,
                          zip_code: config.profile.address?.zip_code || '',
                          country: config.profile.address?.country || ''
                        }
                      })}
                      placeholder="SP"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={config.profile.address?.zip_code || ''}
                      onChange={(e) => updateConfig('profile', {
                        address: {
                          street: config.profile.address?.street || '',
                          number: config.profile.address?.number || '',
                          complement: config.profile.address?.complement || '',
                          neighborhood: config.profile.address?.neighborhood || '',
                          city: config.profile.address?.city || '',
                          state: config.profile.address?.state || '',
                          zip_code: e.target.value,
                          country: config.profile.address?.country || ''
                        }
                      })}
                      placeholder="01234-567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={config.profile.address?.country || ''}
                      onChange={(e) => updateConfig('profile', {
                        address: {
                          street: config.profile.address?.street || '',
                          number: config.profile.address?.number || '',
                          complement: config.profile.address?.complement || '',
                          neighborhood: config.profile.address?.neighborhood || '',
                          city: config.profile.address?.city || '',
                          state: config.profile.address?.state || '',
                          zip_code: config.profile.address?.zip_code || '',
                          country: e.target.value
                        }
                      })}
                      placeholder="Brasil"
                    />
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Redes Sociais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={config.profile.social_media?.facebook || ''}
                      onChange={(e) => updateConfig('profile', {
                        social_media: {
                          facebook: e.target.value,
                          instagram: config.profile.social_media?.instagram || '',
                          twitter: config.profile.social_media?.twitter || '',
                          linkedin: config.profile.social_media?.linkedin || '',
                          youtube: config.profile.social_media?.youtube || '',
                          whatsapp: config.profile.social_media?.whatsapp || ''
                        }
                      })}
                      placeholder="https://facebook.com/empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={config.profile.social_media?.instagram || ''}
                      onChange={(e) => updateConfig('profile', {
                        social_media: {
                          facebook: config.profile.social_media?.facebook || '',
                          instagram: e.target.value,
                          twitter: config.profile.social_media?.twitter || '',
                          linkedin: config.profile.social_media?.linkedin || '',
                          youtube: config.profile.social_media?.youtube || '',
                          whatsapp: config.profile.social_media?.whatsapp || ''
                        }
                      })}
                      placeholder="https://instagram.com/empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={config.profile.social_media?.whatsapp || ''}
                      onChange={(e) => updateConfig('profile', {
                        social_media: {
                          facebook: config.profile.social_media?.facebook || '',
                          instagram: config.profile.social_media?.instagram || '',
                          twitter: config.profile.social_media?.twitter || '',
                          linkedin: config.profile.social_media?.linkedin || '',
                          youtube: config.profile.social_media?.youtube || '',
                          whatsapp: e.target.value
                        }
                      })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Imagens */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Imagens
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ModernImageUpload
                    label="Logo da Empresa"
                    value={config.profile.logo_url || ''}
                    onChange={(url) => updateConfig('profile', { logo_url: url })}
                    imageType="logo"
                    maxSize={2}
                    description="Logo principal da sua empresa que aparecerá no cabeçalho do portal"
                    required={true}
                  />
                  <ModernImageUpload
                    label="Favicon"
                    value={config.profile.favicon_url || ''}
                    onChange={(url) => updateConfig('profile', { favicon_url: url })}
                    imageType="favicon"
                    maxSize={1}
                    description="Ícone pequeno que aparece na aba do navegador"
                    required={true}
                  />
                  <ModernImageUpload
                    label="Banner Principal"
                    value={config.profile.banner_url || ''}
                    onChange={(url) => updateConfig('profile', { banner_url: url })}
                    imageType="banner"
                    maxSize={5}
                    description="Imagem de destaque para a página inicial do portal"
                    className="md:col-span-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Tema */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalização do Tema
              </CardTitle>
              <CardDescription>
                Configure cores, tipografia e estilo do seu portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                            {/* Cores Principais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores Principais</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ColorPicker
                    label="Primária"
                    value={config.theme?.colors?.primary || '#3B82F6'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        primary: value
                      }
                    })}
                  />
                  <ColorPicker
                    label="Secundária"
                    value={config.theme?.colors?.secondary || '#64748B'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        secondary: value
                      }
                    })}
                  />
                  <ColorPicker
                    label="Destaque"
                    value={config.theme?.colors?.accent || '#F59E0B'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        accent: value
                      }
                    })}
                  />
                  <ColorPicker
                    label="Sucesso"
                    value={config.theme?.colors?.success || '#10B981'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        success: value
                      }
                    })}
                  />
                </div>
              </div>

              {/* Cores do Head */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores do Head</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Fundo"
                    value={config.theme?.colors?.head?.background || '#EF4444'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        head: {
                          ...(config.theme?.colors?.head || {}),
                          background: value
                        }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Texto"
                    value={config.theme?.colors?.head?.text || '#FFFFFF'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        head: {
                          ...(config.theme?.colors?.head || {}),
                          text: value
                        }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Borda"
                    value={config.theme?.colors?.head?.border || '#DC2626'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        head: {
                          ...(config.theme?.colors?.head || {}),
                          border: value
                        }
                      }
                    })}
                  />
                </div>
              </div>

              {/* Cores do Footer */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores do Footer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Fundo"
                    value={config.theme?.colors?.footer?.background || '#1F2937'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        footer: {
                          ...(config.theme?.colors?.footer || {}),
                          background: value
                        }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Texto"
                    value={config.theme?.colors?.footer?.text || '#F9FAFB'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        footer: {
                          ...(config.theme?.colors?.footer || {}),
                          text: value
                        }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Borda"
                    value={config.theme?.colors?.footer?.border || '#374151'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        footer: {
                          ...(config.theme?.colors?.footer || {}),
                          border: value
                        }
                      }
                    })}
                  />
                </div>

                {/* Cores das Colunas do Footer */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">Cores das Colunas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorPicker
                      label="Fundo das Colunas"
                      value={config.theme?.colors?.footer?.columns?.background || '#111827'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          footer: {
                            ...(config.theme?.colors?.footer || {}),
                            columns: {
                              ...(config.theme?.colors?.footer?.columns || {}),
                              background: value
                            }
                          }
                        }
                      })}
                    />
                    <ColorPicker
                      label="Texto das Colunas"
                      value={config.theme?.colors?.footer?.columns?.text || '#D1D5DB'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          footer: {
                            ...(config.theme?.colors?.footer || {}),
                            columns: {
                              ...(config.theme?.colors?.footer?.columns || {}),
                              text: value
                            }
                          }
                        }
                      })}
                    />
                    <ColorPicker
                      label="Título das Colunas"
                      value={config.theme?.colors?.footer?.columns?.title || '#F9FAFB'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          footer: {
                            ...(config.theme?.colors?.footer || {}),
                            columns: {
                              ...(config.theme?.colors?.footer?.columns || {}),
                              title: value
                            }
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Cores do Banner */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores do Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Fundo"
                    value={config.theme?.colors?.banner?.background || '#1F2937'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        banner: {
                          ...(config.theme?.colors?.banner || {}),
                          background: value
                        }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Texto"
                    value={config.theme?.colors?.banner?.text || '#FFFFFF'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        banner: {
                          ...(config.theme?.colors?.banner || {}),
                          text: value
                        }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Overlay"
                    value={config.theme?.colors?.banner?.overlay || 'rgba(0, 0, 0, 0.5)'}
                    onChange={(value) => updateConfig('theme', {
                      colors: {
                        ...(config.theme?.colors || {}),
                        banner: {
                          ...(config.theme?.colors?.banner || {}),
                          overlay: value
                        }
                      }
                    })}
                  />
                </div>
              </div>

              {/* Cores dos Botões */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores dos Botões</h3>

                {/* Botão Primário */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="text-md font-medium text-gray-700">Botão Primário</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorPicker
                      label="Fundo"
                      value={config.theme?.colors?.buttons?.primary?.background || '#3B82F6'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            primary: {
                              ...(config.theme?.colors?.buttons?.primary || {}),
                              background: value
                            }
                          }
                        }
                      })}
                    />
                    <ColorPicker
                      label="Texto"
                      value={config.theme?.colors?.buttons?.primary?.text || '#FFFFFF'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            primary: {
                              ...(config.theme?.colors?.buttons?.primary || {}),
                              text: value
                            }
                          }
                        }
                      })}
                    />
                    <ColorPicker
                      label="Hover Fundo"
                      value={config.theme?.colors?.buttons?.primary?.hover_background || '#2563EB'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            primary: {
                              ...(config.theme?.colors?.buttons?.primary || {}),
                              hover_background: value
                            }
                          }
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Botão Secundário */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="text-md font-medium text-gray-700">Botão Secundário</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorPicker
                      label="Fundo"
                      value={config.theme?.colors?.buttons?.secondary?.background || '#64748B'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            secondary: {
                              ...(config.theme?.colors?.buttons?.secondary || {}),
                              background: value
                            }
                          }
                        }
                      })}
                    />
                    <ColorPicker
                      label="Texto"
                      value={config.theme?.colors?.buttons?.secondary?.text || '#FFFFFF'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            secondary: {
                              ...(config.theme?.colors?.buttons?.secondary || {}),
                              text: value
                            }
                          }
                        }
                      })}
                    />
                    <ColorPicker
                      label="Hover Fundo"
                      value={config.theme?.colors?.buttons?.secondary?.hover_background || '#475569'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            secondary: {
                              ...(config.theme?.colors?.buttons?.secondary || {}),
                              hover_background: value
                            }
                          }
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Botão de Destaque */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="text-md font-medium text-gray-700">Botão de Destaque</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorPicker
                      label="Fundo"
                      value={config.theme?.colors?.buttons?.accent?.background || '#F59E0B'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            accent: {
                              ...(config.theme?.colors?.buttons?.accent || {}),
                              background: value
                            }
                          }
                        }
                      })}
                    />
                    <ColorPicker
                      label="Texto"
                      value={config.theme?.colors?.buttons?.accent?.text || '#FFFFFF'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            accent: {
                              ...(config.theme?.colors?.buttons?.accent || {}),
                              text: value
                            }
                          }
                        }
                      })}
                    />
                    <ColorPicker
                      label="Hover Fundo"
                      value={config.theme?.colors?.buttons?.accent?.hover_background || '#D97706'}
                      onChange={(value) => updateConfig('theme', {
                        colors: {
                          ...(config.theme?.colors || {}),
                          buttons: {
                            ...(config.theme?.colors?.buttons || {}),
                            accent: {
                              ...(config.theme?.colors?.buttons?.accent || {}),
                              hover_background: value
                            }
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>



              {/* Tipografia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipografia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="font_family">Família da Fonte</Label>
                    <select
                      id="font_family"
                      value={config.theme.typography?.font_family || 'Inter'}
                      onChange={(e) => updateConfig('theme', {
                        typography: {
                          font_family: e.target.value,
                          font_sizes: config.theme.typography?.font_sizes || {},
                          font_weights: config.theme.typography?.font_weights || {}
                        }
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CSS Customizado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">CSS Customizado</h3>
                <div>
                  <Label htmlFor="custom_css">CSS Personalizado</Label>
                  <Textarea
                    id="custom_css"
                                          value={config.theme.custom_css || ''}
                      onChange={(e) => updateConfig('theme', { custom_css: e.target.value })}
                    placeholder="/* Seu CSS personalizado aqui */"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: SEO */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Configurações SEO
              </CardTitle>
              <CardDescription>
                Otimize seu portal para motores de busca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meta Tags Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Meta Tags Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seo_title">Título da Página</Label>
                    <Input
                      id="seo_title"
                      value={config.seo.meta?.title || ''}
                      onChange={(e) => updateConfig('seo', {
                                                meta: {
                          title: e.target.value,
                          description: config.seo.meta?.description || '',
                          keywords: config.seo.meta?.keywords || '',
                          author: config.seo.meta?.author || '',
                          robots: config.seo.meta?.robots || 'index, follow',
                          canonical_url: config.seo.meta?.canonical_url || ''
                        }
                      })}
                      placeholder="Título otimizado para SEO"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seo_description">Descrição</Label>
                    <Input
                      id="seo_description"
                      value={config.seo.meta?.description || ''}
                      onChange={(e) => updateConfig('seo', {
                        meta: {
                          title: config.seo.meta?.title || '',
                          description: e.target.value,
                          keywords: config.seo.meta?.keywords || '',
                          author: config.seo.meta?.author || '',
                          robots: config.seo.meta?.robots || 'index, follow',
                          canonical_url: config.seo.meta?.canonical_url || ''
                        }
                      })}
                      placeholder="Descrição da página"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seo_keywords">Palavras-chave</Label>
                    <Input
                      id="seo_keywords"
                      value={config.seo.meta?.keywords || ''}
                      onChange={(e) => updateConfig('seo', {
                        meta: {
                          title: config.seo.meta?.title || '',
                          description: config.seo.meta?.description || '',
                          keywords: e.target.value,
                          author: config.seo.meta?.author || '',
                          robots: config.seo.meta?.robots || 'index, follow',
                          canonical_url: config.seo.meta?.canonical_url || ''
                        }
                      })}
                      placeholder="palavra1, palavra2, palavra3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seo_author">Autor</Label>
                    <Input
                      id="seo_author"
                      value={config.seo.meta?.author || ''}
                      onChange={(e) => updateConfig('seo', {
                        meta: {
                          title: config.seo.meta?.title || '',
                          description: config.seo.meta?.description || '',
                          keywords: config.seo.meta?.keywords || '',
                          author: e.target.value,
                          robots: config.seo.meta?.robots || 'index, follow',
                          canonical_url: config.seo.meta?.canonical_url || ''
                        }
                      })}
                      placeholder="Nome do autor"
                    />
                  </div>
                </div>
              </div>

              {/* Open Graph */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Open Graph (Facebook)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="og_title">Título OG</Label>
                    <Input
                      id="og_title"
                      value={config.seo.open_graph?.title || ''}
                      onChange={(e) => updateConfig('seo', {
                                                open_graph: {
                          title: e.target.value,
                          description: config.seo.open_graph?.description || '',
                          image_url: config.seo.open_graph?.image_url || '',
                          site_name: config.seo.open_graph?.site_name || '',
                          type: config.seo.open_graph?.type || 'website',
                          locale: config.seo.open_graph?.locale || 'pt_BR'
                        }
                      })}
                      placeholder="Título para redes sociais"
                    />
                  </div>
                  <div>
                    <Label htmlFor="og_description">Descrição OG</Label>
                    <Input
                      id="og_description"
                      value={config.seo.open_graph?.description || ''}
                      onChange={(e) => updateConfig('seo', {
                        open_graph: {
                          title: config.seo.open_graph?.title || '',
                          description: e.target.value,
                          image_url: config.seo.open_graph?.image_url || '',
                          site_name: config.seo.open_graph?.site_name || '',
                          type: config.seo.open_graph?.type || 'website',
                          locale: config.seo.open_graph?.locale || 'pt_BR'
                        }
                      })}
                      placeholder="Descrição para redes sociais"
                    />
                  </div>
                  <div>
                    <Label htmlFor="og_image">Imagem OG</Label>
                    <Input
                      id="og_image"
                      value={config.seo.open_graph?.image_url || ''}
                      onChange={(e) => updateConfig('seo', {
                        open_graph: {
                          title: config.seo.open_graph?.title || '',
                          description: config.seo.open_graph?.description || '',
                          image_url: e.target.value,
                          site_name: config.seo.open_graph?.site_name || '',
                          type: config.seo.open_graph?.type || 'website',
                          locale: config.seo.open_graph?.locale || 'pt_BR'
                        }
                      })}
                      placeholder="URL da imagem para redes sociais"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Portal */}
        <TabsContent value="portal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Portal
              </CardTitle>
              <CardDescription>
                Gerencie funcionalidades e integrações do portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Funcionalidades */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Funcionalidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(config.portal_settings.features || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <Label htmlFor={key} className="capitalize">
                        {key.replace('_', ' ')}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked: boolean) => updateConfig('portal_settings', {
                          features: {
                            ...(config.portal_settings.features || {}),
                            [key]: checked
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Integrações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="google_analytics">Google Analytics ID</Label>
                    <Input
                      id="google_analytics"
                      value={config.portal_settings.integrations?.google_analytics_id || ''}
                      onChange={(e) => updateConfig('portal_settings', {
                                                integrations: {
                          google_analytics_id: e.target.value,
                          facebook_pixel_id: config.portal_settings.integrations?.facebook_pixel_id || '',
                          whatsapp_number: config.portal_settings.integrations?.whatsapp_number || '',
                          google_maps_api_key: config.portal_settings.integrations?.google_maps_api_key || '',
                          recaptcha_site_key: config.portal_settings.integrations?.recaptcha_site_key || ''
                        }
                      })}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook_pixel">Facebook Pixel ID</Label>
                    <Input
                      id="facebook_pixel"
                      value={config.portal_settings.integrations?.facebook_pixel_id || ''}
                      onChange={(e) => updateConfig('portal_settings', {
                        integrations: {
                          google_analytics_id: config.portal_settings.integrations?.google_analytics_id || '',
                          facebook_pixel_id: e.target.value,
                          whatsapp_number: config.portal_settings.integrations?.whatsapp_number || '',
                          google_maps_api_key: config.portal_settings.integrations?.google_maps_api_key || '',
                          recaptcha_site_key: config.portal_settings.integrations?.recaptcha_site_key || ''
                        }
                      })}
                      placeholder="XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp_number">Número WhatsApp</Label>
                    <Input
                      id="whatsapp_number"
                      value={config.portal_settings.integrations?.whatsapp_number || ''}
                      onChange={(e) => updateConfig('portal_settings', {
                        integrations: {
                          google_analytics_id: config.portal_settings.integrations?.google_analytics_id || '',
                          facebook_pixel_id: config.portal_settings.integrations?.facebook_pixel_id || '',
                          whatsapp_number: e.target.value,
                          google_maps_api_key: config.portal_settings.integrations?.google_maps_api_key || '',
                          recaptcha_site_key: config.portal_settings.integrations?.recaptcha_site_key || ''
                        }
                      })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* NEW: Custom SEO Tab */}
        <TabsContent value="custom-seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Personalizado por Página
              </CardTitle>
              <CardDescription>
                Configure SEO específico para cada página do seu portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* List of existing custom SEO entries */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Configurações por Página</h3>
                  <Button
                    variant="outline"
                    onClick={() => setEditingSeo({
                      ...newSEOTemplate,
                      tenant_id: config?.profile?.id || 0
                    })}
                    className="flex items-center gap-2"
                    disabled={!config?.profile?.id}
                  >
                    <Plus className="h-4 w-4" />
                    Nova Configuração
                  </Button>
                </div>

                {seoLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando configurações SEO...</p>
                  </div>
                ) : customSeoList.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma configuração SEO personalizada encontrada</p>
                    <p className="text-sm text-gray-400 mt-1">Clique em "Nova Configuração" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customSeoList.map((seo) => (
                      <div key={seo.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{seo.page_title || 'Sem título'}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {seo.page_url}
                            </span>
                          </div>
                          {seo.meta_description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                              {seo.meta_description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSeo(seo)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCustomSEO(seo.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit/Add Form */}
              {editingSeo && (
                <Card className="p-6 border-2 border-blue-200 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {editingSeo.id ? 'Editar Configuração SEO' : 'Nova Configuração SEO'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSeo(null)}
                    >
                      Fechar
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="page_url">URL da Página *</Label>
                        <Input
                          id="page_url"
                          value={editingSeo.page_url}
                          onChange={(e) => setEditingSeo({...editingSeo, page_url: e.target.value})}
                          placeholder="/veiculos/novos"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Ex: /veiculos, /contato, /sobre</p>
                      </div>
                      <div>
                        <Label htmlFor="page_title">Título da Página *</Label>
                        <Input
                          id="page_title"
                          value={editingSeo.page_title}
                          onChange={(e) => setEditingSeo({...editingSeo, page_title: e.target.value})}
                          placeholder="Título otimizado para SEO"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="subtitle">Subtítulo</Label>
                        <Input
                          id="subtitle"
                          value={editingSeo.subtitle || ''}
                          onChange={(e) => setEditingSeo({...editingSeo, subtitle: e.target.value})}
                          placeholder="Subtítulo descritivo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="canonical_url">URL Canônica</Label>
                        <Input
                          id="canonical_url"
                          value={editingSeo.canonical_url || ''}
                          onChange={(e) => setEditingSeo({...editingSeo, canonical_url: e.target.value})}
                          placeholder="https://seusite.com/url-canonica"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="meta_description">Meta Description *</Label>
                      <Textarea
                        id="meta_description"
                        value={editingSeo.meta_description || ''}
                        onChange={(e) => setEditingSeo({...editingSeo, meta_description: e.target.value})}
                        placeholder="Descrição otimizada para motores de busca (150-160 caracteres)"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="og_title">Título Open Graph</Label>
                        <Input
                          id="og_title"
                          value={editingSeo.og_title || ''}
                          onChange={(e) => setEditingSeo({...editingSeo, og_title: e.target.value})}
                          placeholder="Título para redes sociais"
                        />
                      </div>
                      <div>
                        <Label htmlFor="og_description">Descrição Open Graph</Label>
                        <Textarea
                          id="og_description"
                          value={editingSeo.og_description || ''}
                          onChange={(e) => setEditingSeo({...editingSeo, og_description: e.target.value})}
                          placeholder="Descrição para redes sociais"
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="twitter_title">Título Twitter</Label>
                        <Input
                          id="twitter_title"
                          value={editingSeo.twitter_title || ''}
                          onChange={(e) => setEditingSeo({...editingSeo, twitter_title: e.target.value})}
                          placeholder="Título para Twitter"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter_description">Descrição Twitter</Label>
                        <Textarea
                          id="twitter_description"
                          value={editingSeo.twitter_description || ''}
                          onChange={(e) => setEditingSeo({...editingSeo, twitter_description: e.target.value})}
                          placeholder="Descrição para Twitter"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Image Upload for Social Media */}
                    <div>
                      <Label htmlFor="social_image">Imagem para Redes Sociais</Label>
                      <ModernImageUpload
                        label=""
                        value={editingSeo.og_image_url || ''}
                        onChange={(url) => setEditingSeo({...editingSeo, og_image_url: url})}
                        imageType="banner" // Changed from "social" to "banner" since that's likely an accepted type
                        maxSize={5}
                        description="Imagem otimizada para compartilhamento (1200x630px recomendado)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta_keywords">Palavras-chave (separadas por vírgula)</Label>
                      <Input
                        id="meta_keywords"
                        value={editingSeo.meta_keywords || ''}
                        onChange={(e) => setEditingSeo({...editingSeo, meta_keywords: e.target.value})}
                        placeholder="carro seminovo, veículo usado, concessionária"
                      />
                    </div>

                    <div>
                      <Label htmlFor="robots">Diretivas Robots</Label>
                      <select
                        id="robots"
                        value={editingSeo.meta_robots || 'index, follow'}
                        onChange={(e) => setEditingSeo({...editingSeo, meta_robots: e.target.value})}
                        className="w-full p-2 border rounded"
                      >
                        <option value="index, follow">Indexar e seguir links</option>
                        <option value="noindex, follow">Não indexar, seguir links</option>
                        <option value="index, nofollow">Indexar, não seguir links</option>
                        <option value="noindex, nofollow">Não indexar, não seguir links</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setEditingSeo(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => saveCustomSEO(editingSeo)}
                      >
                        {editingSeo.id ? 'Atualizar' : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        
        
      </Tabs>

      {/* Botões de Ação */}
      <div className="fixed bottom-6 right-6 flex gap-3">
        <Button
          variant="outline"
          onClick={() => window.open('/portal', '_blank')}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Visualizar Portal
        </Button>
        <Button
          onClick={saveConfiguration}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
