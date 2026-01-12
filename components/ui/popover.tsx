'use client'

import React, { useState, useRef, useEffect } from 'react'

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Popover = ({ children, open: controlledOpen, onOpenChange }: PopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen !== undefined) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === PopoverTrigger) {
            return React.cloneElement(child, { open, setOpen } as any)
          }
          if (child.type === PopoverContent) {
            return open ? React.cloneElement(child, { setOpen } as any) : null
          }
        }
        return child
      })}
    </div>
  )
}

interface PopoverTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  open?: boolean
  setOpen?: (open: boolean) => void
}

const PopoverTrigger = React.forwardRef<HTMLDivElement, PopoverTriggerProps>(
  ({ children, asChild = false, open, setOpen }, ref) => {
    const handleClick = () => {
      setOpen?.(!open)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: handleClick,
        ref
      } as any)
    }

    return (
      <div ref={ref} onClick={handleClick} className="inline-block">
        {children}
      </div>
    )
  }
)

PopoverTrigger.displayName = "PopoverTrigger"

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  setOpen?: (open: boolean) => void
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className = "", setOpen }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          setOpen?.(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setOpen])

    return (
      <div
        ref={contentRef}
        className={`absolute z-50 w-72 rounded-md border bg-white p-4 shadow-md outline-none ${className}`}
        style={{
          top: '100%',
          left: '0',
          marginTop: '0.5rem'
        }}
      >
        {children}
      </div>
    )
  }
)

PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
