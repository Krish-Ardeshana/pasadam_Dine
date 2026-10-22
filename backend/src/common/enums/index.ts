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
}

