'use client';

import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Thead, Th, Td, Skeleton } from '@/components/ui/Table';
import { Card, Modal, Badge } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Category, CategoryStatus } from '@/lib/types';

export default function CategoriesPage() {
  const { currentRestaurant } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<CategoryStatus>(CategoryStatus.ACTIVE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = React.useCallback(async () => {
    if (!currentRestaurant?._id) return;
    try {
      setIsLoading(true);
      const res = await api.categories.list(currentRestaurant._id);
      setCategories(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, [currentRestaurant, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setStatus(CategoryStatus.ACTIVE);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant?._id || !name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.categories.update(currentRestaurant._id, editingCategory._id, {
          name: name.trim(),
          description: description.trim(),
          status,
        });
        toast.success(`Category "${name}" updated successfully`);
      } else {
        await api.categories.create(currentRestaurant._id, {
          name: name.trim(),
          description: description.trim(),
          displayOrder: categories.length,
          status,
        });
        toast.success(`Category "${name}" created`);
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentRestaurant?._id || !deletingCategory) return;

    setIsDeleting(true);
    try {
      await api.categories.remove(currentRestaurant._id, deletingCategory._id);
      toast.success(`Category "${deletingCategory.name}" removed safely`);
      setDeletingCategory(null);
      await fetchCategories();
    } catch (err: any) {
      // Backend orphan dish defense will be captured here
      toast.error(err.message || 'Cannot delete category with associated dishes.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!currentRestaurant?._id) return;
    const newItems = [...categories];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const orders = newItems.map((item, idx) => ({
      id: item._id,
      displayOrder: idx,
    }));

    setCategories(newItems);
    try {
      await api.categories.reorder(currentRestaurant._id, orders);
      toast.success('Categories order updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reorder categories');
      await fetchCategories();
    }
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
        <div>
          <h1 className="text-xl font-black text-[#7A0C1E] uppercase tracking-wider font-luxury">
            Menu Categories
          </h1>
          <p className="text-xs text-[#6E5D53] uppercase tracking-wider mt-0.5">
            Organize menu structure and sequence for the public digital menu
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="uppercase font-bold tracking-wider"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Category
        </Button>
      </div>

      {/* Table */}
      <Table>
        <Thead>
          <tr>
            <Th className="w-16">Seq</Th>
            <Th>Category Name</Th>
            <Th>Description</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </Thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td colSpan={5}>
                <div className="space-y-2 py-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <Td colSpan={5} className="text-center py-10 text-xs font-bold uppercase text-[#594B42]">
                No menu categories created yet. Click &quot;Create Category&quot; to begin.
              </Td>
            </tr>
          ) : (
            categories.map((cat, idx) => (
              <tr key={cat._id} className="hover:bg-[#F7F3EC] transition-colors">
                <Td className="font-mono text-xs text-[#594B42]">
                  <div className="flex items-center gap-1">
                    <span>{idx + 1}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMoveOrder(idx, 'UP')}
                        disabled={idx === 0}
                        className="text-[#594B42] hover:text-[#5E0B15] disabled:opacity-20 cursor-pointer"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(idx, 'DOWN')}
                        disabled={idx === categories.length - 1}
                        className="text-[#594B42] hover:text-[#5E0B15] disabled:opacity-20 cursor-pointer"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Td>
                <Td className="font-bold text-[#1C120C] uppercase tracking-wider">
                  {cat.name}
                </Td>
                <Td className="text-xs text-[#594B42] max-w-sm truncate">
                  {cat.description || '—'}
                </Td>
                <Td>
                  {cat.status === CategoryStatus.ACTIVE ? (
                    <Badge variant="success">ACTIVE</Badge>
                  ) : (
                    <Badge variant="neutral">INACTIVE</Badge>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(cat)}
                      className="font-bold text-[11px] uppercase"
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeletingCategory(cat)}
                      className="font-bold text-[11px] uppercase"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Menu Category' : 'Create New Menu Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Traditional Sattvic Thalis"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 bg-white border border-[#D6C5A9] text-sm text-[#1C120C] focus:outline-none focus:border-[#5E0B15]"
              placeholder="Fresh offerings prepared strictly with traditional Ayurvedic principles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CategoryStatus)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-[#E8E2D9] text-sm text-[#1C120C] focus:outline-none focus:ring-2 focus:ring-[#90323D]/20 focus:border-[#90323D] transition-all"
            >
              <option value={CategoryStatus.ACTIVE}>ACTIVE (Visible on public menu)</option>
              <option value={CategoryStatus.INACTIVE}>INACTIVE (Hidden draft)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E2D9]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Confirm Category Deletion"
      >
        {deletingCategory && (
          <div className="space-y-4">
            <p className="text-sm text-[#1C120C]">
              Are you sure you want to delete category{' '}
              <strong className="text-[#90323D] uppercase">{deletingCategory.name}</strong>?
            </p>
            <p className="text-xs text-[#594B42]">
              <strong>Security & Data Integrity Rule:</strong> If there are dishes currently associated
              with this category, deletion will be blocked by the server to prevent orphaned dish records.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E2D9]">
              <Button
                variant="outline"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isDeleting}
                onClick={handleDelete}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
