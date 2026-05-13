/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'kn' | 'hi' | 'ta';

export interface Product {
  id: string;
  name: string;
  benefit: string;
  category: 'cooking' | 'storage' | 'wellness';
  imageUrl: string;
  price: number;
  size: string;
  usageInstructions: string;
  availability: 'in-stock' | 'on-order' | 'out-of-stock';
  ecoScore: number; // 1-100
  plasticReduced: string; // e.g. "2.5kg"
  artisanId?: string;
}

export interface Artisan {
  name: string;
  phone: string;
  location: string;
  village: string;
  experience: number; // years
  heritageStory: string;
  profileImage?: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'artisan' | 'customer' | 'admin';
  village?: string;
  profileImage?: string;
  languagePreference?: string;
  artisanType?: string;
  experience?: number;
  heritageStory?: string;
  favorites?: string[];
}

export type TemplateType = 'traditional' | 'minimal' | 'festival';

export interface CardState {
  product: Product;
  artisan: Artisan;
  fontSize: number;
  textColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  template: TemplateType;
  language: Language;
}

// ARTISAN BUSINESS TYPES
export type ProductStatus = 'draft' | 'active' | 'sold_out' | 'archived';
export type OrderStatus = 'pending' | 'accepted' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'rejected';

export interface ArtisanProduct extends Product {
  status: ProductStatus;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  compareAtPrice?: number;
  currency: string;
  story: string;
  materials: Material[];
  craftDetails: {
    technique: string;
    timeToMake: number;
    ecoScore: number;
    certifications: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Material {
  id?: string;
  name: string;
  category: string;
  quantityUsed: number;
  unit: string;
  costPerUnit: number;
}

export interface Order {
  id: string;
  artisanId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt?: Date;
  trackingNumber?: string;
  notes?: string;
}

export interface CustomRequest {
  id: string;
  artisanId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  description: string;
  budget?: number;
  timeline?: string;
  status: 'pending' | 'rejected' | 'counter_offered' | 'accepted' | 'completed';
  createdAt: Date;
}

export interface WorkshopEvent {
  id: string;
  artisanId: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'workshop' | 'custom_order' | 'personal';
  description?: string;
  maxParticipants?: number;
  enrolled?: number;
  reminders: boolean;
}

export interface MaterialInventory {
  id: string;
  artisanId: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  lastPurchased: Date;
  lowStockThreshold: number;
  linkedProducts: string[];
}

export interface ArtisanAnalytics {
  id: string;
  artisanId: string;
  period: 'week' | 'month' | 'year';
  totalRevenue: number;
  ordersCount: number;
  averageOrderValue: number;
  topProduct?: string;
  conversionRate: number;
  lastUpdated: Date;
}
