'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = "",
  value,
  ...props
}, ref) => {
  // Garantir que o value nunca seja undefined para evitar erro de input controlado/não controlado
  const safeValue = value === undefined ? '' : value

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}

      <input
        ref={ref}
        value={safeValue}
        className={`
          w-full p-4 border-2 rounded-xl
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 text-lg
          ${error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-200'
          }
          ${props.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900'}
          ${className}
        `}
        {...props}
      />

      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-2">
          {helperText}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
