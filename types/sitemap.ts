// Tipos para sitemap e robots.txt
export interface SitemapConfig {
  id: number
  name: string
  type: 'index' | 'images' | 'videos' | 'articles' | 'vehicles' | 'pages'
  url: string
  last_modified: string
  is_active: boolean
  priority: number
  change_frequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  created_at: string
  updated_at: string
}

export interface SitemapEntry {
  loc: string
  lastmod: string
  changefreq: string
  priority: number
  images?: SitemapImage[]
  videos?: SitemapVideo[]
}

export interface SitemapImage {
  loc: string
  caption?: string
  title?: string
  geo_location?: string
}

export interface SitemapVideo {
  loc: string
  thumbnail_loc: string
  title: string
  description: string
  duration?: number
  publication_date?: string
  category?: string
}

export interface RobotsTxtConfig {
  id: number
  user_agent: string
  allow: string[]
  disallow: string[]
  crawl_delay?: number
  sitemap: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SitemapFormData {
  name: string
  type: 'index' | 'images' | 'videos' | 'articles' | 'vehicles' | 'pages'
  url: string
  is_active: boolean
  priority: number
  change_frequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}

export interface RobotsTxtFormData {
  user_agent: string
  allow: string[]
  disallow: string[]
  crawl_delay?: number
  sitemap: string[]
  is_active: boolean
}

export interface SitemapFilters {
  search?: string
  type?: string
  is_active?: boolean
  page?: number
  per_page?: number
}

export interface SitemapListResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}
