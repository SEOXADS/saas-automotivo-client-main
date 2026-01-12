'use client'

import { useState } from 'react'

interface CollapseProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
  scrollable?: boolean
  maxHeight?: string | number
}

export default function Collapse({ title, children, defaultOpen = false, icon, scrollable = false, maxHeight }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const computedMaxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : (maxHeight || '70vh')

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <svg
          className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ${isOpen ? '' : 'max-h-0 opacity-0 overflow-hidden'}`}
        style={isOpen
          ? (scrollable
              ? { maxHeight: computedMaxHeight, overflowY: 'auto', opacity: 1 }
              : { maxHeight: '100%', opacity: 1 })
          : undefined}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}
