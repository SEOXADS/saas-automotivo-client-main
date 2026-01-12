'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger'
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className = "",
  variant = 'default',
  ...props
}, ref) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
      case 'warning':
        return 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
      case 'info':
        return 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
      case 'danger':
        return 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
      default:
        return 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
    }
  }

  return (
    <div className="w-full">
      <label className="flex items-center cursor-pointer group">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            {...props}
          />
          <div className={`
            w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200
            ${props.checked
              ? `bg-gradient-to-r ${getVariantColors()} border-transparent`
              : 'border-gray-300 group-hover:border-blue-400'
            }
            ${className}
          `}>
            {props.checked && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
          {label}
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-600 mt-2 ml-9">
          {error}
        </p>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
