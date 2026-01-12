'use client'

import { useEffect, useRef } from 'react'

interface PluginWrapperProps {
  children: React.ReactNode
  plugin?: 'fancybox' | 'slick' | 'select2' | 'datatable' | 'flatpickr' | 'aos'
  className?: string
  options?: Record<string, unknown>
}

export default function PluginWrapper({
  children,
  plugin,
  className = '',
  options = {}
}: PluginWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plugin || typeof window === 'undefined') return

    const initializePlugin = () => {
      switch (plugin) {
        case 'fancybox':
          if ((window as unknown as { Fancybox?: { bind: (selector: NodeList, options: Record<string, unknown>) => void } }).Fancybox && ref.current) {
            (window as unknown as { Fancybox: { bind: (selector: NodeList, options: Record<string, unknown>) => void } }).Fancybox.bind(ref.current.querySelectorAll('[data-fancybox]'), options)
          }
          break

        case 'slick':
          if ((window as unknown as { $?: (selector: string | HTMLElement) => { slick: (options: Record<string, unknown>) => void } }).$ && ref.current) {
            const $ = (window as unknown as { $: (selector: string | HTMLElement) => { slick: (options: Record<string, unknown>) => void } }).$
            const defaultOptions = {
              dots: true,
              infinite: true,
              speed: 300,
              slidesToShow: 1,
              adaptiveHeight: true,
              ...options
            }
            $(ref.current).slick(defaultOptions)
          }
          break

        case 'select2':
          if ((window as unknown as { $?: (selector: string | NodeListOf<Element>) => { select2: (options: Record<string, unknown>) => void } }).$ && ref.current) {
            const $ = (window as unknown as { $: (selector: string | NodeListOf<Element>) => { select2: (options: Record<string, unknown>) => void } }).$
            const defaultOptions = {
              theme: 'default',
              width: '100%',
              ...options
            }
            $(ref.current.querySelectorAll('.select2')).select2(defaultOptions)
          }
          break

        case 'datatable':
          if ((window as unknown as { $?: (selector: string | NodeListOf<Element>) => { DataTable: (options: Record<string, unknown>) => void } }).$ && ref.current) {
            const $ = (window as unknown as { $: (selector: string | NodeListOf<Element>) => { DataTable: (options: Record<string, unknown>) => void } }).$
            const defaultOptions = {
              responsive: true,
              language: {
                url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json'
              },
              ...options
            }
            $(ref.current.querySelectorAll('.datatable')).DataTable(defaultOptions)
          }
          break

        case 'flatpickr':
          if ((window as unknown as { flatpickr?: (selector: NodeList, options: Record<string, unknown>) => void }).flatpickr && ref.current) {
            const defaultOptions = {
              dateFormat: 'd/m/Y',
              locale: 'pt',
              ...options
            }
            ;(window as unknown as { flatpickr: (selector: NodeList, options: Record<string, unknown>) => void }).flatpickr(ref.current.querySelectorAll('.flatpickr'), defaultOptions)
          }
          break

        case 'aos':
          if ((window as unknown as { AOS?: { init: (options: Record<string, unknown>) => void; refresh: () => void } }).AOS && ref.current) {
            const defaultOptions = {
              duration: 1000,
              once: true,
              offset: 100,
              ...options
            }
            ;(window as unknown as { AOS: { init: (options: Record<string, unknown>) => void; refresh: () => void } }).AOS.init(defaultOptions)
            ;(window as unknown as { AOS: { init: (options: Record<string, unknown>) => void; refresh: () => void } }).AOS.refresh()
          }
          break
      }
    }

    // Aguardar um pouco para garantir que os scripts foram carregados
    const timer = setTimeout(initializePlugin, 100)

    return () => {
      clearTimeout(timer)

      // Cleanup
      if (plugin === 'slick' && (window as unknown as { $?: (selector: string | HTMLElement) => { slick: (action: string) => void } }).$) {
        const currentRef = ref.current
        if (currentRef) {
          try {
            const $ = (window as unknown as { $: (selector: string | HTMLElement) => { slick: (action: string) => void } }).$
            $(currentRef).slick('unslick')
          } catch {
            // Ignore errors during cleanup
          }
        }
      }
    }
  }, [plugin, options])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Componentes específicos para cada plugin
export const FancyboxGallery = ({ children, className = '', options = {} }: Omit<PluginWrapperProps, 'plugin'>) => (
  <PluginWrapper plugin="fancybox" className={className} options={options}>
    {children}
  </PluginWrapper>
)

export const SlickCarousel = ({ children, className = '', options = {} }: Omit<PluginWrapperProps, 'plugin'>) => (
  <PluginWrapper plugin="slick" className={className} options={options}>
    {children}
  </PluginWrapper>
)

export const Select2Wrapper = ({ children, className = '', options = {} }: Omit<PluginWrapperProps, 'plugin'>) => (
  <PluginWrapper plugin="select2" className={className} options={options}>
    {children}
  </PluginWrapper>
)

export const DataTableWrapper = ({ children, className = '', options = {} }: Omit<PluginWrapperProps, 'plugin'>) => (
  <PluginWrapper plugin="datatable" className={className} options={options}>
    {children}
  </PluginWrapper>
)

export const FlatpickrWrapper = ({ children, className = '', options = {} }: Omit<PluginWrapperProps, 'plugin'>) => (
  <PluginWrapper plugin="flatpickr" className={className} options={options}>
    {children}
  </PluginWrapper>
)

export const AOSWrapper = ({ children, className = '', options = {} }: Omit<PluginWrapperProps, 'plugin'>) => (
  <PluginWrapper plugin="aos" className={className} options={options}>
    {children}
  </PluginWrapper>
)
