'use client';

import React, { useEffect, useState } from 'react';
import {
  FileImage,
  Upload,
  Trash2,
  Box,
  Image as ImageIcon,
  Building,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { MediaAsset, MediaType, StorageProvider } from '@/lib/types';

export default function MediaManagementPage() {
  const { currentRestaurant } = useAuth();
  const toast = useToast();

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Upload State
  const [uploadMediaType, setUploadMediaType] = useState<MediaType>(MediaType.IMAGE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete State
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async () => {
    if (!currentRestaurant?._id) return;
    try {
      setIsLoading(true);
      const res = await api.media.list(currentRestaurant._id);
      setMediaAssets(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch media assets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [currentRestaurant]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant?._id || !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      await api.media.upload(currentRestaurant._id, selectedFile, uploadMediaType);
      toast.success('Asset uploaded successfully and indexed in media library');
      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Media upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentRestaurant?._id || !deletingAsset) return;

    setIsDeleting(true);
    try {
      await api.media.delete(currentRestaurant._id, deletingAsset._id);
      toast.success('Asset permanently removed from storage');
      setDeletingAsset(null);
      await fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete asset');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAssets = mediaAssets.filter((a) => {
    if (filterType === 'ALL') return true;
    return a.mediaType === filterType;
  });

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DECDB5] pb-4">
        <div>
          <h1 className="text-xl font-black text-[#5E0B15] uppercase tracking-wider">
            Media Library & 3D Assets
          </h1>
          <p className="text-xs text-[#594B42] uppercase tracking-wider mt-0.5">
            Cloudinary production storage with secure local offline development fallback
          </p>
        </div>
      </div>

      {/* Upload Dropzone Card */}
      <div className="bg-white border-2 border-[#5E0B15] p-6 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#5E0B15] border-b border-[#DECDB5] pb-2">
          Upload New Asset
        </h2>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
              Asset Category
            </label>
            <select
              value={uploadMediaType}
              onChange={(e) => setUploadMediaType(e.target.value as MediaType)}
              className="w-full px-3 py-2 bg-white border border-[#D6C5A9] text-xs font-bold uppercase text-[#1C120C] focus:outline-none focus:border-[#5E0B15]"
            >
              <option value={MediaType.IMAGE}>Dish Photograph (JPEG, PNG, WEBP — Max 5MB)</option>
              <option value={MediaType.MODEL_3D}>3D AR Model (.GLB / .GLTF — Max 15MB)</option>
              <option value={MediaType.LOGO}>Restaurant Logo (PNG, SVG — Max 5MB)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
              Select File
            </label>
            <input
              id="media-file-input"
              type="file"
              accept={
                uploadMediaType === MediaType.MODEL_3D
                  ? '.glb,.gltf'
                  : 'image/jpeg,image/png,image/webp,image/svg+xml'
              }
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-2 py-1.5 bg-[#F7F3EC] border border-[#D6C5A9] text-xs text-[#594B42] file:mr-2 file:py-1 file:px-2 file:border file:border-[#5E0B15] file:bg-[#5E0B15] file:text-[#EDE1CF] file:text-xs file:font-bold file:uppercase cursor-pointer"
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full uppercase font-bold tracking-wider"
              isLoading={isUploading}
            >
              <Upload className="w-4 h-4 mr-1.5" /> Upload Asset
            </Button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DECDB5] pb-2">
        {['ALL', MediaType.IMAGE, MediaType.MODEL_3D, MediaType.LOGO].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
              filterType === t
                ? 'bg-[#5E0B15] text-[#EDE1CF] border-[#5E0B15]'
                : 'bg-white text-[#594B42] border-[#DECDB5] hover:bg-[#F7F3EC]'
            }`}
          >
            {t === 'ALL' ? 'All Files' : t}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white border border-[#DECDB5] p-12 text-center text-xs font-bold uppercase text-[#594B42]">
          No media assets found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const is3D = asset.mediaType === MediaType.MODEL_3D;
            const isLogo = asset.mediaType === MediaType.LOGO;
            const fullUrl = api.resolveMediaUrl(asset.fileUrl);

            return (
              <div
                key={asset._id}
                className="bg-white border border-[#DECDB5] flex flex-col justify-between overflow-hidden"
              >
                <div className="h-40 bg-[#F7F3EC] flex items-center justify-center relative border-b border-[#DECDB5]">
                  {is3D ? (
                    <div className="text-center p-4">
                      <Box className="w-12 h-12 text-[#5E0B15] mx-auto mb-2" />
                      <span className="text-[10px] font-bold text-[#5E0B15] uppercase tracking-wider block">
                        3D GLB Model Asset
                      </span>
                    </div>
                  ) : (
                    <img
                      src={fullUrl}
                      alt={asset.originalFilename || 'Media'}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-2 left-2">
                    {is3D && <Badge variant="dietary">3D GLB</Badge>}
                    {isLogo && <Badge variant="info">LOGO</Badge>}
                    {!is3D && !isLogo && <Badge variant="neutral">IMAGE</Badge>}
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#1C120C] uppercase tracking-wider truncate">
                      {asset.originalFilename || 'Media File'}
                    </p>
                    <p className="text-[10px] font-mono text-[#594B42]">
                      {(asset.fileSize / 1024).toFixed(1)} KB • {asset.storageProvider}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1]">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#90323D] hover:text-[#5E0B15] uppercase flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => setDeletingAsset(asset)}
                      className="text-[#90323D] hover:text-[#5E0B15] p-1 cursor-pointer transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(null)}
        title="Delete Media Asset"
      >
        {deletingAsset && (
          <div className="space-y-4">
            <p className="text-sm text-[#1C120C]">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#90323D]">{deletingAsset.originalFilename || 'this asset'}</strong>?
            </p>
            <p className="text-xs text-[#594B42]">
              The file will be wiped from storage and any dish referencing it will lose this media.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#DECDB5]">
              <Button
                variant="outline"
                onClick={() => setDeletingAsset(null)}
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
