'use client';

import React, { useEffect, useState } from 'react';
import {
  QrCode as QrIcon,
  Download,
  Printer,
  RefreshCw,
  ExternalLink,
  Plus,
  UtensilsCrossed,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Card, Modal, Badge } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { Dish, QrCode, QrType } from '@/lib/types';

export default function QrManagementPage() {
  const { currentRestaurant } = useAuth();
  const toast = useToast();

  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'ALL' | 'MENU' | 'DISH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate Modal State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [qrType, setQrType] = useState<QrType>(QrType.RESTAURANT_MENU);
  const [dishId, setDishId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Print Preview Modal State
  const [printQr, setPrintQr] = useState<QrCode | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!currentRestaurant?._id) return;
    try {
      setIsLoading(true);
      const [qrRes, dishRes] = await Promise.all([
        api.qr.list(currentRestaurant._id),
        api.dishes.list(currentRestaurant._id, { limit: 100 }),
      ]);
      setQrCodes(qrRes || []);
      setDishes(dishRes.data || []);
      if (dishRes.data?.length > 0) {
        setDishId(dishRes.data[0]._id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch QR codes');
    } finally {
      setIsLoading(false);
    }
  }, [currentRestaurant, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant?._id) return;

    if (qrType === QrType.DISH_DIRECT && !dishId) {
      toast.error('Please select a dish for the direct QR code');
      return;
    }

    setIsGenerating(true);
    try {
      await api.qr.generate(currentRestaurant._id, {
        qrType,
        dishId: qrType === QrType.DISH_DIRECT ? dishId : undefined,
      });
      toast.success('QR Code generated successfully');
      setIsGenerateOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (qrId: string) => {
    if (!currentRestaurant?._id) return;
    try {
      await api.qr.regenerate(currentRestaurant._id, qrId);
      toast.success('QR Code graphic regenerated preserving target URL');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Regeneration failed');
    }
  };

  const downloadQrPng = (qr: QrCode) => {
    const link = document.createElement('a');
    link.href = qr.imageData;
    link.download = `prasadam-qr-${qr.qrType.toLowerCase()}-${qr._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded as PNG');
  };

  const handlePrint = (qr: QrCode) => {
    setPrintQr(qr);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const filteredQrCodes = qrCodes.filter((qr) => {
    const isMenu = qr.qrType === QrType.RESTAURANT_MENU;
    if (activeTab === 'MENU' && !isMenu) return false;
    if (activeTab === 'DISH' && isMenu) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const dishName =
      typeof qr.dishId === 'object' && qr.dishId !== null
        ? (qr.dishId as any).name?.toLowerCase() || ''
        : '';
    const restaurantName = currentRestaurant?.name?.toLowerCase() || '';
    const target = qr.targetUrl?.toLowerCase() || '';

    return (
      dishName.includes(query) ||
      restaurantName.includes(query) ||
      target.includes(query)
    );
  });

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
        <div>
          <h1 className="text-xl font-black text-[#7A0C1E] uppercase tracking-wider font-luxury">
            Dine-In QR Codes & Placards
          </h1>
          <p className="text-xs text-[#6E5D53] uppercase tracking-wider mt-0.5">
            Table stands and direct dish AR QR codes pointing to live digital menu
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsGenerateOpen(true)}
          className="uppercase font-bold tracking-wider"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Generate QR Code
        </Button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white rounded-2xl border border-[#E8DEC9] p-3.5 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
              activeTab === 'ALL'
                ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white shadow-xs'
                : 'bg-transparent text-[#6E5D53] hover:bg-[#FAF7F2]'
            }`}
          >
            All QRs ({qrCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('MENU')}
            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
              activeTab === 'MENU'
                ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white shadow-xs'
                : 'bg-transparent text-[#6E5D53] hover:bg-[#FAF7F2]'
            }`}
          >
            Menu Stands ({qrCodes.filter((q) => q.qrType === QrType.RESTAURANT_MENU).length})
          </button>
          <button
            onClick={() => setActiveTab('DISH')}
            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
              activeTab === 'DISH'
                ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white shadow-xs'
                : 'bg-transparent text-[#6E5D53] hover:bg-[#FAF7F2]'
            }`}
          >
            Dish 3D AR ({qrCodes.filter((q) => q.qrType === QrType.DISH_DIRECT).length})
          </button>
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search QR codes or URLs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#FFFDF9] rounded-xl border border-[#E8DEC9] text-xs text-[#1C120C] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] placeholder-[#8C7A6F]"
          />
        </div>
      </div>

      {/* QR Codes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : filteredQrCodes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8DEC9] p-12 text-center text-xs font-bold uppercase text-[#6E5D53] shadow-sm">
          No QR codes found matching your criteria. Click &quot;Generate QR Code&quot; to create a new stand.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQrCodes.map((qr) => {
            const isMenu = qr.qrType === QrType.RESTAURANT_MENU;
            const dishName =
              typeof qr.dishId === 'object' && qr.dishId !== null
                ? (qr.dishId as any).name
                : 'Direct Dish';

            return (
              <div
                key={qr._id}
                className="bg-white rounded-2xl border border-[#E8DEC9] p-6 flex flex-col justify-between hover:border-[#F59E0B]/50 hover:shadow-md transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={isMenu ? 'info' : 'dietary'}>
                      {isMenu ? 'MENU STAND QR' : 'DISH DIRECT AR'}
                    </Badge>
                    <button
                      onClick={() => handleRegenerate(qr._id)}
                      title="Regenerate QR Graphic"
                      className="text-[#594B42] hover:text-[#5E0B15] p-1 hover:bg-[#EDE1CF] transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* QR Image Canvas */}
                  <div className="bg-[#FAF7F2] p-4 border border-[#DCD5C9] flex items-center justify-center mb-4">
                    <img
                      src={qr.imageData}
                      alt="Dine-in QR"
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-[#5E0B15] uppercase tracking-wider mb-1 truncate">
                    {isMenu ? currentRestaurant?.name : dishName}
                  </h3>

                  <p className="text-[11px] font-mono text-[#594B42] truncate mb-4">
                    Target: {qr.targetUrl}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#DCD5C9]">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => downloadQrPng(qr)}
                      className="uppercase font-bold text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> PNG
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(qr)}
                      className="uppercase font-bold text-[11px]"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" /> Print
                    </Button>
                  </div>
                  <a
                    href={qr.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#90323D] hover:text-[#5E0B15] uppercase pt-1"
                  >
                    <span>Test Destination URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Table Dining QR"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
              QR Target Type
            </label>
            <select
              value={qrType}
              onChange={(e) => setQrType(e.target.value as QrType)}
              className="w-full px-3 py-2 bg-white border border-[#DCD5C9] text-sm text-[#1C120C] focus:outline-none focus:border-[#90323D]"
            >
              <option value={QrType.RESTAURANT_MENU}>
                Full Restaurant Menu Stand (/r/{currentRestaurant?.slug})
              </option>
              <option value={QrType.DISH_DIRECT}>
                Direct Dish 3D AR Tablecard (/r/{currentRestaurant?.slug}/d/...)
              </option>
            </select>
          </div>

          {qrType === QrType.DISH_DIRECT && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
                Select Target Dish
              </label>
              <select
                value={dishId}
                onChange={(e) => setDishId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DCD5C9] text-sm text-[#1C120C] focus:outline-none focus:border-[#90323D]"
              >
                {dishes.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.currency} {d.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3 bg-[#EDE1CF]/60 border border-[#DCD5C9] text-xs text-[#594B42]">
            Target URL will use the production frontend base URL configured in your environment.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#DCD5C9]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsGenerateOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isGenerating}>
              Generate QR
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Placard Hidden in screen, visible when printing */}
      {printQr && (
        <div className="hidden print:flex fixed inset-0 z-100 bg-white items-center justify-center p-12 flex-col text-center border-8 border-[#5E0B15]">
          <h1 className="text-3xl font-black text-[#5E0B15] uppercase tracking-widest mb-2 font-luxury">
            PRASADAM DINE
          </h1>
          <p className="text-sm font-semibold tracking-wider uppercase text-[#594B42] mb-6">
            Scan to view digital menu & interactive 3D dishes
          </p>
          <img src={printQr.imageData} alt="Printable QR" className="w-80 h-80 mx-auto mb-6 border-2 border-[#DCD5C9] p-2" />
          <h2 className="text-2xl font-bold uppercase tracking-wider text-[#1C120C] mb-1">
            {currentRestaurant?.name}
          </h2>
          <p className="font-mono text-xs text-[#594B42]">{printQr.targetUrl}</p>
        </div>
      )}
    </DashboardShell>
  );
}
