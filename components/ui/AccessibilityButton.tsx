'use client'

import { useState, useEffect } from 'react'
import { Eye, Type, Contrast, Moon, Sun, Volume2, VolumeX, RotateCcw } from 'lucide-react'

interface AccessibilitySettings {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large'
  highContrast: boolean
  darkMode: boolean
  reducedMotion: boolean
  screenReader: boolean
}

export default function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileHint, setShowMobileHint] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    darkMode: false,
    reducedMotion: false,
    screenReader: false
  })

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mostrar hint no mobile após 3 segundos
  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowMobileHint(true)
        // Esconder hint após 5 segundos
        setTimeout(() => setShowMobileHint(false), 5000)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isMobile])

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      applySettings(parsed)
    }
  }, [])

  // Aplicar configurações ao DOM
  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement

    // Tamanho da fonte
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large')
    root.classList.add(`font-${newSettings.fontSize}`)

    // Alto contraste
    if (newSettings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Modo escuro
    if (newSettings.darkMode) {
      root.classList.add('dark-mode')
    } else {
      root.classList.remove('dark-mode')
    }

    // Reduzir animações
    if (newSettings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Screen reader
    if (newSettings.screenReader) {
      root.classList.add('screen-reader-mode')
    } else {
      root.classList.remove('screen-reader-mode')
    }
  }

  // Salvar configurações
  const saveSettings = (newSettings: AccessibilitySettings) => {
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings))
    setSettings(newSettings)
    applySettings(newSettings)
  }

  // Resetar configurações
  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 'normal',
      highContrast: false,
      darkMode: false,
      reducedMotion: false,
      screenReader: false
    }
    saveSettings(defaultSettings)
  }

  return (
    <div className="relative">
      {/* Botão principal - Mobile: escondido com seta piscando */}
      {isMobile ? (
        <div className="fixed top-1/2 left-0 z-50">
          {/* Seta piscando */}
          <div className="animate-pulse-arrow">
            <div className="w-12 h-12 bg-blue-600 rounded-r-lg flex items-center justify-center mb-2">
              <i className="fas fa-arrow-right text-white"></i>
            </div>
          </div>

          {/* Balão de dica */}
          {showMobileHint && (
            <div className="absolute top-1/2left-16 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
              <div className="absolute bottom-0 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
              Configurações de Acessibilidade
            </div>
          )}

          {/* Botão invisível para capturar clique */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-15 h-15 bg-transparent absolute inset-0"
            aria-label="Abrir configurações de acessibilidade"
            title="Configurações de Acessibilidade"
          >
            {/* <Eye className="w-6 h-6 text-blue-600" /> */}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-1/2 left-0 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-r-lg shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Abrir configurações de acessibilidade"
          title="Configurações de Acessibilidade"
        >
          <Eye className="w-6 h-6 text-white"></Eye>
        </button>
      )}

      {/* Painel de configurações */}
      {isOpen && (
        <div className={`fixed z-50 top-80 lg:left-20 bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80  max-h-150  h-120 overflow-y-auto ${
          isMobile
            ? 'bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            : 'bottom-24 left-6'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Acessibilidade</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fechar configurações"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Tamanho da fonte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4 inline mr-2" />
                Tamanho da Fonte
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'small', label: 'Pequena' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'large', label: 'Grande' },
                  { value: 'extra-large', label: 'Extra Grande' }
                ].map((size) => (
                  <button
                    key={size.value}
                    title={size.label}
                    onClick={() => saveSettings({ ...settings, fontSize: size.value as AccessibilitySettings['fontSize'] })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      settings.fontSize === size.value
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alto contraste */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Contrast className="w-4 h-4 mr-2" />
                Alto Contraste
              </label>
              <button
                title={`${settings.highContrast ? 'Desativar' : 'Ativar'} alto contraste`}
                onClick={() => saveSettings({ ...settings, highContrast: !settings.highContrast })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label={`${settings.highContrast ? 'Desativar' : 'Ativar'} alto contraste`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Modo escuro */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium text-gray-700">
                {settings.darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                Modo Escuro
              </label>
              <button
                title={`${settings.darkMode ? 'Desativar' : 'Ativar'} modo escuro`}
                onClick={() => saveSettings({ ...settings, darkMode: !settings.darkMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label={`${settings.darkMode ? 'Desativar' : 'Ativar'} modo escuro`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduzir animações */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reduzir Animações
              </label>
              <button
                title={`${settings.reducedMotion ? 'Desativar' : 'Ativar'} redução de animações`}
                onClick={() => saveSettings({ ...settings, reducedMotion: !settings.reducedMotion })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label={`${settings.reducedMotion ? 'Desativar' : 'Ativar'} redução de animações`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Modo leitor de tela */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium text-gray-700">
                {settings.screenReader ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                Modo Leitor de Tela
              </label>
              <button
                title={`${settings.screenReader ? 'Desativar' : 'Ativar'} modo leitor de tela`}
                onClick={() => saveSettings({ ...settings, screenReader: !settings.screenReader })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.screenReader ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label={`${settings.screenReader ? 'Desativar' : 'Ativar'} modo leitor de tela`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.screenReader ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Botão reset */}
            <div className="pt-4 border-t border-gray-200">
              <button
                title="Restaurar Padrões"
                onClick={resetSettings}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Restaurar Padrões
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
