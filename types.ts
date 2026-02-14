
export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null represents root
  createdAt: string;
  color?: string;
  user_id?: string; // Supabase field
}

export interface Product {
  id: string;
  name: string;
  category: string; 
  brand?: string; 
  description?: string;
  sku: string;
  cost: number;
  price: number;
  stock: number; 
  imageUrl: string;
  supplier?: string;
  createdAt: string; 
  entryDate: string; // Mapped from entry_date
  supplierWarranty?: string; // Mapped from supplier_warranty
  confidence?: number;
  folderId: string | null; // Mapped from folder_id
  tags: string[]; 
  user_id?: string; // Supabase field
}

// Dynamic Category Configuration
export interface CategoryConfig {
  id: string;
  name: string;
  prefix: string; 
  margin: number; 
  color: string; 
  isInternal: boolean; 
  user_id?: string;
}

export type Category = string; 

export interface AIAnalysisResult {
  name: string;
  category: string;
  description: string;
  confidence: number;
  suggestedTags: string[];
  estimatedMarketPrice?: number;
}

export interface MarginRules {
  [key: string]: number;
}

export type ViewType = 'dashboard' | 'files' | 'all-items' | 'settings' | 'categories' | 'profile' | 'pricing' | 'financial-health' | 'orders';

export type PlanLevel = 'starter' | 'growth' | 'business';

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: 'background' | 'folder' | 'item';
  targetId?: string;
}

export interface AppSettings {
  companyName: string;
  currency: string;
  taxRate: number;
  hasClaimedOffer: boolean; 
  plan: PlanLevel;
  stagnantDaysThreshold: number;
  whatsappEnabled: boolean;
  whatsappNumber?: string;
  storeSlug?: string; // Nuevo: URL personalizada
  whatsappTemplate?: string; // Nuevo: Plantilla de mensaje
}

export interface FilterState {
  categories: string[];
  minPrice: string;
  maxPrice: string;
  tags: string[];
}

// --- ORDER SYSTEM TYPES ---

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string; // Seller ID
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  status: OrderStatus;
  items: {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  created_at: string;
}

// Extend global window for HTML interaction
declare global {
    interface Window {
        triggerAuth: (mode: string) => void;
        triggerDemo: () => void;
    }
}
