'use client'

import { useState, useRef, useEffect } from 'react'
import Input from './Input'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Check, Palette } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

// Cores predefinidas comuns
const predefinedColors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
  '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0', '#F1F5F9',
  '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8'
]

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [isValidColor, setIsValidColor] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const validateColor = (color: string): boolean => {
    const s = new Option().style
    s.color = color
    return s.color !== ''
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    const isValid = validateColor(newValue)
    setIsValidColor(isValid)

    if (isValid) {
      onChange(newValue)
    }
  }

  const handleColorSelect = (color: string) => {
    setInputValue(color)
    setIsValidColor(true)
    onChange(color)
    setIsOpen(false)
  }

  const handleInputBlur = () => {
    if (isValidColor) {
      onChange(inputValue)
    } else {
      setInputValue(value) // Reverter para valor válido
      setIsValidColor(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isValidColor) {
        onChange(inputValue)
        setIsOpen(false)
      }
      inputRef.current?.blur()
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          placeholder="#000000"
          className={`flex-1 ${!isValidColor ? 'border-red-500' : ''}`}
        />

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div
              className="w-10 h-10 p-0 border border-gray-300 rounded-md cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: value }}
            >
              <Palette className="h-4 w-4 text-white" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Cores Predefinidas</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    >
                      {value === color && (
                        <Check className="w-4 h-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Cor Personalizada</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={value}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {!isValidColor && (
        <p className="text-sm text-red-500">Cor inválida</p>
      )}
    </div>
  )
}
