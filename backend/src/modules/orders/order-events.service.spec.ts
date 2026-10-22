import { describe, it, expect } from 'vitest';
import { OrderEventsService } from './order-events.service.js';

describe('OrderEventsService Real-time Tenant Stream Isolation', () => {
  it('should stream events to the targeted restaurant subscriber and strictly filter out other tenants', async () => {
    const service = new OrderEventsService();

    const restAId = '654321654321654321654321';
    const restBId = '987654987654987654987654';

    const eventsReceivedByA: any[] = [];
    const eventsReceivedByB: any[] = [];

    const subA = service.subscribeToRestaurant(restAId).subscribe((msg) => {
      eventsReceivedByA.push(msg);
    });

    const subB = service.subscribeToRestaurant(restBId).subscribe((msg) => {
      eventsReceivedByB.push(msg);
    });

    // Emit event for Restaurant A
    service.emit(restAId, 'ORDER_CREATED', {
      orderNumber: 'ORD-A-001',
      total: 100,
    });

    // Emit event for Restaurant B
    service.emit(restBId, 'ORDER_STATUS_CHANGED', {
      orderNumber: 'ORD-B-001',
      total: 250,
    });

    // Verify isolation
    expect(eventsReceivedByA).toHaveLength(1);
    expect(eventsReceivedByA[0].data.eventType).toBe('ORDER_CREATED');
    expect(eventsReceivedByA[0].data.order.orderNumber).toBe('ORD-A-001');

    expect(eventsReceivedByB).toHaveLength(1);
    expect(eventsReceivedByB[0].data.eventType).toBe('ORDER_STATUS_CHANGED');
    expect(eventsReceivedByB[0].data.order.orderNumber).toBe('ORD-B-001');

    subA.unsubscribe();
    subB.unsubscribe();
  });
});
