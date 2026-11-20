'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Eye,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Check,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Dropdown } from '@/components/ui/Dropdown'
import { Avatar } from '@/components/ui/Avatar'
import { Toast, ToastContainer, toast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  image_url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  subcategories?: Category[]
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image_url: '',
    parent_id: '',
    display_order: 0,
    is_active: true,
  })

  async function fetchCategories() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories?include_inactive=true&include_subcategories=true')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(data.data || [])
    } catch (error) {
      toast.error('Failed to load categories')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function resetForm() {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      image_url: '',
      parent_id: '',
      display_order: 0,
      is_active: true,
    })
    setEditingCategory(null)
  }

  function openCreateModal() {
    resetForm()
    setShowCreateModal(true)
  }

  function openEditModal(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || '',
      display_order: category.display_order,
      is_active: category.is_active,
    })
    setShowCreateModal(true)
  }

  async function handleSubmit() {
    const categoryId = editingCategory?.id
    const isEditing = !!categoryId
    setActionLoading(categoryId || 'create')
    try {
      const res = await fetch('/api/admin/categories', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, ...formData }),
      })

      if (!res.ok) throw new Error('Failed to save category')

      toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`)
      setShowCreateModal(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} category`)
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteCategory() {
    if (!deletingCategory) return
    setActionLoading(deletingCategory.id)
    try {
      const res = await fetch(`/api/admin/categories?id=${deletingCategory.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete category')
      toast.success('Category deleted successfully')
      setDeletingCategory(null)
      fetchCategories()
    } catch (error) {
      toast.error('Failed to delete category')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReorder(categoryId: string, direction: 'up' | 'down') {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return

    const siblings = categories.filter(c => c.parent_id === category.parent_id)
      .sort((a, b) => a.display_order - b.display_order)

    const currentIndex = siblings.findIndex(c => c.id === categoryId)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= siblings.length) return

    const targetCategory = siblings[targetIndex]
    const newOrder = targetCategory.display_order

    setActionLoading(categoryId)
    try {
      await Promise.all([
        fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: categoryId, display_order: newOrder }),
        }),
        fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetCategory.id, display_order: category.display_order }),
        }),
      ])
      fetchCategories()
    } catch (error) {
      toast.error('Failed to reorder category')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const getTopLevelCategories = () => {
    return categories.filter(c => !c.parent_id).sort((a, b) => a.display_order - b.display_order)
  }

  const getSubcategories = (parentId: string) => {
    return categories.filter(c => c.parent_id === parentId).sort((a, b) => a.display_order - b.display_order)
  }

  const getStatusBadgeVariant = (isActive: boolean) => isActive ? 'success' : 'secondary'

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Category Management</h1>
          <p className="text-secondary-600 mt-1">Manage service categories and subcategories</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchCategories} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card variant="outlined" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <Input
              placeholder="Search categories..."
              onChange={(e) => {
                // Client-side filtering
              }}
              className="pl-10"
            />
          </div>
          <Select
            placeholder="All Statuses"
            options={[
              { value: '', label: 'All' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            value=""
            onChange={() => {}}
            leftIcon={<Filter className="w-5 h-5" />}
            className="w-40"
          />
        </div>
      </Card>

      {/* Categories Tree */}
      <Card variant="outlined" padding="none">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-secondary-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No categories found</h3>
            <p className="text-secondary-500">Create your first category to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-200">
            {getTopLevelCategories().map((category, index) => (
              <div key={category.id} className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-secondary-400">
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1"
                        onClick={() => handleReorder(category.id, 'up')}
                        disabled={actionLoading === category.id}
                        aria-label="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    )}
                    {index < getTopLevelCategories().length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1"
                        onClick={() => handleReorder(category.id, 'down')}
                        disabled={actionLoading === category.id}
                        aria-label="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    )}
                    <GripVertical className="w-5 h-5 cursor-grab" />
                  </div>

                  {category.icon && (
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      <span className="text-xl">{category.icon}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-secondary-900">{category.name}</p>
                      <Badge variant={getStatusBadgeVariant(category.is_active)} size="sm">
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary-500 truncate">{category.slug}</p>
                    {category.description && (
                      <p className="text-xs text-secondary-400 truncate max-w-md">{category.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-500">Order: {category.display_order}</span>
                    <Dropdown
                      trigger={
                        <Button variant="ghost" size="icon" className="p-1">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      }
                      items={[
                        { label: 'View', icon: <Eye className="w-4 h-4" />, onClick: () => { /* view */ } },
                        { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => openEditModal(category) },
                        { label: 'Add Subcategory', icon: <Plus className="w-4 h-4" />, onClick: () => {
                          setFormData(prev => ({ ...prev, parent_id: category.id, display_order: (category.subcategories?.length || 0) + 1 }))
                          setShowCreateModal(true)
                        }},
                        { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setDeletingCategory(category), danger: true },
                      ]}
                      align="end"
                    />
                  </div>
                </div>

                {/* Subcategories */}
                {getSubcategories(category.id).length > 0 && (
                  <div className="ml-10 mt-3 border-l-2 border-secondary-200 pl-4 space-y-2">
                    {getSubcategories(category.id).map((sub, subIndex) => (
                      <div key={sub.id} className="flex items-center gap-4 py-2">
                        <div className="flex items-center gap-2 text-secondary-400">
                          {subIndex > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-1"
                              onClick={() => handleReorder(sub.id, 'up')}
                              disabled={actionLoading === sub.id}
                              aria-label="Move up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                          )}
                          {subIndex < getSubcategories(category.id).length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-1"
                              onClick={() => handleReorder(sub.id, 'down')}
                              disabled={actionLoading === sub.id}
                              aria-label="Move down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                          )}
                          <GripVertical className="w-4 h-4 cursor-grab" />
                        </div>

                        {sub.icon && (
                          <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600">
                            <span className="text-lg">{sub.icon}</span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-secondary-900">{sub.name}</p>
                            <Badge variant={getStatusBadgeVariant(sub.is_active)} size="sm">
                              {sub.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-secondary-500 truncate">{sub.slug}</p>
                        </div>

                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon" className="p-1">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                          items={[
                            { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => openEditModal(sub) },
                            { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setDeletingCategory(sub), danger: true },
                          ]}
                          align="end"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm() }}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        description={editingCategory
          ? `Update details for "${editingCategory.name}"`
          : 'Add a new category to organize services'}
        confirmText={editingCategory ? 'Update' : 'Create'}
        onConfirm={handleSubmit}
        loading={actionLoading === (editingCategory?.id || 'create')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">Name *</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Category name"
                required
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-secondary-700 mb-1">Slug *</label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="category-slug"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Category description"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-secondary-700 mb-1">Icon (emoji)</label>
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="🔧"
                maxLength={4}
              />
            </div>
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-secondary-700 mb-1">Image URL</label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-secondary-700 mb-1">Parent Category</label>
              <Select
                id="parent_id"
                name="parent_id"
                placeholder="None (Top Level)"
                options={[
                  { value: '', label: 'None (Top Level)' },
                  ...categories.filter(c => !c.parent_id).map(c => ({ value: c.id, label: c.name })),
                ]}
                value={formData.parent_id}
                onChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
              />
            </div>
            <div>
              <label htmlFor="display_order" className="block text-sm font-medium text-secondary-700 mb-1">Display Order</label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">Active</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Delete Category"
        description={deletingCategory
          ? `Are you sure you want to delete "${deletingCategory.name}"? This will also delete all subcategories and cannot be undone.`
          : 'This action cannot be undone.'}
        confirmText="Delete"
        onConfirm={handleDeleteCategory}
        loading={actionLoading === deletingCategory?.id}
        variant="danger"
      />
    </div>
  )
}