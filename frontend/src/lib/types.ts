export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  RESTAURANT_MANAGER = 'RESTAURANT_MANAGER',
  RESTAURANT_STAFF = 'RESTAURANT_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum RestaurantApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  MODEL_3D = 'MODEL_3D',
  LOGO = 'LOGO',
  OTHER = 'OTHER',
}

export enum StorageProvider {
  CLOUDINARY = 'CLOUDINARY',
  LOCAL = 'LOCAL',
}

export enum QrType {
  RESTAURANT_MENU = 'RESTAURANT_MENU',
  DISH_DIRECT = 'DISH_DIRECT',
}

export enum QrStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  restaurantAssignments: (string | Restaurant)[];
  permissions: string[];
  accountStatus: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface RestaurantContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface RestaurantSettings {
  currency: string;
  defaultTaxRate?: number;
  timezone?: string;
  orderAcceptance?: boolean;
  tableCount?: number;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  address?: RestaurantAddress;
  contactDetails?: RestaurantContact;
  ownerId?: string | User;
  approvalStatus: RestaurantApprovalStatus;
  isActive: boolean;
  settings?: RestaurantSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder: number;
  status: CategoryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dish {
  _id: string;
  restaurantId: string;
  categoryId: string | Category;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  imageUrls: string[];
  model3dUrl?: string;
  isAvailable: boolean;
  isPublished: boolean;
  dietaryFlags: string[];
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaAsset {
  _id: string;
  restaurantId: string;
  dishId?: string;
  mediaType: MediaType;
  storageProvider: StorageProvider;
  fileUrl: string;
  publicId?: string;
  mimeType: string;
  fileSize: number;
  originalFilename?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface QrCode {
  _id: string;
  restaurantId: string;
  dishId?: string | Dish;
  qrType: QrType;
  targetUrl: string;
  imageData: string;
  status: QrStatus;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  dishes: Dish[];
}

export interface PublicMenuResponse {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    address?: RestaurantAddress;
    contactDetails?: RestaurantContact;
    settings?: RestaurantSettings;
  };
  categories: PublicMenuCategory[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

export enum OrderPaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
}

export enum OrderPaymentMethod {
  PAY_AT_TABLE = 'PAY_AT_TABLE',
  CASH_AT_COUNTER = 'CASH_AT_COUNTER',
  ONLINE_PENDING = 'ONLINE_PENDING',
  RAZORPAY = 'RAZORPAY',
}

export interface PublicPaymentConfig {
  keyId: string;
  currency: string;
  mode: string;
  gateway: string;
}

export interface PaymentOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderNumber: string;
  customer: {
    name: string;
    contact: string;
  };
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}


export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  instructions?: string;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
  currency: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface Order {
  _id: string;
  restaurantId: string;
  orderNumber: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  items: OrderItem[];
  pricing: OrderPricing;
  totalAmount?: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: OrderPaymentMethod;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemInput {
  dishId: string;
  quantity: number;
  instructions?: string;
}

export interface CreateOrderInput {
  orderType?: OrderType;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  paymentMethod?: OrderPaymentMethod;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  reason?: string;
}

export interface AuditLogItem {
  _id: string;
  actorId?: {
    _id: string;
    name: string;
    email: string;
    role: Role;
  };
  restaurantId?: {
    _id: string;
    name: string;
    slug: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  safeMetadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminOverviewStats {
  restaurants: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  users: {
    total: number;
  };
  menu: {
    totalCategories: number;
    totalDishes: number;
    dishesWith3d: number;
    dishesWithout3d: number;
  };
  orders: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
  };
}


