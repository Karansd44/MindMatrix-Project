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
export type CustomRequestStatus = 'pending' | 'rejected' | 'counter_offered' | 'accepted' | 'completed';

// Enhanced ArtisanProduct with full business requirements
export interface ArtisanProduct {
  id: string;
  artisanId: string;
  name: string;
  benefit: string;           // Health/eco benefits
  description: string;       // Product description
  story: string;             // Cultural/craft heritage story
  category: 'cooking' | 'storage' | 'wellness';
  price: number;
  compareAtPrice?: number;   // For discounts
  currency: string;          // Default 'INR'
  sku: string;               // Stock keeping unit
  quantity: number;          // Current stock
  lowStockThreshold: number; // Auto-alert threshold
  status: ProductStatus;
  imageUrl: string;          // Primary image
  images?: string[];         // Additional Firebase Storage URLs
  availability: 'in-stock' | 'on-order' | 'out-of-stock';
  ecoScore: number;          // 1-100 (1-10 internally converted)
  plasticReduced?: string;   // e.g. "2.5kg/year"
  usageInstructions?: string;
  materials: MaterialUsage[]; // Materials used in this product
  craftDetails: {
    technique: string;       // Hand-thrown, wheel-thrown, etc.
    timeToMake: number;      // Hours to craft
    ecoScore: number;        // 1-10
    certifications: string[]; // Organic, Fair Trade, etc.
  };
  createdAt: any;            // Firestore Timestamp
  updatedAt: any;            // Firestore Timestamp
}

// Material usage in a specific product
export interface MaterialUsage {
  id?: string;
  name: string;
  category: string;          // Clay type, glaze, etc.
  quantityUsed: number;      // Amount used per unit product
  unit: string;              // kg, grams, pieces, etc.
  costPerUnit: number;       // Cost to artisan
}

// Raw material/supply inventory
export interface SupplyMaterial {
  id: string;
  artisanId: string;
  name: string;
  category: string;          // Clay, Glaze, Tools, Packaging, etc.
  currentStock: number;      // Quantity in hand
  unit: string;              // kg, meters, pieces, liters
  costPerUnit: number;       // Purchase price per unit
  supplier?: string;
  supplierContact?: string;
  lastPurchased: any;        // Firestore Timestamp
  lowStockThreshold: number; // Alert when below this
  linkedProducts: string[];  // Product IDs that use this material
  reorderPoint?: number;
}

// Enhanced Order with full fulfillment workflow
export interface Order {
  id: string;
  artisanId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: any;   // Firestore Timestamp
  notes?: string;
  reasonForRejection?: string;
  createdAt: any;            // Firestore Timestamp
  updatedAt?: any;
}

// Custom order requests from customers
export interface CustomRequest {
  id: string;
  artisanId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description: string;
  budget?: number;
  timeline?: string;
  attachmentUrls?: string[];
  requestedFeatures?: string[];
  status: CustomRequestStatus;
  artisanCounterOffer?: {
    proposedPrice: number;
    proposedTimeline: string;
    notes: string;
  };
  createdAt: any;            // Firestore Timestamp
  respondedAt?: any;
}

export interface WorkshopEvent {
  id: string;
  artisanId: string;
  title: string;
  date: any;                 // Firestore Timestamp
  startTime: string;         // HH:mm format
  endTime: string;
  type: 'workshop' | 'custom_order' | 'personal';
  description?: string;
  location?: string;
  maxParticipants?: number;
  enrolled?: number;
  enrolledStudents?: string[]; // customer IDs
  reminders: boolean;
  status?: 'scheduled' | 'completed' | 'cancelled';
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
  supplierContact?: string;
  lastPurchased: any;        // Firestore Timestamp
  lowStockThreshold: number;
  linkedProducts: string[];
  reorderPoint?: number;
  usageHistory?: UsageLog[];
}

export interface UsageLog {
  productId: string;
  quantityUsed: number;
  date: any;                 // Firestore Timestamp
  batchNumber?: string;
}

// Pricing & Cost Calculator
export interface CostBreakdown {
  materialsCost: number;     // Sum of (quantityUsed × costPerUnit)
  laborCost: number;         // Hours × hourlyRate
  overhead: number;          // % of materials + labor
  totalCost: number;         // materials + labor + overhead
}

export interface PricingSuggestion {
  productId: string;
  costBreakdown: CostBreakdown;
  suggestedWholesale: number;  // Cost + 30%
  suggestedRetail: number;     // Cost + 60%
  suggestedMarketplace: number; // Cost + 50%
  currentPrice: number;
  potentialMargin: number;
  marginPercentage: number;
}

// Enhanced Analytics
export interface ArtisanAnalytics {
  id: string;
  artisanId: string;
  period: 'week' | 'month' | 'year';
  totalRevenue: number;
  ordersCount: number;
  averageOrderValue: number;
  topProducts?: { productId: string; name: string; sales: number }[];
  topCustomers?: { customerId: string; name: string; orders: number }[];
  conversionRate: number;
  repeatCustomerRate?: number;
  lastUpdated: any;          // Firestore Timestamp
}

export interface SalesPeriodComparison {
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  percentageChange: number;
  ordersCurrentPeriod: number;
  ordersPreviousPeriod: number;
}

// Artisan Profile Showcase
export interface ArtisanProfileShowcase {
  artisanId: string;
  coverImageUrl?: string;
  bio: string;
  craftJourney: string;
  techniques: TechniqueShowcase[];
  processVideoUrl?: string;
  followers?: number;
  following?: number;
  verificationStatus?: 'unverified' | 'verified' | 'premium';
  socialLinks?: {
    instagram?: string;
    whatsapp?: string;
    website?: string;
  };
}

export interface TechniqueShowcase {
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
}
