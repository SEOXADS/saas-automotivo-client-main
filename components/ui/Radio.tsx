'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  className?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
        <input
          ref={ref}
          type="radio"
          className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          {...props}
        />
        <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          {label}
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-600 mt-2 ml-6">
          {error}
        </p>
      )}
    </div>
  )
})

Radio.displayName = 'Radio'

export default Radio
