'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Th, Td, Skeleton } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Role, User } from '@/lib/types';

export default function StaffPage() {
  const { currentRestaurant } = useAuth();
  const toast = useToast();

  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.RESTAURANT_STAFF);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = React.useCallback(async () => {
    if (!currentRestaurant?._id) return;
    try {
      setIsLoading(true);
      // Fetch platform users and filter those assigned to this restaurant
      const res = await api.users.list({ limit: 100 });
      const filtered = (res.data || []).filter((u) =>
        (u.restaurantAssignments || []).some((r: any) =>
          typeof r === 'object' ? r._id === currentRestaurant._id : r === currentRestaurant._id,
        ),
      );
      setStaffList(filtered);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch staff members');
    } finally {
      setIsLoading(false);
    }
  }, [currentRestaurant, toast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant?._id || !name.trim() || !email.trim() || !password) return;

    setIsSubmitting(true);
    try {
      await api.users.createStaff({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        restaurantId: currentRestaurant._id,
      });
      toast.success(`Staff account created for ${name}`);
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      await fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DECDB5] pb-4">
        <div>
          <h1 className="text-xl font-black text-[#5E0B15] uppercase tracking-wider">
            Restaurant Staff Team
          </h1>
          <p className="text-xs text-[#594B42] uppercase tracking-wider mt-0.5">
            Manage manager and waitstaff credentials for {currentRestaurant?.name}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="uppercase font-bold tracking-wider"
        >
          <UserPlus className="w-4 h-4 mr-1.5" /> Add Staff Member
        </Button>
      </div>

      {/* Staff Table */}
      <Table>
        <Thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Assigned Role</Th>
            <Th>Status</Th>
          </tr>
        </Thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td colSpan={4}>
                <div className="space-y-2 py-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Td>
            </tr>
          ) : staffList.length === 0 ? (
            <tr>
              <Td colSpan={4} className="text-center py-10 text-xs font-bold uppercase text-[#594B42]">
                No staff members currently assigned to this restaurant.
              </Td>
            </tr>
          ) : (
            staffList.map((st) => (
              <tr key={st._id || st.id} className="hover:bg-[#F7F3EC] transition-colors">
                <Td className="font-bold text-[#1C120C] uppercase tracking-wider">{st.name}</Td>
                <Td className="font-mono text-xs text-[#594B42]">{st.email}</Td>
                <Td>
                  {st.role === Role.RESTAURANT_MANAGER ? (
                    <Badge variant="info">RESTAURANT_MANAGER</Badge>
                  ) : st.role === Role.RESTAURANT_OWNER ? (
                    <Badge variant="dietary">OWNER</Badge>
                  ) : (
                    <Badge variant="neutral">STAFF</Badge>
                  )}
                </Td>
                <Td>
                  <Badge variant="success">ACTIVE</Badge>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Create Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Staff Member"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="ramesh@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Temporary Password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-[#594B42]">
              Assigned Restaurant Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 bg-white border border-[#D6C5A9] text-sm text-[#1C120C] focus:outline-none focus:border-[#5E0B15]"
            >
              <option value={Role.RESTAURANT_STAFF}>
                RESTAURANT_STAFF (Menu view & availability toggle)
              </option>
              <option value={Role.RESTAURANT_MANAGER}>
                RESTAURANT_MANAGER (Full menu, category, dish, QR management)
              </option>
            </select>
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
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
