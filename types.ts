export type ABCClass = 'A' | 'B' | 'C';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null represents root
  createdAt: string;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string; // Now links to CategoryConfig.name
  brand?: string; // Optional brand
  description?: string;
  sku: string;
  cost: number;
  price: number;
  stock: number; // New stock field
  imageUrl: string;
  supplier?: string;
  createdAt: string;
  confidence?: number;
  folderId: string | null; // null represents root
  tags: string[]; // For "Descontinuado", etc.
  abcClass?: ABCClass;
}

// Dynamic Category Configuration
export interface CategoryConfig {
  id: string;
  name: string;
  prefix: string; // For SKU generation (e.g., "FER")
  margin: number; // 0.35 for 35%
  color: string; // Tailwind class reference
  isInternal: boolean; // For "Uso Interno" logic
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

export type ViewType = 'files' | 'all-items' | 'settings' | 'categories';

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
}

export interface FilterState {
  categories: string[];
  minPrice: string;
  maxPrice: string;
  tags: string[];
  abcClasses: ABCClass[];
}