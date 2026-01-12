/**
 * Configuração de Cores do Portal
 *
 * Este arquivo contém todas as cores utilizadas no portal.
 * Para alterar as cores, edite os valores abaixo e reinicie o servidor.
 */

export const PORTAL_COLORS = {
  // 🎨 Cores Principais
  primary: '#EF4444',        // Vermelho principal
  secondary: '#28a745',      // Verde secundário
  accent: '#F59E0B',         // Laranja de destaque

  // 🌈 Cores de Status
  success: '#10B981',        // Verde de sucesso
  warning: '#F59E0B',        // Amarelo de aviso
  danger: '#EF4444',         // Vermelho de erro
  info: '#3B82F6',           // Azul de informação

  // 🎭 Cores de Interface
  background: '#FFFFFF',      // Fundo principal
  surface: '#F8FAFC',        // Superfícies
  text: '#1E293B',           // Texto principal
  textMuted: '#64748B',      // Texto secundário
  border: '#E2E8F0',         // Bordas

  // 🎯 Cores do Header
  head: {
    background: '#fff',   // Fundo do cabeçalho
    text: '#000',         // Texto do cabeçalho
    border: '#DC2626'        // Borda do cabeçalho
  },

  // 🦶 Cores do Footer
  footer: {
    background: '#fff',   // Fundo do rodapé
    text: '#000',         // Texto do rodapé
    border: '#DC2626',       // Borda do rodapé
    columns: {
      background: '#FFF', // Fundo das colunas
      text: '#000',      // Texto das colunas
      title: '#DC2626'      // Título das colunas
    }
  },

  // 🖼️ Cores do Banner
  banner: {
    background: '#1F2937',   // Fundo do banner
    text: '#000',         // Texto do banner
    overlay: 'rgba(0, 0, 0, 0.5)' // Overlay do banner
  },

  // 🔘 Cores dos Botões
  buttons: {
    primary: {
      background: '#28a745', // Fundo do botão primário
      text: '#FFFFFF',       // Texto do botão primário
      hover: '#10B981',      // Hover do botão primário
      border: '#10B981'      // Borda do botão primário
    },
    secondary: {
      background: '#64748B', // Fundo do botão secundário
      text: '#FFFFFF',       // Texto do botão secundário
      hover: '#475569',      // Hover do botão secundário
      border: '#64748B'      // Borda do botão secundário
    },
    accent: {
      background: '#F59E0B', // Fundo do botão de destaque
      text: '#FFFFFF',       // Texto do botão de destaque
      hover: '#D97706',      // Hover do botão de destaque
      border: '#F59E0B'      // Borda do botão de destaque
    }
  },

  // 🎨 Cores de Gradientes
  gradients: {
    primary: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    secondary: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
    accent: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
  },

  // 🌙 Cores para Modo Escuro (futuro)
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    border: '#334155'
  }
}

/**
 * Função para aplicar todas as cores como variáveis CSS
 */
export const applyPortalColors = () => {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  // Aplicar cores principais
  root.style.setProperty('--primary-color', PORTAL_COLORS.primary)
  root.style.setProperty('--secondary-color', PORTAL_COLORS.secondary)
  root.style.setProperty('--accent-color', PORTAL_COLORS.accent)
  root.style.setProperty('--success-color', PORTAL_COLORS.success)
  root.style.setProperty('--warning-color', PORTAL_COLORS.warning)
  root.style.setProperty('--danger-color', PORTAL_COLORS.danger)
  root.style.setProperty('--info-color', PORTAL_COLORS.info)
  root.style.setProperty('--background-color', PORTAL_COLORS.background)
  root.style.setProperty('--surface-color', PORTAL_COLORS.surface)
  root.style.setProperty('--text-color', PORTAL_COLORS.text)
  root.style.setProperty('--text-muted-color', PORTAL_COLORS.textMuted)
  root.style.setProperty('--border-color', PORTAL_COLORS.border)

  // Aplicar cores do header
  root.style.setProperty('--head-background', PORTAL_COLORS.head.background)
  root.style.setProperty('--head-text', PORTAL_COLORS.head.text)
  root.style.setProperty('--head-border', PORTAL_COLORS.head.border)

  // Aplicar cores do footer
  root.style.setProperty('--footer-background', PORTAL_COLORS.footer.background)
  root.style.setProperty('--footer-text', PORTAL_COLORS.footer.text)
  root.style.setProperty('--footer-border', PORTAL_COLORS.footer.border)
  root.style.setProperty('--footer-columns-background', PORTAL_COLORS.footer.columns.background)
  root.style.setProperty('--footer-columns-text', PORTAL_COLORS.footer.columns.text)
  root.style.setProperty('--footer-columns-title', PORTAL_COLORS.footer.columns.title)

  // Aplicar cores do banner
  root.style.setProperty('--banner-background', PORTAL_COLORS.banner.background)
  root.style.setProperty('--banner-text', PORTAL_COLORS.banner.text)
  root.style.setProperty('--banner-overlay', PORTAL_COLORS.banner.overlay)

  // Aplicar cores dos botões
  root.style.setProperty('--button-primary-background', PORTAL_COLORS.buttons.primary.background)
  root.style.setProperty('--button-primary-text', PORTAL_COLORS.buttons.primary.text)
  root.style.setProperty('--button-primary-hover', PORTAL_COLORS.buttons.primary.hover)
  root.style.setProperty('--button-primary-border', PORTAL_COLORS.buttons.primary.border)

  root.style.setProperty('--button-secondary-background', PORTAL_COLORS.buttons.secondary.background)
  root.style.setProperty('--button-secondary-text', PORTAL_COLORS.buttons.secondary.text)
  root.style.setProperty('--button-secondary-hover', PORTAL_COLORS.buttons.secondary.hover)
  root.style.setProperty('--button-secondary-border', PORTAL_COLORS.buttons.secondary.border)

  root.style.setProperty('--button-accent-background', PORTAL_COLORS.buttons.accent.background)
  root.style.setProperty('--button-accent-text', PORTAL_COLORS.buttons.accent.text)
  root.style.setProperty('--button-accent-hover', PORTAL_COLORS.buttons.accent.hover)
  root.style.setProperty('--button-accent-border', PORTAL_COLORS.buttons.accent.border)

  console.log('🎨 Cores do portal aplicadas com sucesso!')
}

/**
 * Função para obter uma cor específica
 */
export const getColor = (path: string) => {
  const keys = path.split('.')
  let value: string | Record<string, unknown> = PORTAL_COLORS

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key] as string | Record<string, unknown>
    } else {
      console.warn(`⚠️ Cor não encontrada: ${path}`)
      return '#000000'
    }
  }

  return value as string
}

export default PORTAL_COLORS
