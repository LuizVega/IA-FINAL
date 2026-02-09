
import { create } from 'zustand';
import { Product, Folder, ViewType, AppSettings, CategoryConfig, FilterState } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

// Helper to map DB snake_case to Frontend camelCase
const mapProductFromDB = (p: any): Product => ({
    ...p,
    imageUrl: p.image_url,
    entryDate: p.entry_date,
    supplierWarranty: p.supplier_warranty,
    folderId: p.folder_id,
    createdAt: p.created_at
});

const mapFolderFromDB = (f: any): Folder => ({
    ...f,
    parentId: f.parent_id,
    createdAt: f.created_at
});

const mapCategoryFromDB = (c: any): CategoryConfig => ({
    ...c,
    isInternal: c.is_internal,
});

interface AppState {
  session: Session | null;
  isAuthModalOpen: boolean;

  inventory: Product[];
  folders: Folder[];
  categories: CategoryConfig[];
  currentFolderId: string | null;
  searchQuery: string;
  filters: FilterState;
  viewMode: 'grid' | 'list';
  currentView: ViewType;
  settings: AppSettings;
  isLoading: boolean;
  
  // Actions
  setSession: (session: Session | null) => void;
  setAuthModalOpen: (isOpen: boolean) => void;
  fetchInitialData: () => Promise<void>;
  
  addProduct: (product: Product) => Promise<void>;
  bulkAddProducts: (products: Product[]) => Promise<void>;
  addFolder: (folder: Folder) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  
  // Move Actions (Organizar)
  moveProduct: (productId: string, targetFolderId: string | null) => Promise<void>;
  moveFolder: (folderId: string, targetFolderId: string | null) => Promise<void>;
  
  // Stock Actions
  incrementStock: (id: string) => Promise<void>;
  decrementStock: (id: string) => Promise<void>;
  
  // Categories Actions
  addCategory: (category: CategoryConfig) => Promise<void>;
  bulkAddCategories: (newCategories: CategoryConfig[]) => Promise<void>;
  updateCategory: (id: string, updates: Partial<CategoryConfig>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

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
  checkAuth: () => boolean; // Helper to check auth inside components
}

const initialFilters: FilterState = {
  categories: [],
  minPrice: '',
  maxPrice: '',
  tags: [],
};

export const useStore = create<AppState>((set, get) => ({
  session: null,
  isAuthModalOpen: false,
  inventory: [], 
  folders: [],
  categories: [],
  currentFolderId: null,
  searchQuery: '',
  filters: initialFilters,
  viewMode: 'grid',
  currentView: 'dashboard', 
  settings: {
    companyName: 'Mi Empresa',
    currency: 'USD',
    taxRate: 0.16
  },
  isLoading: false,

  setSession: (session) => {
      set({ session });
      if (!session) {
          // Clear data on logout
          set({ inventory: [], folders: [], categories: [] });
      }
  },
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),

  checkAuth: () => {
      const { session } = get();
      if (!session && isSupabaseConfigured) {
          set({ isAuthModalOpen: true });
          return false;
      }
      return true;
  },

  fetchInitialData: async () => {
    set({ isLoading: true });
    const { session } = get();
    
    if (!isSupabaseConfigured || !session) {
      set({ isLoading: false, inventory: [], folders: [], categories: [] });
      return;
    }

    // Parallel Fetch
    const [productsRes, foldersRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', session.user.id),
        supabase.from('folders').select('*').eq('user_id', session.user.id),
        supabase.from('categories').select('*').eq('user_id', session.user.id)
    ]);

    if (productsRes.data) {
        set({ inventory: productsRes.data.map(mapProductFromDB) });
    }
    if (foldersRes.data) {
        set({ folders: foldersRes.data.map(mapFolderFromDB) });
    }
    if (categoriesRes.data) {
        set({ categories: categoriesRes.data.map(mapCategoryFromDB) });
    }
    set({ isLoading: false });
  },
  
  addProduct: async (product) => {
    if (!get().checkAuth()) return;
    
    const { session } = get();
    if (!session) return; // Guard for TS, checkAuth handles UI

    // Prepare for DB (snake_case)
    const dbProduct = {
        id: product.id,
        user_id: session.user.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        description: product.description,
        sku: product.sku,
        cost: product.cost,
        price: product.price,
        stock: product.stock,
        image_url: product.imageUrl,
        supplier: product.supplier,
        entry_date: product.entryDate,
        supplier_warranty: product.supplierWarranty,
        confidence: product.confidence,
        folder_id: product.folderId,
        tags: product.tags
    };

    const { error } = await supabase.from('products').insert(dbProduct);
    if (!error) {
        set((state) => ({ inventory: [product, ...state.inventory] }));
    } else {
        console.error("Error adding product:", error);
    }
  },

  bulkAddProducts: async (products) => {
    if (!get().checkAuth()) return;
    const { session } = get();
    if (!session) return;
    
    const dbProducts = products.map(p => ({
        id: p.id,
        user_id: session.user.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        description: p.description,
        sku: p.sku,
        cost: p.cost,
        price: p.price,
        stock: p.stock,
        image_url: p.imageUrl,
        supplier: p.supplier,
        entry_date: p.entryDate,
        supplier_warranty: p.supplierWarranty,
        confidence: p.confidence,
        folder_id: p.folderId,
        tags: p.tags
    }));

    const { error } = await supabase.from('products').insert(dbProducts);
    if (!error) {
        set((state) => ({ inventory: [...products, ...state.inventory] }));
    }
  },

  addFolder: async (folder) => {
    if (!get().checkAuth()) return;
    const { session } = get();
    if (!session) return;

    const dbFolder = {
        id: folder.id,
        user_id: session.user.id,
        name: folder.name,
        parent_id: folder.parentId
    };

    const { error } = await supabase.from('folders').insert(dbFolder);
    if (!error) {
        set((state) => ({ folders: [...state.folders, folder] }));
    }
  },

  updateProduct: async (id, updates) => {
    if (!get().checkAuth()) return;
    
    // Optimistic update
    set((state) => ({
        inventory: state.inventory.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));

    const dbUpdates: any = { ...updates };
    if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
    if (updates.entryDate) dbUpdates.entry_date = updates.entryDate;
    if (updates.supplierWarranty) dbUpdates.supplier_warranty = updates.supplierWarranty;
    if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId; // check undefined for nulls

    await supabase.from('products').update(dbUpdates).eq('id', id);
  },

  incrementStock: async (id) => {
    if (!get().checkAuth()) return;

    const product = get().inventory.find(p => p.id === id);
    if (product) {
        const newStock = product.stock + 1;
        set((state) => ({
            inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p)
        }));
        
        await supabase.from('products').update({ stock: newStock }).eq('id', id);
    }
  },

  decrementStock: async (id) => {
    if (!get().checkAuth()) return;

    const product = get().inventory.find(p => p.id === id);
    if (product) {
        const newStock = Math.max(0, product.stock - 1);
        set((state) => ({
            inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p)
        }));

        await supabase.from('products').update({ stock: newStock }).eq('id', id);
    }
  },

  updateFolder: async (id, updates) => {
     if (!get().checkAuth()) return;

     set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? { ...f, ...updates } : f))
      }));
      
      const dbUpdates: any = { ...updates };
      if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
      
      await supabase.from('folders').update(dbUpdates).eq('id', id);
  },

  deleteProduct: async (id) => {
    if (!get().checkAuth()) return;

    set((state) => ({
        inventory: state.inventory.filter((p) => p.id !== id)
    }));
    
    await supabase.from('products').delete().eq('id', id);
  },

  deleteFolder: async (id) => {
    if (!get().checkAuth()) return;

    set((state) => ({
        folders: state.folders.filter((f) => f.id !== id),
        inventory: state.inventory.map(p => p.folderId === id ? { ...p, folderId: null } : p)
    }));
    
    await supabase.from('products').update({ folder_id: null }).eq('folder_id', id);
    await supabase.from('folders').delete().eq('id', id);
  },

  moveProduct: async (productId, targetFolderId) => {
    if (!get().checkAuth()) return;

    set((state) => ({
        inventory: state.inventory.map(p => p.id === productId ? { ...p, folderId: targetFolderId } : p)
    }));
    
    await supabase.from('products').update({ folder_id: targetFolderId }).eq('id', productId);
  },

  moveFolder: async (folderId, targetFolderId) => {
    if (!get().checkAuth()) return;

    set((state) => ({
        folders: state.folders.map(f => f.id === folderId ? { ...f, parentId: targetFolderId } : f)
    }));

    await supabase.from('folders').update({ parent_id: targetFolderId }).eq('id', folderId);
  },

  // Category Actions
  addCategory: async (category) => {
     if (!get().checkAuth()) return;
     const { session } = get();
     if (!session) return;

     set((state) => ({ categories: [...state.categories, category] }));

     const dbCategory = {
         id: category.id,
         user_id: session.user.id,
         name: category.name,
         prefix: category.prefix,
         margin: category.margin,
         color: category.color,
         is_internal: category.isInternal
     };
     
     await supabase.from('categories').insert(dbCategory);
  },

  bulkAddCategories: async (newCategories) => {
     if (!get().checkAuth()) return;
     const { session } = get();
     if (!session) return;

     set((state) => ({ categories: [...state.categories, ...newCategories] }));

     const dbCategories = newCategories.map(c => ({
         id: c.id,
         user_id: session.user.id,
         name: c.name,
         prefix: c.prefix,
         margin: c.margin,
         color: c.color,
         is_internal: c.isInternal
     }));
     
     await supabase.from('categories').insert(dbCategories);
  },

  updateCategory: async (id, updates) => {
     if (!get().checkAuth()) return;

     set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
     }));
     
     const dbUpdates: any = { ...updates };
     if (updates.isInternal !== undefined) dbUpdates.is_internal = updates.isInternal;
     
     await supabase.from('categories').update(dbUpdates).eq('id', id);
  },

  deleteCategory: async (id) => {
    if (!get().checkAuth()) return;

    set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
    }));

    await supabase.from('categories').delete().eq('id', id);
  },

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

        const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
        const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
        if (item.price < min || item.price > max) return false;

        return true;
     });
  }
}));
