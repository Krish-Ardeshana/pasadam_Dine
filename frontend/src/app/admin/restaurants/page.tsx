'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Th, Td, Skeleton } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Card';
import { useToast } from '@/context/toast-context';
import { api } from '@/lib/api';
import { Restaurant, RestaurantApprovalStatus } from '@/lib/types';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Action Modal State
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'SUSPEND' | 'REJECT' | 'TRANSFER' | null>(null);
  const [newOwnerId, setNewOwnerId] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const toast = useToast();

  const fetchRestaurants = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.restaurants.list({ limit: 100, search: search || undefined });
      setRestaurants(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleUpdateStatus = async (status: RestaurantApprovalStatus, isActive: boolean) => {
    if (!selectedRest) return;
    setIsActionLoading(true);
    try {
      await api.restaurants.updateApproval(selectedRest._id, {
        approvalStatus: status,
        isActive,
      });
      toast.success(`Restaurant ${selectedRest.name} status updated to ${status}`);
      setSelectedRest(null);
      setActionType(null);
      await fetchRestaurants();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedRest || !newOwnerId) return;
    setIsActionLoading(true);
    try {
      await api.restaurants.transferOwnership(selectedRest._id, newOwnerId);
      toast.success(`Ownership transferred successfully`);
      setSelectedRest(null);
      setActionType(null);
      setNewOwnerId('');
      await fetchRestaurants();
    } catch (err: any) {
      toast.error(err.message || 'Transfer failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.approvalStatus === statusFilter;
  });

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DECDB5] pb-4">
        <div>
          <h1 className="text-xl font-black text-[#5E0B15] uppercase tracking-wider">
            Restaurant Approvals & Tenants
          </h1>
          <p className="text-xs text-[#594B42] uppercase tracking-wider mt-0.5">
            Platform governance, status approval, and multi-tenant security
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="w-full sm:w-72 relative">
          <Input
            placeholder="SEARCH BY RESTAURANT NAME..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="uppercase text-xs"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-[#5E0B15] text-white border-[#5E0B15] shadow-xs'
                  : 'bg-white text-[#594B42] border-[#E8E2D9] hover:bg-[#FAF7F2]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table>
        <Thead>
          <tr>
            <Th>Restaurant</Th>
            <Th>Public Slug</Th>
            <Th>Status</Th>
            <Th>Owner</Th>
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
                  <Skeleton className="h-8 w-full" />
                </div>
              </Td>
            </tr>
          ) : filteredRestaurants.length === 0 ? (
            <tr>
              <Td colSpan={5} className="text-center py-8 text-xs font-bold uppercase text-[#594B42]">
                No restaurants found matching the filter criteria.
              </Td>
            </tr>
          ) : (
            filteredRestaurants.map((r) => {
              const owner = typeof r.ownerId === 'object' && r.ownerId !== null ? (r.ownerId as any).email : 'Unassigned';

              return (
                <tr key={r._id} className="hover:bg-[#F7F3EC] transition-colors">
                  <Td className="font-bold text-[#1C120C] uppercase tracking-wider">
                    {r.name}
                  </Td>
                  <Td className="font-mono text-xs text-[#594B42]">
                    <Link
                      href={`/r/${r.slug}`}
                      target="_blank"
                      className="text-[#90323D] hover:text-[#5E0B15] flex items-center gap-1"
                    >
                      <span>/r/{r.slug}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Td>
                  <Td>
                    {r.approvalStatus === RestaurantApprovalStatus.APPROVED && (
                      <Badge variant="success">APPROVED</Badge>
                    )}
                    {r.approvalStatus === RestaurantApprovalStatus.PENDING && (
                      <Badge variant="warning">PENDING</Badge>
                    )}
                    {r.approvalStatus === RestaurantApprovalStatus.SUSPENDED && (
                      <Badge variant="danger">SUSPENDED</Badge>
                    )}
                    {r.approvalStatus === RestaurantApprovalStatus.REJECTED && (
                      <Badge variant="danger">REJECTED</Badge>
                    )}
                  </Td>
                  <Td className="text-xs text-[#594B42]">{owner}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.approvalStatus !== RestaurantApprovalStatus.APPROVED && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedRest(r);
                            setActionType('APPROVE');
                          }}
                          className="font-bold uppercase text-[11px]"
                        >
                          Approve
                        </Button>
                      )}
                      {r.approvalStatus === RestaurantApprovalStatus.APPROVED && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedRest(r);
                            setActionType('SUSPEND');
                          }}
                          className="font-bold uppercase text-[11px]"
                        >
                          Suspend
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRest(r);
                          setActionType('TRANSFER');
                        }}
                        className="font-bold uppercase text-[11px]"
                      >
                        Transfer
                      </Button>
                    </div>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      {/* Confirmation & Action Modal */}
      <Modal
        isOpen={!!selectedRest && !!actionType}
        onClose={() => {
          setSelectedRest(null);
          setActionType(null);
        }}
        title={`Admin Action: ${actionType} Restaurant`}
      >
        {selectedRest && actionType === 'APPROVE' && (
          <div className="space-y-4">
            <p className="text-sm text-[#1C120C]">
              Are you sure you want to approve and activate{' '}
              <strong className="text-[#5E0B15] uppercase">{selectedRest.name}</strong>?
            </p>
            <p className="text-xs text-[#594B42]">
              The restaurant public menu will immediately become accessible to dining customers at{' '}
              <code className="bg-[#EDE1CF] px-1 py-0.5">/r/{selectedRest.slug}</code>.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#DECDB5]">
              <Button
                variant="outline"
                onClick={() => setActionType(null)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isActionLoading}
                onClick={() => handleUpdateStatus(RestaurantApprovalStatus.APPROVED, true)}
              >
                Confirm Approval
              </Button>
            </div>
          </div>
        )}

        {selectedRest && actionType === 'SUSPEND' && (
          <div className="space-y-4">
            <p className="text-sm text-[#1C120C]">
              Are you sure you want to suspend{' '}
              <strong className="text-[#90323D] uppercase">{selectedRest.name}</strong>?
            </p>
            <p className="text-xs text-[#594B42]">
              Public customer menu requests will return 404 and ordering access will be immediately
              disabled.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#DECDB5]">
              <Button
                variant="outline"
                onClick={() => setActionType(null)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isActionLoading}
                onClick={() => handleUpdateStatus(RestaurantApprovalStatus.SUSPENDED, false)}
              >
                Confirm Suspension
              </Button>
            </div>
          </div>
        )}

        {selectedRest && actionType === 'TRANSFER' && (
          <div className="space-y-4">
            <p className="text-sm text-[#1C120C]">
              Transfer ownership of{' '}
              <strong className="text-[#5E0B15] uppercase">{selectedRest.name}</strong> to another
              platform user.
            </p>
            <Input
              label="New Owner User ID"
              placeholder="e.g. 660c1bf6e68d9029a1d1d8ef"
              value={newOwnerId}
              onChange={(e) => setNewOwnerId(e.target.value)}
              required
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-[#DECDB5]">
              <Button
                variant="outline"
                onClick={() => setActionType(null)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isActionLoading}
                onClick={handleTransferOwnership}
              >
                Execute Transfer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
