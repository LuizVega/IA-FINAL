import { create } from 'zustand';
import { Product, Folder, ViewType, AppSettings, CategoryConfig, FilterState } from './types';
import { MOCK_INVENTORY, INITIAL_CATEGORIES } from './constants';

// Initial Mock Folders
const MOCK_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Almacén Principal', parentId: null, createdAt: new Date().toISOString() },
  { id: 'f2', name: 'Sala de Ventas', parentId: null, createdAt: new Date().toISOString() },
  { id: 'f3', name: 'Estantería A', parentId: 'f1', createdAt: new Date().toISOString() },
];

interface AppState {
  inventory: Product[];
  folders: Folder[];
  categories: CategoryConfig[];
  currentFolderId: string | null;
  searchQuery: string;
  filters: FilterState;
  viewMode: 'grid' | 'list';
  currentView: ViewType;
  settings: AppSettings;
  
  // Actions
  addProduct: (product: Product) => void;
  bulkAddProducts: (products: Product[]) => void;
  addFolder: (folder: Folder) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteProduct: (id: string) => void;
  deleteFolder: (id: string) => void;
  
  // Stock Actions
  incrementStock: (id: string) => void;
  decrementStock: (id: string) => void;
  
  // Categories Actions
  addCategory: (category: CategoryConfig) => void;
  bulkAddCategories: (newCategories: CategoryConfig[]) => void;
  updateCategory: (id: string, updates: Partial<CategoryConfig>) => void;
  deleteCategory: (id: string) => void;

  setCurrentFolder: (folderId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setCurrentView: (view: ViewType) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Helpers / Computed
  getBreadcrumbs: () => Folder[];
  getFilteredInventory: () => Product[];
}

const initialFilters: FilterState = {
  categories: [],
  minPrice: '',
  maxPrice: '',
  tags: [],
  abcClasses: [],
};

export const useStore = create<AppState>((set, get) => ({
  inventory: MOCK_INVENTORY, 
  folders: MOCK_FOLDERS,
  categories: INITIAL_CATEGORIES,
  currentFolderId: null,
  searchQuery: '',
  filters: initialFilters,
  viewMode: 'grid',
  currentView: 'files',
  settings: {
    companyName: 'Mi Empresa',
    currency: 'USD',
    taxRate: 0.16
  },
  
  addProduct: (product) => set((state) => ({
    inventory: [product, ...state.inventory]
  })),

  bulkAddProducts: (products) => set((state) => ({
    inventory: [...products, ...state.inventory]
  })),

  addFolder: (folder) => set((state) => ({
    folders: [...state.folders, folder]
  })),

  updateProduct: (id, updates) => set((state) => ({
    inventory: state.inventory.map((p) => (p.id === id ? { ...p, ...updates } : p))
  })),

  incrementStock: (id) => set((state) => ({
    inventory: state.inventory.map(p => p.id === id ? { ...p, stock: p.stock + 1 } : p)
  })),

  decrementStock: (id) => set((state) => ({
    inventory: state.inventory.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock - 1) } : p)
  })),

  updateFolder: (id, updates) => set((state) => ({
    folders: state.folders.map((f) => (f.id === id ? { ...f, ...updates } : f))
  })),

  deleteProduct: (id) => set((state) => ({
    inventory: state.inventory.filter((p) => p.id !== id)
  })),

  deleteFolder: (id) => set((state) => ({
    folders: state.folders.filter((f) => f.id !== id),
    inventory: state.inventory.map(p => p.folderId === id ? { ...p, folderId: null } : p)
  })),

  // Category Actions
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category]
  })),

  bulkAddCategories: (newCategories) => set((state) => ({
    categories: [...state.categories, ...newCategories]
  })),

  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),

  setCurrentFolder: (folderId) => set({ currentFolderId: folderId, currentView: 'files' }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  resetFilters: () => set({ filters: initialFilters }),
  
  setViewMode: (mode) => set({ viewMode: mode }),

  setCurrentView: (view) => set({ currentView: view, currentFolderId: null }),

  updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  getBreadcrumbs: () => {
    const { folders, currentFolderId } = get();
    const breadcrumbs: Folder[] = [];
    let currentId = currentFolderId;

    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return breadcrumbs;
  },

  getFilteredInventory: () => {
     const { inventory, searchQuery, filters } = get();
     return inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (!matchesSearch) return false;

        if (filters.categories.length > 0 && !filters.categories.includes(item.category)) return false;
        
        if (filters.tags.length > 0 && (!item.tags || !filters.tags.some(t => item.tags.includes(t)))) return false;

        if (filters.abcClasses.length > 0 && (!item.abcClass || !filters.abcClasses.includes(item.abcClass))) return false;

        const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
        const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
        if (item.price < min || item.price > max) return false;

        return true;
     });
  }
}));