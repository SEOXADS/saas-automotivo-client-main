'use client'

import { forwardRef } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  name?: string
  id?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  disabled = false,
  className = "",
  name,
  id
}, ref) => {
  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      disabled={disabled}
      name={name}
      id={id}
      className={`
        w-full p-4 border-2 border-gray-200 rounded-xl
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        transition-all duration-200 text-lg
        ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900'}
        ${className}
      `}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
})

Select.displayName = 'Select'

export default Select
