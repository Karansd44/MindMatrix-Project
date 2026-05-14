/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ArtisanProduct,
  Order,
  CustomRequest,
  WorkshopEvent,
  MaterialInventory,
  ArtisanAnalytics,
  ArtisanProfileShowcase
} from '../types';

export const MOCK_ARTISAN_PRODUCTS: ArtisanProduct[] = [
  {
    id: 'prod-1',
    artisanId: 'artisan-123',
    name: 'Vedic Curd Pot',
    benefit: 'Maintains pH balance and adds natural minerals for better digestion.',
    description: 'A traditional clay curd pot that keeps curd fresh and enhances its taste through natural fermentation.',
    story: 'Crafted using age-old techniques passed down through 4 generations in the Kumbara community.',
    category: 'storage',
    price: 450,
    compareAtPrice: 550,
    currency: 'INR',
    sku: 'POT-CURD-01',
    quantity: 25,
    lowStockThreshold: 5,
    status: 'active',
    imageUrl: '/images/vedic_curd_pot.png',
    images: [
      '/images/vedic_curd_pot.png'
    ],
    availability: 'in-stock',
    ecoScore: 98,
    plasticReduced: '1.2kg plastic/year',
    usageInstructions: 'Soak in water for 24 hours before first use. Hand wash only.',
    materials: [
      {
        id: 'mat-1',
        name: 'Terracotta Clay',
        category: 'Clay',
        quantityUsed: 1.5,
        unit: 'kg',
        costPerUnit: 20
      }
    ],
    craftDetails: {
      technique: 'Wheel-thrown',
      timeToMake: 3,
      ecoScore: 10,
      certifications: ['Organic']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    artisanId: 'artisan-123',
    name: 'Ancient Cool Bottle',
    benefit: 'Natural cooling via micro-porosity; 100% BPA and lead-free.',
    description: 'An eco-friendly terracotta water bottle for natural cooling.',
    story: 'Designed to blend modern utility with traditional cooling wisdom.',
    category: 'wellness',
    price: 350,
    currency: 'INR',
    sku: 'BOT-COOL-01',
    quantity: 15,
    lowStockThreshold: 10,
    status: 'active',
    imageUrl: '/images/ancient_cool_bottle.png',
    availability: 'in-stock',
    ecoScore: 99,
    plasticReduced: '365 plastic bottles/year',
    materials: [
      {
        id: 'mat-1',
        name: 'Terracotta Clay',
        category: 'Clay',
        quantityUsed: 0.8,
        unit: 'kg',
        costPerUnit: 20
      }
    ],
    craftDetails: {
      technique: 'Mould-cast',
      timeToMake: 2,
      ecoScore: 9,
      certifications: ['Eco-friendly']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    artisanId: 'artisan-123',
    customerId: 'cust-001',
    customerName: 'Anjali Sharma',
    customerPhone: '+919876543210',
    productId: 'prod-1',
    productName: 'Vedic Curd Pot',
    productImage: '/images/vedic_curd_pot.png',
    quantity: 2,
    totalPrice: 900,
    currency: 'INR',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ord-102',
    artisanId: 'artisan-123',
    customerId: 'cust-002',
    customerName: 'Rahul Verma',
    customerPhone: '+919876543211',
    productId: 'prod-2',
    productName: 'Ancient Cool Bottle',
    productImage: '/images/ancient_cool_bottle.png',
    quantity: 1,
    totalPrice: 350,
    currency: 'INR',
    status: 'shipped',
    trackingNumber: 'TRK987654321',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_CUSTOM_REQUESTS: CustomRequest[] = [
  {
    id: 'req-001',
    artisanId: 'artisan-123',
    customerId: 'cust-003',
    customerName: 'Priya Patel',
    customerPhone: '+919876543212',
    description: 'I would like a customized terracotta dinner set for 6 people with traditional Worli art painted on the edges.',
    budget: 5000,
    timeline: '3 weeks',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_WORKSHOP_EVENTS: WorkshopEvent[] = [
  {
    id: 'evt-001',
    artisanId: 'artisan-123',
    title: 'Beginner Wheel Pottery Workshop',
    date: new Date().toISOString(),
    startTime: '10:00',
    endTime: '13:00',
    type: 'workshop',
    description: 'Learn the basics of wheel throwing and make your first clay bowl.',
    location: 'Kumbara Studio, Bangalore',
    maxParticipants: 10,
    enrolled: 4,
    reminders: true,
    status: 'scheduled'
  }
];

export const MOCK_MATERIAL_INVENTORY: MaterialInventory[] = [
  {
    id: 'inv-001',
    artisanId: 'artisan-123',
    name: 'Red Terracotta Clay',
    category: 'Clay',
    currentStock: 250,
    unit: 'kg',
    costPerUnit: 15,
    supplier: 'Local Clay Suppliers',
    lastPurchased: new Date().toISOString(),
    lowStockThreshold: 50,
    linkedProducts: ['prod-1', 'prod-2'],
    reorderPoint: 60
  }
];

export const MOCK_ARTISAN_ANALYTICS: ArtisanAnalytics = {
  id: 'analytics-123',
  artisanId: 'artisan-123',
  period: 'month',
  totalRevenue: 45000,
  ordersCount: 85,
  averageOrderValue: 529.41,
  topProducts: [
    { productId: 'prod-1', name: 'Vedic Curd Pot', sales: 40 },
    { productId: 'prod-2', name: 'Ancient Cool Bottle', sales: 25 }
  ],
  conversionRate: 3.2,
  repeatCustomerRate: 15.5,
  lastUpdated: new Date().toISOString()
};

export const MOCK_ARTISAN_PROFILE: ArtisanProfileShowcase = {
  artisanId: 'artisan-123',
  coverImageUrl: '/images/artisan_cover.png',
  bio: 'Master potter with over 20 years of experience specializing in traditional terracotta cookware.',
  craftJourney: 'I learned the art of pottery from my grandfather when I was 10. For the past two decades, I have been preserving the traditional techniques while adapting them for modern households.',
  techniques: [
    {
      id: 'tech-1',
      name: 'Wheel Throwing',
      description: 'Traditional fast-wheel throwing using locally sourced clay.'
    },
    {
      id: 'tech-2',
      name: 'Smoke Firing',
      description: 'Ancient black pottery technique using natural smoke reduction.'
    }
  ],
  followers: 1250,
  following: 45,
  verificationStatus: 'verified',
  socialLinks: {
    instagram: 'https://instagram.com/kumbara_kala',
    website: 'https://kumbarakala.com'
  }
};
