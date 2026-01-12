'use client'

import { useState, useRef, useEffect } from 'react'

interface Select2Option {
  value: string | number
  label: string
}

interface Select2Props {
  value: string | number
  onChange: (value: string | number) => void
  options: Select2Option[]
  placeholder?: string
  disabled?: boolean
  className?: string
  title?: string
  ariaLabel?: string
}

export default function Select2({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  disabled = false,
  className = "",
  title,
  ariaLabel
}: Select2Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState<Select2Option[]>(options)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtrar opções baseado no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Obter label da opção selecionada
  const selectedOption = options.find(option => option.value === value)
  const displayValue = selectedOption ? selectedOption.label : placeholder

  const handleSelect = (option: Select2Option) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearchTerm('')
      }
    }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`w-full p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all duration-200 ${
          disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900 hover:border-blue-300'
        } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
        onClick={handleToggle}
        title={title}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="select2-dropdown"
      >
        <div className="flex items-center justify-between">
          <span className={`text-lg ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {displayValue}
          </span>
          <svg
            className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div id="select2-dropdown" className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden">
          {/* Campo de busca */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para buscar..."
              className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Lista de opções */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors duration-200 ${
                    option.value === value ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <span className="text-base">{option.label}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-base text-center">
                Nenhuma opção encontrada
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
