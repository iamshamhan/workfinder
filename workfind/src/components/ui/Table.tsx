'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  className?: string
  headerClassName?: string
  cellClassName?: string
  width?: string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  sortable?: boolean
  defaultSortKey?: string
  defaultSortDirection?: 'asc' | 'desc'
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  onRowClick?: (row: T) => void
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  compact?: boolean
  emptyMessage?: string
  loading?: boolean
  className?: string
  renderRowActions?: (row: T) => React.ReactNode
  rowClassName?: (row: T) => string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  sortable = false,
  defaultSortKey,
  defaultSortDirection = 'asc',
  onSort,
  onRowClick,
  striped = true,
  hoverable = true,
  bordered = true,
  compact = false,
  emptyMessage = 'No data available',
  loading = false,
  className,
  renderRowActions,
  rowClassName,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection)

  const sortedData = useMemo(() => {
    if (!sortKey || !sortable) return data

    return [...data].sort((a, b) => {
      const column = columns.find(c => c.key === sortKey)
      if (!column || typeof column.accessor !== 'string') return 0

      const aVal = a[column.accessor as keyof T]
      const bVal = b[column.accessor as keyof T]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortKey, sortDirection, sortable, columns])

  const handleSort = (key: string) => {
    const column = columns.find(c => c.key === key)
    if (!column?.sortable) return

    if (sortKey === key) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
    onSort?.(key, sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc')
  }

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-4 h-4 text-secondary-300" aria-hidden="true" />
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 text-primary-600" aria-hidden="true" />
      : <ChevronDown className="w-4 h-4 text-primary-600" aria-hidden="true" />
  }

  const renderCell = (row: T, column: Column<T>) => {
    const value = typeof column.accessor === 'function'
      ? column.accessor(row)
      : row[column.accessor as keyof T]

    const renderValue = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : value

    return (
      <td
        className={cn(
          'px-4 py-3 text-sm text-secondary-700',
          'border-t border-secondary-100',
          column.cellClassName
        )}
        style={column.width ? { width: column.width } : undefined}
      >
        {renderValue as React.ReactNode}
      </td>
    )
  }

  if (loading) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <table className="w-full" role="table" aria-busy="true" aria-label="Loading data">
          <thead>
            <tr className="bg-secondary-50 border-b border-secondary-200">
              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider',
                    column.headerClassName
                  )}
                  style={column.width ? { width: column.width } : undefined}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
              {renderRowActions && <th className="px-4 py-3 text-right" scope="col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className={cn(striped && i % 2 === 1 && 'bg-secondary-50')}>
                {columns.map(() => (
                  <td key={Math.random()} className="px-4 py-3 border-t border-secondary-100">
                    <div className="skeleton h-4 w-3/4" />
                  </td>
                ))}
                {renderRowActions && <td className="px-4 py-3 border-t border-secondary-100"><div className="skeleton h-6 w-20" /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (sortedData.length === 0) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <table className="w-full" role="table">
          <thead>
            <tr className="bg-secondary-50 border-b border-secondary-200">
              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider',
                    column.headerClassName
                  )}
                  style={column.width ? { width: column.width } : undefined}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
              {renderRowActions && <th className="px-4 py-3 text-right" scope="col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="px-4 py-12 text-center text-secondary-500">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full" role="table">
        <thead>
          <tr className={cn('bg-secondary-50 border-b border-secondary-200', bordered && 'border-b border-secondary-200')}>
            {columns.map(column => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider',
                  'transition-colors',
                  sortable && column.sortable && 'cursor-pointer hover:bg-secondary-100 select-none',
                  column.headerClassName
                )}
                style={column.width ? { width: column.width } : undefined}
                onClick={() => sortable && column.sortable && handleSort(column.key)}
                aria-sort={sortKey === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                scope="col"
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {sortable && column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
            {renderRowActions && (
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider" scope="col">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row)}
              className={cn(
                'transition-colors',
                striped && rowIndex % 2 === 1 && 'bg-secondary-50',
                hoverable && 'hover:bg-secondary-50/50',
                onRowClick && 'cursor-pointer',
                bordered && 'border-t border-secondary-100',
                compact && 'py-2',
                rowClassName?.(row)
              )}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                  e.preventDefault()
                  onRowClick(row)
                }
              }}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              aria-pressed={onRowClick ? 'false' : undefined}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-sm text-secondary-700',
                    bordered && 'border-t border-secondary-100',
                    compact && 'py-2',
                    column.cellClassName
                  )}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {renderCell(row, column)}
                </td>
              ))}
              {renderRowActions && (
                <td className={cn(
                  'px-4 py-3 text-right',
                  bordered && 'border-t border-secondary-100',
                  compact && 'py-2'
                )}>
                  {renderRowActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export interface DataTableToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        {searchValue !== undefined && (
          <div className="relative max-w-xs w-full sm:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-secondary-400"
              aria-label={searchPlaceholder}
            />
          </div>
        )}
        {filters && <div className="flex items-center gap-2">{filters}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
    </div>
  )
}