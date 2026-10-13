'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, Building2, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

export default function RestaurantSettingsPage() {
  const { currentRestaurant, setCurrentRestaurant } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [orderAcceptance, setOrderAcceptance] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentRestaurant) {
      setName(currentRestaurant.name || '');
      setDescription(currentRestaurant.description || '');
      setPhone(currentRestaurant.contactDetails?.phone || '');
      setEmail(currentRestaurant.contactDetails?.email || '');
      setWebsite(currentRestaurant.contactDetails?.website || '');
      setStreet(currentRestaurant.address?.street || '');
      setCity(currentRestaurant.address?.city || '');
      setCountry(currentRestaurant.address?.country || '');
      setCurrency(currentRestaurant.settings?.currency || 'USD');
      setOrderAcceptance(currentRestaurant.settings?.orderAcceptance ?? true);
    }
  }, [currentRestaurant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant?._id) return;

    setIsSaving(true);
    try {
      const updated = await api.restaurants.update(currentRestaurant._id, {
        name,
        description,
        contactDetails: { phone, email, website },
        address: { street, city, country },
        settings: {
          currency,
          orderAcceptance,
        },
      });
      setCurrentRestaurant(updated);
      toast.success('Restaurant profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DECDB5] pb-4">
        <div>
          <h1 className="text-xl font-black text-[#5E0B15] uppercase tracking-wider">
            Restaurant Profile & Operations
          </h1>
          <p className="text-xs text-[#594B42] uppercase tracking-wider mt-0.5">
            Branding, contact details, currency, and dining preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <h2 className="text-sm font-extrabold text-[#5E0B15] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#DECDB5] pb-2">
            <Building2 className="w-4 h-4 text-[#90323D]" /> General Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Restaurant Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
                Public Description
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-white border border-[#D6C5A9] text-sm text-[#1C120C] focus:outline-none focus:border-[#5E0B15]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Contact & Location */}
        <Card>
          <h2 className="text-sm font-extrabold text-[#5E0B15] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#DECDB5] pb-2">
            <MapPin className="w-4 h-4 text-[#90323D]" /> Contact & Physical Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} />
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </Card>

        {/* Dining Configuration */}
        <Card>
          <h2 className="text-sm font-extrabold text-[#5E0B15] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#DECDB5] pb-2">
            <Settings className="w-4 h-4 text-[#90323D]" /> Operational Preferences
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Menu Currency Code"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            />
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-[#1C120C] uppercase tracking-wider cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderAcceptance}
                  onChange={(e) => setOrderAcceptance(e.target.checked)}
                  className="w-4 h-4 text-[#5E0B15]"
                />
                <span>Enable Live Dining Orders</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            className="uppercase font-bold tracking-wider"
          >
            <Save className="w-4 h-4 mr-1.5" /> Save Restaurant Settings
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
