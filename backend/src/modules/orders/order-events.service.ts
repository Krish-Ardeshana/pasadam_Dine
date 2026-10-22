import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface OrderEventPayload {
  restaurantId: string;
  eventType: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED';
  order: any;
  timestamp: string;
}

export interface SseMessage {
  data: {
    eventType: string;
    order: any;
    timestamp: string;
  };
  id?: string;
  type?: string;
  retry?: number;
}

@Injectable()
export class OrderEventsService {
  private readonly logger = new Logger(OrderEventsService.name);
  private readonly eventStream$ = new Subject<OrderEventPayload>();

  /**
   * Publishes an event to the order stream.
   * Database write must have succeeded prior to calling this.
   */
  emit(restaurantId: string, eventType: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED', order: any): void {
    const payload: OrderEventPayload = {
      restaurantId: restaurantId.toString(),
      eventType,
      order: typeof order.toObject === 'function' ? order.toObject() : order,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`Order event emitted [${eventType}] for restaurant ${restaurantId} order #${order.orderNumber}`);
    this.eventStream$.next(payload);
  }

  /**
   * Returns an Observable stream of order events strictly filtered for a specific restaurant tenant.
   * This guarantees cross-tenant isolation in the real-time layer.
   */
  subscribeToRestaurant(restaurantId: string): Observable<SseMessage> {
    const targetRestaurantId = restaurantId.toString();

    return this.eventStream$.asObservable().pipe(
      filter((event) => event.restaurantId === targetRestaurantId),
      map((event) => ({
        data: {
          eventType: event.eventType,
          order: event.order,
          timestamp: event.timestamp,
        },
        id: `${event.order._id || event.order.orderNumber}-${Date.now()}`,
        retry: 3000,
      })),
    );
  }
}
