/**
 * Configuração de assets para migração do portal de /portal para /
 * Este arquivo centraliza todos os caminhos de assets para facilitar a manutenção
 */

export const ASSET_PATHS = {
  // CSS Principal
  BOOTSTRAP_CSS: '/portal/assets/css/bootstrap.min.css',
  STYLE_CSS: '/portal/assets/css/style.css',

  // Plugins CSS
  BOXICONS_CSS: '/portal/assets/plugins/boxicons/css/boxicons.min.css',
  FONTAWESOME_CSS: '/portal/assets/plugins/fontawesome/css/all.min.css',
  SLICK_CSS: '/portal/assets/plugins/slick/slick.css',
  FANCYBOX_CSS: '/portal/assets/plugins/fancybox/fancybox.css',
  FLATPICKR_CSS: '/portal/assets/plugins/flatpickr/flatpickr.min.css',
  AOS_CSS: '/portal/assets/plugins/aos/aos.css',
  SELECT2_CSS: '/portal/assets/plugins/select2/select2.min.css',
  ION_RANGESLIDER_CSS: '/portal/assets/plugins/ion-rangeslider/ion.rangeSlider.css',
  DATATABLES_CSS: '/portal/assets/plugins/datatables/datatables.min.css',

  // Plugins JS
  JQUERY_JS: '/portal/assets/plugins/jquery/jquery.min.js',
  BOOTSTRAP_JS: '/portal/assets/js/bootstrap.bundle.min.js',
  SLICK_JS: '/portal/assets/plugins/slick/slick.js',
  FANCYBOX_JS: '/portal/assets/plugins/fancybox/fancybox.umd.js',
  FLATPICKR_JS: '/portal/assets/plugins/flatpickr/flatpickr.min.js',
  FLATPICKR_LOCALE_PT: '/portal/assets/plugins/flatpickr/locales/pt.js',
  FULLCALENDAR_JS: '/portal/assets/plugins/fullcalendar/index.global.min.js',
  AOS_JS: '/portal/assets/plugins/aos/aos.js',
  SELECT2_JS: '/portal/assets/plugins/select2/select2.min.js',
  ION_RANGESLIDER_JS: '/portal/assets/plugins/ion-rangeslider/ion.rangeSlider.min.js',
  DATATABLES_JS: '/portal/assets/plugins/datatables/datatables.min.js',
  MOMENT_JS: '/portal/assets/plugins/moment/moment.min.js',
  THEIA_STICKY_SIDEBAR_JS: '/portal/assets/plugins/theia-sticky-sidebar/theia-sticky-sidebar.js',

  // Scripts do portal
  BACK_TO_TOP_JS: '/portal/assets/js/backToTop.js',
  FEATHER_JS: '/portal/assets/js/feather.min.js',
  MAP_JS: '/portal/assets/js/map.js',
  SCRIPT_JS: '/portal/assets/js/script.js',
  JQUERY_COUNTERUP_JS: '/portal/assets/js/jquery.counterup.min.js',
  JQUERY_WAYPOINTS_JS: '/portal/assets/js/jquery.waypoints.js',
  BOOTSTRAP_DATETIMEPICKER_JS: '/portal/assets/js/bootstrap-datetimepicker.min.js',
  OWL_CAROUSEL_JS: '/portal/assets/js/owl.carousel.min.js',

  // Imagens principais
  LOGO_SVG: '/portal/assets/img/logo.svg',
  LOGO_WHITE_SVG: '/portal/assets/img/logo-white.svg',
  LOGO_2_SVG: '/portal/assets/img/logo-2.svg',
  FAVICON_PNG: '/portal/assets/img/favicon.png',

  // Imagens de categorias
  CATEGORY_01: '/portal/assets/img/category/category-01.png',
  CATEGORY_02: '/portal/assets/img/category/category-02.png',
  CATEGORY_03: '/portal/assets/img/category/category-03.png',
  CATEGORY_04: '/portal/assets/img/category/category-04.png',
  CATEGORY_05: '/portal/assets/img/category/category-05.png',
  CATEGORY_06: '/portal/assets/img/category/category-06.png',

  // Imagens de carros
  CAR_15: '/portal/assets/img/cars/car-15.png',
  CAR_16: '/portal/assets/img/cars/car-16.png',
  CAR_17: '/portal/assets/img/cars/car-17.png',

  // Imagens de fundo
  ABOUT_TESTIMONIAL_BG: '/portal/assets/img/bg/about-testimonial.jpg',
  BRAND_BG: '/portal/assets/img/bg/brand.png',

  // Imagens sobre
  RENT_CAR: '/portal/assets/img/about/rent-car.png',
  CAR_GRID: '/portal/assets/img/about/car-grid.png',
} as const

/**
 * Função para obter o caminho correto do asset baseado no ambiente
 * @param assetPath - Caminho do asset
 * @returns Caminho correto do asset
 */
export function getAssetPath(assetPath: string): string {
  // Se já começar com /portal/, retorna como está
  if (assetPath.startsWith('/portal/')) {
    return assetPath
  }

  // Se começar com /, adiciona /portal/ no início
  if (assetPath.startsWith('/')) {
    return `/portal${assetPath}`
  }

  // Se não começar com /, adiciona /portal/ no início
  return `/portal/${assetPath}`
}

/**
 * Função para obter todos os caminhos de CSS necessários
 */
export function getRequiredCSS(): string[] {
  return [
    ASSET_PATHS.BOOTSTRAP_CSS,
    ASSET_PATHS.STYLE_CSS,
    ASSET_PATHS.BOXICONS_CSS,
    ASSET_PATHS.FONTAWESOME_CSS,
    ASSET_PATHS.SLICK_CSS,
    ASSET_PATHS.FANCYBOX_CSS,
  ]
}

/**
 * Função para obter todos os caminhos de JS necessários
 */
export function getRequiredJS(): string[] {
  return [
    ASSET_PATHS.JQUERY_JS,
    ASSET_PATHS.BOOTSTRAP_JS,
    ASSET_PATHS.SLICK_JS,
    ASSET_PATHS.FANCYBOX_JS,
  ]
}

/**
 * Função para verificar se um asset existe
 * @param assetPath - Caminho do asset
 * @returns Promise<boolean>
 */
export async function checkAssetExists(assetPath: string): Promise<boolean> {
  try {
    const response = await fetch(assetPath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}
