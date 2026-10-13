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
