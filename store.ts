
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
  isWhatsAppModalOpen: boolean; // New
  
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

  // Dashboard Action State (New)
  pendingAction: 'warranty' | 'stagnant' | null;
  
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
  setWhatsAppModalOpen: (isOpen: boolean) => void; // New
  
  setEditingProduct: (product: Product | null) => void;
  setSelectedProduct: (product: Product | null) => void;

  setPendingAction: (action: 'warranty' | 'stagnant' | null) => void;

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
  isWhatsAppModalOpen: false,
  
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
    companyName: 'My Brand',
    currency: 'USD',
    taxRate: 0.16,
    hasClaimedOffer: false,
    plan: 'starter',
    stagnantDaysThreshold: 90,
    whatsappEnabled: false
  },
  isLoading: false,

  pendingAction: null,

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
  setWhatsAppModalOpen: (isOpen) => set({ isWhatsAppModalOpen: isOpen }),
  
  setEditingProduct: (product) => set({ editingProduct: product }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  setPendingAction: (action) => set({ pendingAction: action }),

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
      // DATA ORIENTADA AL "SOCIAL SELLER" (Merch, Ropa, Accesorios)
      const demoCategories: CategoryConfig[] = [
          { id: '1', name: 'Ropa', prefix: 'APP', margin: 0.50, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', isInternal: false },
          { id: '2', name: 'Accesorios', prefix: 'ACC', margin: 0.60, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', isInternal: false },
          { id: '3', name: 'Colección Limitada', prefix: 'LTD', margin: 0.80, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', isInternal: false }
      ];

      const demoProducts: Product[] = [
          {
              id: '101', name: 'Polera Oversize "Eras Tour" - Negro', category: 'Ropa', sku: 'APP-TS-001',
              cost: 15.00, price: 35.00, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=200',
              description: 'Polera de algodón reactivo con diseño en espalda. Tallas S, M, L.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
              supplierWarranty: undefined, confidence: 1, folderId: null, tags: ['Trending', 'Nuevo']
          },
          {
              id: '102', name: 'Tote Bag "Harry\'s House"', category: 'Accesorios', sku: 'ACC-TOT-042',
              cost: 5.00, price: 15.00, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?auto=format&fit=crop&q=80&w=200',
              description: 'Bolso de tela ecológico resistente. Ideal para la u.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
              supplierWarranty: undefined, confidence: 1, folderId: null, tags: ['Básico']
          },
          {
              id: '103', name: 'Case iPhone 14 "Aesthetic Clouds"', category: 'Accesorios', sku: 'ACC-PH-010',
              cost: 3.00, price: 12.00, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=200',
              description: 'Funda protectora de silicona suave con diseño de nubes.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
              supplierWarranty: undefined, confidence: 1, folderId: null, tags: ['Últimas Unidades']
          },
          {
              id: '104', name: 'Gorra Bordada "Stranger Things"', category: 'Colección Limitada', sku: 'LTD-CAP-099',
              cost: 8.00, price: 25.00, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=200',
              description: 'Gorra estilo camionero con logo bordado en 3D. Edición especial.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
              supplierWarranty: undefined, 
              confidence: 1, folderId: null, tags: ['Exclusivo']
          }
      ];

      set((state) => ({ 
          categories: [
              ...state.categories,
              ...demoCategories.filter(d => !state.categories.some(c => c.name === d.name))
          ],
          inventory: [...state.inventory, ...demoProducts],
          settings: { ...state.settings, plan: 'growth', hasClaimedOffer: true }
      }));
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

  setCurrentFolder: (folderId) => set({ currentFolderId: folderId, currentView: 'files', pendingAction: null }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  resetFilters: () => set({ filters: initialFilters }),
  
  setViewMode: (mode) => set({ viewMode: mode }),

  setCurrentView: (view) => set({ currentView: view, currentFolderId: null, pendingAction: null }),

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
