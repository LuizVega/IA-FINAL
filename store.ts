import { create } from 'zustand';
import { Product, Folder, ViewType, AppSettings, CategoryConfig, FilterState } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { DEFAULT_PRODUCT_IMAGE } from './constants';

// Helper to map DB snake_case to Frontend camelCase
const mapProductFromDB = (p: any): Product => ({
    ...p,
    imageUrl: p.image_url || DEFAULT_PRODUCT_IMAGE, // Ensure fallback on fetch
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
  isDemoMode: boolean;
  isAuthModalOpen: boolean;
  
  // Tour State
  tourStep: number;
  
  // Global Modal State
  isAddProductModalOpen: boolean;
  isImporterOpen: boolean;
  isDetailsOpen: boolean;
  
  // UI State shared for Tour
  isCreateMenuOpen: boolean;
  
  editingProduct: Product | null;
  selectedProduct: Product | null;

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
  setDemoMode: (isDemo: boolean) => void;
  setAuthModalOpen: (isOpen: boolean) => void;
  
  // Tour Action
  setTourStep: (step: number) => void;
  
  // Modal Actions
  setAddProductModalOpen: (isOpen: boolean) => void;
  setIsImporterOpen: (isOpen: boolean) => void;
  setIsDetailsOpen: (isOpen: boolean) => void;
  setCreateMenuOpen: (isOpen: boolean) => void;
  
  setEditingProduct: (product: Product | null) => void;
  setSelectedProduct: (product: Product | null) => void;

  fetchInitialData: () => Promise<void>;
  generateDemoData: () => void;

  addProduct: (product: Product) => Promise<void>;
  bulkAddProducts: (products: Product[]) => Promise<void>;
  addFolder: (folder: Folder) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearInventory: () => Promise<void>; 
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
  claimOffer: () => Promise<void>;
  
  // Helpers / Computed
  getBreadcrumbs: () => Folder[];
  getFilteredInventory: () => Product[];
  checkAuth: () => boolean; 
}

const initialFilters: FilterState = {
  categories: [],
  minPrice: '',
  maxPrice: '',
  tags: [],
};

export const useStore = create<AppState>((set, get) => ({
  session: null,
  isDemoMode: false,
  isAuthModalOpen: false,
  
  tourStep: 0,
  
  // Modals
  isAddProductModalOpen: false,
  isImporterOpen: false,
  isDetailsOpen: false,
  
  isCreateMenuOpen: false,

  editingProduct: null,
  selectedProduct: null,

  inventory: [], 
  folders: [],
  categories: [],
  currentFolderId: null,
  searchQuery: '',
  filters: initialFilters,
  viewMode: 'grid',
  currentView: 'dashboard', 
  settings: {
    companyName: 'MyMorez Business',
    currency: 'USD',
    taxRate: 0.16,
    hasClaimedOffer: false,
    plan: 'starter',
    stagnantDaysThreshold: 90 // Default to 90 days
  },
  isLoading: false,

  setSession: (session) => {
      set({ session });
      if (!session) {
          set({ inventory: [], folders: [], categories: [] });
      }
  },
  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
  
  setTourStep: (step) => set({ tourStep: step }),
  
  setAddProductModalOpen: (isOpen) => set({ isAddProductModalOpen: isOpen }),
  setIsImporterOpen: (isOpen) => set({ isImporterOpen: isOpen }),
  setIsDetailsOpen: (isOpen) => set({ isDetailsOpen: isOpen }),
  setCreateMenuOpen: (isOpen) => set({ isCreateMenuOpen: isOpen }),
  
  setEditingProduct: (product) => set({ editingProduct: product }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  checkAuth: () => {
      const { session, isDemoMode } = get();
      if (isDemoMode) return true;
      if (!session && isSupabaseConfigured) {
          set({ isAuthModalOpen: true });
          return false;
      }
      return true;
  },

  fetchInitialData: async () => {
    set({ isLoading: true });
    const { session, isDemoMode } = get();
    
    if (!isSupabaseConfigured || (!session && !isDemoMode)) {
       if (!isDemoMode) set({ inventory: [], folders: [], categories: [] });
       set({ isLoading: false });
       return;
    }

    if (isDemoMode) {
        set({ isLoading: false });
        return;
    }

    if (session) {
        const [productsRes, foldersRes, categoriesRes, offersRes] = await Promise.all([
            supabase.from('products').select('*').eq('user_id', session.user.id),
            supabase.from('folders').select('*').eq('user_id', session.user.id),
            supabase.from('categories').select('*').eq('user_id', session.user.id),
            supabase.from('claimed_offers').select('*').eq('user_id', session.user.id).eq('offer_type', 'growth_3_months_free')
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
        if (offersRes.data && offersRes.data.length > 0) {
            set((state) => ({ 
                settings: { 
                    ...state.settings, 
                    hasClaimedOffer: true,
                    plan: 'growth' 
                } 
            }));
        }
    }
    set({ isLoading: false });
  },
  
  generateDemoData: () => {
      // Create some fake data for the demo
      const demoCategories: CategoryConfig[] = [
          { id: '1', name: 'Electrónica', prefix: 'ELC', margin: 0.35, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', isInternal: false },
          { id: '2', name: 'Hogar', prefix: 'HOG', margin: 0.40, color: 'bg-green-500/10 text-green-400 border-green-500/20', isInternal: false },
          { id: '3', name: 'Herramientas', prefix: 'HER', margin: 0.30, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', isInternal: false }
      ];

      const demoProducts: Product[] = [
          {
              id: '101', name: 'Taladro Percutor Inalámbrico 20V', category: 'Herramientas', sku: 'HER-TAL-001',
              cost: 85.00, price: 129.90, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=200',
              description: 'Taladro profesional con batería de litio.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
              supplierWarranty: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), confidence: 1, folderId: null, tags: []
          },
          {
              id: '102', name: 'Smart TV 55" 4K UHD', category: 'Electrónica', sku: 'ELC-TV-042',
              cost: 320.00, price: 499.00, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=200',
              description: 'Televisor inteligente con HDR y Dolby Vision.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
              supplierWarranty: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(), confidence: 1, folderId: null, tags: ['Oferta']
          },
          {
              id: '103', name: 'Juego de Sábanas King Size', category: 'Hogar', sku: 'HOG-SAB-010',
              cost: 25.00, price: 55.00, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1522771753035-4a53c6288953?auto=format&fit=crop&q=80&w=200',
              description: 'Algodón egipcio 400 hilos.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
              supplierWarranty: undefined, confidence: 1, folderId: null, tags: []
          },
          {
              id: '104', name: 'Audífonos Bluetooth Noise Cancelling', category: 'Electrónica', sku: 'ELC-AUD-099',
              cost: 60.00, price: 110.00, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200',
              description: 'Sonido de alta fidelidad.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
              supplierWarranty: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), // Expired warranty scenario
              confidence: 1, folderId: null, tags: []
          }
      ];

      set({ 
          categories: demoCategories, 
          inventory: demoProducts,
          settings: { ...get().settings, plan: 'growth', hasClaimedOffer: true }
      });
  },

  addProduct: async (product) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    const productWithImage = {
        ...product,
        imageUrl: product.imageUrl || DEFAULT_PRODUCT_IMAGE
    };

    set((state) => ({ inventory: [productWithImage, ...state.inventory] }));

    if (session && isSupabaseConfigured) {
        const dbProduct = {
            id: productWithImage.id,
            user_id: session.user.id,
            name: productWithImage.name,
            category: productWithImage.category,
            brand: productWithImage.brand,
            description: productWithImage.description,
            sku: productWithImage.sku,
            cost: productWithImage.cost,
            price: productWithImage.price,
            stock: productWithImage.stock,
            image_url: productWithImage.imageUrl,
            supplier: productWithImage.supplier,
            entry_date: productWithImage.entryDate,
            supplier_warranty: productWithImage.supplierWarranty,
            confidence: productWithImage.confidence,
            folder_id: productWithImage.folderId,
            tags: productWithImage.tags
        };
        await supabase.from('products').insert(dbProduct);
    }
  },

  bulkAddProducts: async (products) => {
    if (!get().checkAuth()) return;
    const { session } = get();
    
    const sanitizedProducts = products.map(p => ({
        ...p,
        imageUrl: (p.imageUrl && p.imageUrl.length > 5) ? p.imageUrl : DEFAULT_PRODUCT_IMAGE
    }));

    set((state) => ({ inventory: [...sanitizedProducts, ...state.inventory] }));

    if (session && isSupabaseConfigured) {
        const dbProducts = sanitizedProducts.map(p => ({
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
        await supabase.from('products').insert(dbProducts);
    }
  },

  addFolder: async (folder) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    set((state) => ({ folders: [...state.folders, folder] }));

    if (session && isSupabaseConfigured) {
        const dbFolder = {
            id: folder.id,
            user_id: session.user.id,
            name: folder.name,
            parent_id: folder.parentId
        };
        await supabase.from('folders').insert(dbFolder);
    }
  },

  updateProduct: async (id, updates) => {
    if (!get().checkAuth()) return;
    const { session } = get();
    
    set((state) => ({
        inventory: state.inventory.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));

    if (session && isSupabaseConfigured) {
        const dbUpdates: any = { ...updates };
        if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
        if (updates.entryDate) dbUpdates.entry_date = updates.entryDate;
        if (updates.supplierWarranty) dbUpdates.supplier_warranty = updates.supplierWarranty;
        if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId; 
        await supabase.from('products').update(dbUpdates).eq('id', id);
    }
  },

  incrementStock: async (id) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    const product = get().inventory.find(p => p.id === id);
    if (product) {
        const newStock = product.stock + 1;
        set((state) => ({
            inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p)
        }));
        
        if (session && isSupabaseConfigured) {
            await supabase.from('products').update({ stock: newStock }).eq('id', id);
        }
    }
  },

  decrementStock: async (id) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    const product = get().inventory.find(p => p.id === id);
    if (product) {
        const newStock = Math.max(0, product.stock - 1);
        set((state) => ({
            inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p)
        }));

        if (session && isSupabaseConfigured) {
            await supabase.from('products').update({ stock: newStock }).eq('id', id);
        }
    }
  },

  updateFolder: async (id, updates) => {
     if (!get().checkAuth()) return;
     const { session } = get();

     set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? { ...f, ...updates } : f))
      }));
      
      if (session && isSupabaseConfigured) {
          const dbUpdates: any = { ...updates };
          if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
          await supabase.from('folders').update(dbUpdates).eq('id', id);
      }
  },

  deleteProduct: async (id) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    set((state) => ({
        inventory: state.inventory.filter((p) => p.id !== id)
    }));
    
    if (session && isSupabaseConfigured) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) console.error("Error deleting product from DB", error);
    }
  },

  clearInventory: async () => {
    if (!get().checkAuth()) return;
    const { session } = get();

    set({ inventory: [] });

    if (isSupabaseConfigured && session) {
        const { error } = await supabase.from('products').delete().eq('user_id', session.user.id);
        if (error) console.error("Error clearing inventory from DB:", error);
    }
  },

  deleteFolder: async (id) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    set((state) => ({
        folders: state.folders.filter((f) => f.id !== id),
        inventory: state.inventory.map(p => p.folderId === id ? { ...p, folderId: null } : p)
    }));
    
    if (session && isSupabaseConfigured) {
        await supabase.from('products').update({ folder_id: null }).eq('folder_id', id);
        await supabase.from('folders').delete().eq('id', id);
    }
  },

  moveProduct: async (productId, targetFolderId) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    set((state) => ({
        inventory: state.inventory.map(p => p.id === productId ? { ...p, folderId: targetFolderId } : p)
    }));
    
    if (session && isSupabaseConfigured) {
        await supabase.from('products').update({ folder_id: targetFolderId }).eq('id', productId);
    }
  },

  moveFolder: async (folderId, targetFolderId) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    set((state) => ({
        folders: state.folders.map(f => f.id === folderId ? { ...f, parentId: targetFolderId } : f)
    }));

    if (session && isSupabaseConfigured) {
        await supabase.from('folders').update({ parent_id: targetFolderId }).eq('id', folderId);
    }
  },

  addCategory: async (category) => {
     if (!get().checkAuth()) return;
     const { session } = get();

     set((state) => ({ categories: [...state.categories, category] }));

     if (session && isSupabaseConfigured) {
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
     }
  },

  bulkAddCategories: async (newCategories) => {
     if (!get().checkAuth()) return;
     const { session } = get();

     set((state) => ({ categories: [...state.categories, ...newCategories] }));

     if (session && isSupabaseConfigured) {
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
     }
  },

  updateCategory: async (id, updates) => {
     if (!get().checkAuth()) return;
     const { session } = get();

     set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
     }));
     
     if (session && isSupabaseConfigured) {
         const dbUpdates: any = { ...updates };
         if (updates.isInternal !== undefined) dbUpdates.is_internal = updates.isInternal;
         await supabase.from('categories').update(dbUpdates).eq('id', id);
     }
  },

  deleteCategory: async (id) => {
    if (!get().checkAuth()) return;
    const { session } = get();

    set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
    }));

    if (session && isSupabaseConfigured) {
        await supabase.from('categories').delete().eq('id', id);
    }
  },

  setCurrentFolder: (folderId) => set({ currentFolderId: folderId, currentView: 'files' }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  resetFilters: () => set({ filters: initialFilters }),
  
  setViewMode: (mode) => set({ viewMode: mode }),

  setCurrentView: (view) => set({ currentView: view, currentFolderId: null }),

  updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  claimOffer: async () => {
    if (!get().checkAuth()) return; 
    const { session } = get();
    
    set((state) => ({ 
        settings: { 
            ...state.settings, 
            hasClaimedOffer: true,
            plan: 'growth'
        } 
    }));
    
    if (session && isSupabaseConfigured) {
        try {
            await supabase.from('claimed_offers').insert({
                user_id: session.user.id,
                email: session.user.email,
                offer_type: 'growth_3_months_free',
                claimed_at: new Date().toISOString()
            });
        } catch (err) {
            console.error("Error saving offer claim:", err);
        }
    }
    
    alert("¡Felicidades! Tu oferta de 3 meses gratis ha sido registrada.");
  },

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