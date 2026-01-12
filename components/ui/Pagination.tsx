'use client'

import Button from './Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  showPerPageSelector?: boolean
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  showPerPageSelector = false,
  className = ''
}: PaginationProps) {

  // Calcular páginas para mostrar
  const getVisiblePages = () => {
    const delta = 2 // Quantas páginas mostrar antes e depois da atual
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  // Opções de itens por página
  const perPageOptions = [10, 20, 50, 100]

  // Ícones
  const chevronLeft = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )

  const chevronRight = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )

  const chevronDoubleLeft = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  )

  const chevronDoubleRight = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
    </svg>
  )

  if (totalPages <= 1) return null

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      {/* Informações */}
      <div className="text-sm text-gray-500">
        Mostrando <span className="font-medium text-gray-700">{((currentPage - 1) * perPage) + 1}</span> a{' '}
        <span className="font-medium text-gray-700">{Math.min(currentPage * perPage, totalItems)}</span> de{' '}
        <span className="font-medium text-gray-700">{totalItems}</span> resultados
      </div>

      {/* Seletor de itens por página */}
      {showPerPageSelector && onPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Por página:</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            {perPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      )}

      {/* Navegação */}
      <div className="flex items-center gap-1">
        {/* Primeira página */}
        <Button
          variant="ghost"
          size="sm"
          icon={chevronDoubleLeft}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          {''}
        </Button>

        {/* Página anterior */}
        <Button
          variant="ghost"
          size="sm"
          icon={chevronLeft}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          {''}
        </Button>

        {/* Páginas numeradas */}
        {getVisiblePages().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-2 py-1.5 text-gray-400 text-sm">...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`px-2.5 py-1.5 min-w-[32px] text-sm ${
                  currentPage === page
                    ? 'shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200'
                }`}
              >
                {page}
              </Button>
            )}
          </div>
        ))}

        {/* Próxima página */}
        <Button
          variant="ghost"
          size="sm"
          icon={chevronRight}
          iconPosition="right"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          {''}
        </Button>

        {/* Última página */}
        <Button
          variant="ghost"
          size="sm"
          icon={chevronDoubleRight}
          iconPosition="right"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          {''}
        </Button>
      </div>
    </div>
  )
}
