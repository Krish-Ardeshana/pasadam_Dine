'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Search,
  RefreshCw,
  ShieldAlert,
  Building2,
  UserCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Thead, Th, Td, Skeleton, EmptyState } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Card';
import { useToast } from '@/context/toast-context';
import { api } from '@/lib/api';
import { AuditLogItem } from '@/lib/types';

export default function AdminActivityPage() {
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.audit.list({ limit: 100 });
      setLogs(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load platform audit trail');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/dashboard');
      return;
    }
    if (isSuperAdmin) {
      fetchLogs();
    }
  }, [authLoading, isSuperAdmin, router, fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesAction =
      actionFilter === 'ALL' || log.action.toUpperCase().includes(actionFilter.toUpperCase());
    const actorStr = typeof log.actorId === 'object' ? `${log.actorId.name} ${log.actorId.email}` : '';
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      actorStr.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('REJECT') || action.includes('SUSPEND') || action.includes('DELETE')) {
      return 'danger';
    }
    if (action.includes('APPROVE') || action.includes('CREATE') || action.includes('SUCCESS')) {
      return 'success';
    }
    if (action.includes('TRANSFER') || action.includes('UPDATE')) {
      return 'warning';
    }
    return 'neutral';
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD5C9] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#5E0B15] uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#90323D]" />
            Administrative Activity Audit Trail
          </h1>
          <p className="text-xs text-[#594B42] uppercase tracking-wider mt-0.5">
            Immutable log of all tenant registrations, status updates, permissions, and security events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Link href="/admin">
            <Button variant="primary" size="sm">
              Overview
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#DCD5C9] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="SEARCH BY ACTOR, ACTION, OR ENTITY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="uppercase text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          {['ALL', 'APPROVE', 'TRANSFER', 'UPDATE', 'ORDER'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActionFilter(filter)}
              className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border cursor-pointer transition-colors ${
                actionFilter === filter
                  ? 'bg-[#5E0B15] text-[#EDE1CF] border-[#5E0B15]'
                  : 'bg-white text-[#594B42] border-[#DCD5C9] hover:bg-[#EDE1CF]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table>
        <Thead>
          <tr>
            <Th>Timestamp</Th>
            <Th>Administrative Actor</Th>
            <Th>Action Executed</Th>
            <Th>Entity Impacted</Th>
            <Th>Target Restaurant</Th>
            <Th>Audit Metadata</Th>
          </tr>
        </Thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td colSpan={6}>
                <div className="space-y-2 py-4">
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-full" />
                </div>
              </Td>
            </tr>
          ) : filteredLogs.length === 0 ? (
            <tr>
              <Td colSpan={6}>
                <EmptyState
                  icon={ShieldAlert}
                  title="No Audit Records Found"
                  description="No platform administrative actions matching the specified query criteria were found in the audit logs."
                />
              </Td>
            </tr>
          ) : (
            filteredLogs.map((log) => {
              const actor = typeof log.actorId === 'object' ? log.actorId : null;
              const restaurant = typeof log.restaurantId === 'object' ? log.restaurantId : null;

              return (
                <tr key={log._id} className="hover:bg-[#FAF8F5] transition-colors">
                  <Td className="whitespace-nowrap font-mono text-[11px] text-[#594B42]">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </Td>
                  <Td>
                    {actor ? (
                      <div>
                        <span className="font-black text-[#1C120C] block text-xs">{actor.name}</span>
                        <span className="text-[10px] text-[#594B42] block font-mono">{actor.email}</span>
                      </div>
                    ) : (
                      <span className="text-[#594B42] text-xs font-mono">System / Unauthenticated</span>
                    )}
                  </Td>
                  <Td>
                    <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                  </Td>
                  <Td>
                    <div className="font-mono text-xs">
                      <span className="font-black text-[#5E0B15]">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-[#594B42] text-[10px] block truncate max-w-[120px]">
                          ID: {log.entityId}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    {restaurant ? (
                      <div>
                        <span className="font-bold text-[#1C120C] text-xs block">{restaurant.name}</span>
                        <span className="text-[10px] text-[#90323D] font-mono block">/r/{restaurant.slug}</span>
                      </div>
                    ) : (
                      <span className="text-[#594B42] text-xs font-mono">Platform-Wide</span>
                    )}
                  </Td>
                  <Td>
                    {log.safeMetadata && Object.keys(log.safeMetadata).length > 0 ? (
                      <span className="font-mono text-[10px] text-[#594B42] bg-[#FAF8F5] px-2 py-1 border border-[#DCD5C9] inline-block max-w-[200px] truncate">
                        {JSON.stringify(log.safeMetadata)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#594B42]">—</span>
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
