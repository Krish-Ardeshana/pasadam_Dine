'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Sparkles,
  Search,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Th, Td, Skeleton } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Category, Dish, MediaType } from '@/lib/types';

export default function DishesPage() {
  const { currentRestaurant } = useAuth();
  const toast = useToast();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [dietaryFlags, setDietaryFlags] = useState<string[]>(['VEG']);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [model3dUrl, setModel3dUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload helpers
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploading3D, setIsUploading3D] = useState(false);

  // Delete State
  const [deletingDish, setDeletingDish] = useState<Dish | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = React.useCallback(async () => {
    if (!currentRestaurant?._id) return;
    try {
      setIsLoading(true);
      const [catsRes, dishesRes] = await Promise.all([
        api.categories.list(currentRestaurant._id),
        api.dishes.list(currentRestaurant._id, {
          limit: 100,
          search: search || undefined,
          categoryId: selectedCatId || undefined,
        }),
      ]);
      setCategories(catsRes || []);
      setDishes(dishesRes.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch dishes');
    } finally {
      setIsLoading(false);
    }
  }, [currentRestaurant, search, selectedCatId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingDish(null);
    setName('');
    setCategoryId(categories[0]?._id || '');
    setDescription('');
    setPrice('9.50');
    setCurrency('USD');
    setDietaryFlags(['VEG']);
    setImageUrls([]);
    setModel3dUrl('');
    setIsAvailable(true);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dish: Dish) => {
    setEditingDish(dish);
    setName(dish.name);
    setCategoryId(
      typeof dish.categoryId === 'object' ? (dish.categoryId as any)._id : dish.categoryId,
    );
    setDescription(dish.description || '');
    setPrice(dish.price.toString());
    setCurrency(dish.currency || 'USD');
    setDietaryFlags(dish.dietaryFlags || []);
    setImageUrls(dish.imageUrls || []);
    setModel3dUrl(dish.model3dUrl || '');
    setIsAvailable(dish.isAvailable);
    setIsPublished(dish.isPublished);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRestaurant?._id) return;

    setIsUploadingImage(true);
    try {
      const asset = await api.media.upload(
        currentRestaurant._id,
        file,
        MediaType.IMAGE,
        editingDish?._id,
      );
      setImageUrls((prev) => [...prev, asset.fileUrl]);
      toast.success('Dish image uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRestaurant?._id) return;

    setIsUploading3D(true);
    try {
      const asset = await api.media.upload(
        currentRestaurant._id,
        file,
        MediaType.MODEL_3D,
        editingDish?._id,
      );
      setModel3dUrl(asset.fileUrl);
      toast.success('3D AR GLB model uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || '3D Model upload failed');
    } finally {
      setIsUploading3D(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant?._id || !name.trim() || !categoryId) return;

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error('Please enter a valid non-negative price');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Dish> = {
        name: name.trim(),
        categoryId,
        description: description.trim(),
        price: numPrice,
        currency,
        dietaryFlags,
        imageUrls,
        model3dUrl,
        isAvailable,
        isPublished,
      };

      if (editingDish) {
        await api.dishes.update(currentRestaurant._id, editingDish._id, payload);
        toast.success(`Dish "${name}" updated successfully`);
      } else {
        await api.dishes.create(currentRestaurant._id, payload);
        toast.success(`Dish "${name}" created successfully`);
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save dish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (dish: Dish) => {
    if (!currentRestaurant?._id) return;
    try {
      await api.dishes.updateAvailability(currentRestaurant._id, dish._id, !dish.isAvailable);
      toast.success(`${dish.name} marked as ${!dish.isAvailable ? 'Available' : 'Unavailable'}`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleTogglePublish = async (dish: Dish) => {
    if (!currentRestaurant?._id) return;
    try {
      await api.dishes.publish(currentRestaurant._id, dish._id, !dish.isPublished);
      toast.success(`${dish.name} ${!dish.isPublished ? 'published to menu' : 'unpublished'}`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Publish toggle failed');
    }
  };

  const handleDelete = async () => {
    if (!currentRestaurant?._id || !deletingDish) return;
    setIsDeleting(true);
    try {
      await api.dishes.remove(currentRestaurant._id, deletingDish._id);
      toast.success(`Dish "${deletingDish.name}" deleted successfully`);
      setDeletingDish(null);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DECDB5] pb-4">
        <div>
          <h1 className="text-xl font-black text-[#5E0B15] uppercase tracking-wider">
            Dishes & 3D AR Assets
          </h1>
          <p className="text-xs text-[#594B42] uppercase tracking-wider mt-0.5">
            Manage culinary offerings, pricing, availability, and 3D food models
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          disabled={categories.length === 0}
          className="uppercase font-bold tracking-wider"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Dish
        </Button>
      </div>

      {categories.length === 0 && (
        <div className="p-4 bg-[#FDF0F1] rounded-xl border border-[#F6C6CC] text-[#90323D] text-xs font-semibold uppercase tracking-wider">
          Notice: You must create at least one Menu Category before adding dishes.
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="w-full sm:w-72">
          <Input
            placeholder="SEARCH DISHES..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="uppercase text-xs"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg border border-[#DCD5C9] text-xs font-semibold uppercase text-[#594B42] focus:outline-none focus:ring-2 focus:ring-[#90323D]/20 focus:border-[#90323D] shadow-xs"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes Table */}
      <Table>
        <Thead>
          <tr>
            <Th>Dish Name</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>3D AR</Th>
            <Th>Availability</Th>
            <Th>Publication</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </Thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td colSpan={7}>
                <div className="space-y-2 py-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Td>
            </tr>
          ) : dishes.length === 0 ? (
            <tr>
              <Td colSpan={7} className="text-center py-10 text-xs font-bold uppercase text-[#594B42]">
                No dishes found. Click &quot;Add New Dish&quot; to create your first item.
              </Td>
            </tr>
          ) : (
            dishes.map((dish) => {
              const catName =
                typeof dish.categoryId === 'object'
                  ? (dish.categoryId as any).name
                  : categories.find((c) => c._id === dish.categoryId)?.name || '—';

              return (
                <tr key={dish._id} className="hover:bg-[#F7F3EC] transition-colors">
                  <Td className="font-bold text-[#1C120C] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>{dish.name}</span>
                      {dish.dietaryFlags?.map((flag) => (
                        <Badge key={flag} variant="dietary" className="text-[9px] py-0">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </Td>
                  <Td className="text-xs text-[#594B42] uppercase">{catName}</Td>
                  <Td className="font-mono text-xs font-bold text-[#5E0B15]">
                    {dish.currency} {dish.price.toFixed(2)}
                  </Td>
                  <Td>
                    {dish.model3dUrl ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1E562A] bg-[#EAF3EB] border border-[#BBDCBF] px-2 py-0.5 uppercase">
                        <Sparkles className="w-3 h-3 text-[#1E562A]" /> 3D GLB
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#594B42]">2D Only</span>
                    )}
                  </Td>
                  <Td>
                    <button
                      onClick={() => handleToggleAvailability(dish)}
                      className="cursor-pointer"
                    >
                      {dish.isAvailable ? (
                        <Badge variant="success">IN STOCK</Badge>
                      ) : (
                        <Badge variant="danger">SOLD OUT</Badge>
                      )}
                    </button>
                  </Td>
                  <Td>
                    <button onClick={() => handleTogglePublish(dish)} className="cursor-pointer">
                      {dish.isPublished ? (
                        <Badge variant="success">LIVE MENU</Badge>
                      ) : (
                        <Badge variant="neutral">DRAFT</Badge>
                      )}
                    </button>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {currentRestaurant?.slug && (
                        <Link
                          href={`/r/${currentRestaurant.slug}/d/${dish.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#594B42] hover:text-[#5E0B15] transition-colors"
                          title="Preview Public AR Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(dish)}
                        className="font-bold text-[11px] uppercase"
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeletingDish(dish)}
                        className="font-bold text-[11px] uppercase"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      {/* Create / Edit Dish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDish ? 'Edit Dish & Media Assets' : 'Add New Culinary Offering'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dish Name"
              placeholder="e.g. Saffron Badam Kheer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
                Menu Category <span className="text-[#90323D]">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-[#D6C5A9] text-sm text-[#1C120C] focus:outline-none focus:border-[#5E0B15]"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
              Description
            </label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 bg-white border border-[#D6C5A9] text-sm text-[#1C120C] focus:outline-none focus:border-[#5E0B15]"
              placeholder="Slow cooked aromatic rice pudding with Kashmiri saffron and crushed almonds..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Media Attachments Section */}
          <div className="p-4 bg-[#F7F3EC] border border-[#DECDB5] space-y-4">
            <h3 className="text-xs font-extrabold text-[#5E0B15] uppercase tracking-wider">
              Visual & 3D AR Assets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 2D Image Upload */}
              <div>
                <label className="text-[11px] font-bold uppercase text-[#594B42] block mb-1">
                  2D Photograph (JPEG, PNG, WEBP)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="text-xs text-[#594B42] file:mr-2 file:py-1.5 file:px-3 file:border file:border-[#5E0B15] file:bg-[#5E0B15] file:text-[#EDE1CF] file:text-xs file:font-bold file:uppercase cursor-pointer"
                  />
                  {isUploadingImage && <span className="text-xs text-[#5E0B15] animate-pulse">Uploading...</span>}
                </div>
                {imageUrls.length > 0 && (
                  <p className="text-[10px] text-[#1E562A] mt-1 font-bold">
                    ✓ {imageUrls.length} image(s) attached
                  </p>
                )}
              </div>

              {/* 3D Model Upload */}
              <div>
                <label className="text-[11px] font-bold uppercase text-[#594B42] block mb-1">
                  3D AR Food Model (.GLB / .GLTF)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    onChange={handleModelUpload}
                    disabled={isUploading3D}
                    className="text-xs text-[#594B42] file:mr-2 file:py-1.5 file:px-3 file:border file:border-[#90323D] file:bg-[#90323D] file:text-white file:text-xs file:font-bold file:uppercase cursor-pointer"
                  />
                  {isUploading3D && <span className="text-xs text-[#90323D] animate-pulse">Uploading 3D...</span>}
                </div>
                {model3dUrl && (
                  <p className="text-[10px] text-[#1E562A] mt-1 font-bold truncate">
                    ✓ 3D Model: {model3dUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#1C120C] uppercase tracking-wider cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-[#5E0B15]"
              />
              <span>In Stock (Available for order)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-[#1C120C] uppercase tracking-wider cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-[#5E0B15]"
              />
              <span>Published on Public Menu</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#DECDB5]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingDish ? 'Save Dish Changes' : 'Create Dish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingDish}
        onClose={() => setDeletingDish(null)}
        title="Confirm Dish Deletion"
      >
        {deletingDish && (
          <div className="space-y-4">
            <p className="text-sm text-[#1C120C]">
              Are you sure you want to permanently delete dish{' '}
              <strong className="text-[#90323D] uppercase">{deletingDish.name}</strong>?
            </p>
            <p className="text-xs text-[#594B42]">
              This will remove the item from all active menus and invalidate the direct QR target.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#DECDB5]">
              <Button
                variant="outline"
                onClick={() => setDeletingDish(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
