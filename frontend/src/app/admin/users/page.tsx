'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Card';
import { Table, Thead, Th, Td, Skeleton } from '@/components/ui/Table';
import { useToast } from '@/context/toast-context';
import { api } from '@/lib/api';
import { Role, User, UserStatus } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.users.list({ limit: 100, search: search || undefined });
      setUsers(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load platform users');
    } finally {
      setIsLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (user: User) => {
    const newStatus =
      user.accountStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    const userId = user._id || user.id;
    if (!userId) return;

    try {
      await api.users.update(userId, { accountStatus: newStatus });
      toast.success(`User ${user.email} status updated to ${newStatus}`);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
        <div>
          <h1 className="text-xl font-black text-[#7A0C1E] uppercase tracking-wider font-luxury">
            Platform Users & Staff
          </h1>
          <p className="text-xs text-[#6B5B4E] uppercase tracking-wider mt-0.5">
            Role management, platform assignments, and account status controls
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8DEC9] p-4 shadow-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="SEARCH BY NAME OR EMAIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="uppercase text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <Thead>
          <tr>
            <Th>User</Th>
            <Th>Email</Th>
            <Th>Platform Role</Th>
            <Th>Status</Th>
            <Th className="text-right">Action</Th>
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
          ) : users.length === 0 ? (
            <tr>
              <Td colSpan={5} className="text-center py-8 text-xs font-bold uppercase text-[#6B5B4E]">
                No users found.
              </Td>
            </tr>
          ) : (
            users.map((u) => {
              const uId = u._id || u.id;
              const isSuper = u.role === Role.SUPER_ADMIN;

              return (
                <tr key={uId} className="hover:bg-[#FEF3C7]/30 transition-colors">
                  <Td className="font-bold text-[#1C120C] uppercase tracking-wider">
                    {u.name}
                  </Td>
                  <Td className="font-mono text-xs text-[#6B5B4E]">{u.email}</Td>
                  <Td>
                    {isSuper ? (
                      <Badge variant="dietary">SUPER_ADMIN</Badge>
                    ) : u.role === Role.RESTAURANT_OWNER ? (
                      <Badge variant="warning">RESTAURANT_OWNER</Badge>
                    ) : u.role === Role.RESTAURANT_MANAGER ? (
                      <Badge variant="neutral">MANAGER</Badge>
                    ) : (
                      <Badge variant="neutral">{u.role}</Badge>
                    )}
                  </Td>
                  <Td>
                    {u.accountStatus === UserStatus.ACTIVE ? (
                      <Badge variant="success">ACTIVE</Badge>
                    ) : (
                      <Badge variant="danger">SUSPENDED</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    {!isSuper && (
                      <Button
                        variant={u.accountStatus === UserStatus.ACTIVE ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => toggleUserStatus(u)}
                        className="uppercase text-[11px] font-bold"
                      >
                        {u.accountStatus === UserStatus.ACTIVE ? 'Suspend' : 'Activate'}
                      </Button>
                    )}
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </DashboardShell>
  );
}
