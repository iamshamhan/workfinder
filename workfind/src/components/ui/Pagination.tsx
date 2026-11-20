'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getVisiblePages(currentPage, totalPages, maxVisiblePages)

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      {showFirstLast && (
        <>
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={cn(paginationButtonStyles, currentPage === 1 && disabledStyles)}
            aria-label="Go to first page"
            aria-disabled={currentPage === 1}
          >
            <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(paginationButtonStyles, currentPage === 1 && disabledStyles)}
            aria-label="Go to previous page"
            aria-disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        </>
      )}

      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-1 text-secondary-400"
              aria-hidden="true"
            >
              ...
            </span>
          )
        }
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
            )}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      })}

      {showPrevNext && (
        <>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(paginationButtonStyles, currentPage === totalPages && disabledStyles)}
            aria-label="Go to next page"
            aria-disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={cn(paginationButtonStyles, currentPage === totalPages && disabledStyles)}
            aria-label="Go to last page"
            aria-disabled={currentPage === totalPages}
          >
            <ChevronsRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </>
      )}

      {totalItems && itemsPerPage && (
        <div className="ml-4 text-sm text-secondary-500 hidden sm:block" aria-live="polite">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
        </div>
      )}
    </nav>
  )
}

const paginationButtonStyles = 'p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-w-[40px] h-10'
const disabledStyles = 'opacity-50 cursor-not-allowed hover:text-secondary-500 hover:bg-transparent'

function getVisiblePages(currentPage: number, totalPages: number, maxVisible: number): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const half = Math.floor(maxVisible / 2)
  let start = Math.max(1, currentPage - half)
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  const pages: (number | 'ellipsis')[] = []

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('ellipsis')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('ellipsis')
    pages.push(totalPages)
  }

  return pages
}

export interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-center gap-2', className)} role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100',
          'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'min-w-[40px] h-10'
        )}
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      <span className="px-4 text-sm font-medium text-secondary-700" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100',
          'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'min-w-[40px] h-10'
        )}
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  )
}