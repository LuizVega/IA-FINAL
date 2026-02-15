
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, Folder, ViewType, AppSettings, CategoryConfig, FilterState, Order, CartItem, OrderStatus } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { DEFAULT_PRODUCT_IMAGE } from './constants';

// Helper to map DB snake_case to Frontend camelCase
const mapProductFromDB = (p: any): Product => ({
    ...p,
    imageUrl: p.image_url || DEFAULT_PRODUCT_IMAGE, 
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

const mapOrderFromDB = (o: any): Order => ({
    ...o,
});

const CONFIG_PRODUCT_NAME = '__STORE_CONFIG__';

interface AppState {
  session: Session | null;
  isDemoMode: boolean;
  isAuthModalOpen: boolean;
  
  // App Mode
  appMode: 'seller' | 'buyer';
  shopOwnerId: string | null; // If in buyer mode
  
  // Tour State
  tourStep: number;
  
  // Global Modal State
  isAddProductModalOpen: boolean;
  isImporterOpen: boolean;
  isDetailsOpen: boolean;
  isWhatsAppModalOpen: boolean;
  
  // UI State shared for Tour
  isCreateMenuOpen: boolean;
  
  editingProduct: Product | null;
  selectedProduct: Product | null;

  inventory: Product[];
  folders: Folder[];
  categories: CategoryConfig[];
  orders: Order[]; // New: Orders list
  
  // Cart State (Buyer Mode)
  cart: CartItem[];
  isCartOpen: boolean;

  currentFolderId: string | null;
  searchQuery: string;
  filters: FilterState;
  viewMode: 'grid' | 'list';
  currentView: ViewType;
  settings: AppSettings;
  isLoading: boolean;

  // Dashboard Action State
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
  setWhatsAppModalOpen: (isOpen: boolean) => void;
  setIsCartOpen: (isOpen: boolean) => void; // New
  
  setEditingProduct: (product: Product | null) => void;
  setSelectedProduct: (product: Product | null) => void;

  setPendingAction: (action: 'warranty' | 'stagnant' | null) => void;

  fetchInitialData: () => Promise<void>;
  fetchPublicStore: (identifier: string) => Promise<void>; 
  generateDemoData: () => void;

  addProduct: (product: Product) => Promise<void>;
  bulkAddProducts: (products: Product[]) => Promise<void>;
  addFolder: (folder: Folder) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearInventory: () => Promise<void>; 
  deleteFolder: (id: string) => Promise<void>;
  
  // Move Actions
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

  // Cart Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  createOrder: (customerInfo: {name?: string, phone?: string}) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;

  setCurrentFolder: (folderId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setCurrentView: (view: ViewType) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  saveProfileSettings: (settings: Partial<AppSettings>) => Promise<void>; // New explicit async action
  claimOffer: () => Promise<void>;
  
  // Helpers
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

const DEFAULT_WA_TEMPLATE = "Hola *{{TIENDA}}*, me interesa:\n\n{{PEDIDO}}\n\n💰 Total: {{TOTAL}}\n👤 Mis datos: {{CLIENTE}}";

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: null,
      isDemoMode: false,
      isAuthModalOpen: false,
      appMode: 'seller',
      shopOwnerId: null,
      
      tourStep: 0,
      
      isAddProductModalOpen: false,
      isImporterOpen: false,
      isDetailsOpen: false,
      isWhatsAppModalOpen: false,
      isCartOpen: false,
      
      isCreateMenuOpen: false,

      editingProduct: null,
      selectedProduct: null,

      inventory: [], 
      folders: [],
      categories: [],
      orders: [],
      
      cart: [],

      currentFolderId: null,
      searchQuery: '',
      filters: initialFilters,
      viewMode: 'grid',
      currentView: 'dashboard', 
      settings: {
        companyName: 'Mi Tienda',
        currency: 'USD',
        taxRate: 0.16,
        hasClaimedOffer: false,
        plan: 'starter',
        stagnantDaysThreshold: 90,
        whatsappEnabled: false,
        whatsappTemplate: DEFAULT_WA_TEMPLATE
      },
      isLoading: false,

      pendingAction: null,

      setSession: (session) => {
          set({ session });
          if (!session && get().appMode === 'seller') {
              set({ inventory: [], folders: [], categories: [], orders: [] });
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
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      
      setEditingProduct: (product) => set({ editingProduct: product }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),

      setPendingAction: (action) => set({ pendingAction: action }),

      checkAuth: () => {
          const { session, isDemoMode, appMode } = get();
          if (appMode === 'buyer') return false; 
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
        
        if (get().appMode === 'buyer') {
            set({ isLoading: false });
            return; 
        }

        if (!isSupabaseConfigured || (!session && !isDemoMode)) {
           if (!isDemoMode) set({ inventory: [], folders: [], categories: [], orders: [] });
           set({ isLoading: false });
           return;
        }

        if (isDemoMode) {
            set({ isLoading: false });
            return;
        }

        if (session) {
            const [productsRes, foldersRes, categoriesRes, offersRes, ordersRes] = await Promise.all([
                supabase.from('products').select('*').eq('user_id', session.user.id),
                supabase.from('folders').select('*').eq('user_id', session.user.id),
                supabase.from('categories').select('*').eq('user_id', session.user.id),
                supabase.from('claimed_offers').select('*').eq('user_id', session.user.id).eq('offer_type', 'growth_3_months_free'),
                supabase.from('orders').select('*').eq('user_id', session.user.id),
            ]);

            let loadedInventory: Product[] = [];
            let configProduct: Product | undefined;

            if (productsRes.data) {
                const allProducts = productsRes.data.map(mapProductFromDB);
                // Separate real products from config
                loadedInventory = allProducts.filter(p => p.name !== CONFIG_PRODUCT_NAME);
                configProduct = allProducts.find(p => p.name === CONFIG_PRODUCT_NAME);
                set({ inventory: loadedInventory });
            }
            if (foldersRes.data) {
                set({ folders: foldersRes.data.map(mapFolderFromDB) });
            }
            if (categoriesRes.data) {
                set({ categories: categoriesRes.data.map(mapCategoryFromDB) });
            }
            if (offersRes.data && offersRes.data.length > 0) {
                set((state) => ({ 
                    settings: { ...state.settings, hasClaimedOffer: true, plan: 'growth' } 
                }));
            }
            if (ordersRes.data) {
                set({ orders: ordersRes.data.map(mapOrderFromDB) });
            }

            // Strategy: Try loading from Profiles table first, fallback to Config Product
            let loadedSettings: Partial<AppSettings> = {};
            
            // 1. Try Profiles Table
            try {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profile) {
                    loadedSettings = {
                        companyName: profile.company_name,
                        whatsappNumber: profile.whatsapp_number,
                        whatsappEnabled: !!profile.whatsapp_number,
                        whatsappTemplate: profile.whatsapp_template
                    };
                }
            } catch (e) {
                console.log('Profile table fetch failed, trying fallback...');
            }

            // 2. If no profile or missing data, check Config Product
            if (!loadedSettings.whatsappNumber && configProduct && configProduct.description) {
                try {
                    const fallbackConfig = JSON.parse(configProduct.description);
                    loadedSettings = { ...loadedSettings, ...fallbackConfig };
                } catch(e) {}
            }

            set((state) => ({
                settings: {
                    ...state.settings,
                    ...loadedSettings,
                    // Ensure whatsappEnabled is true if we found a number
                    whatsappEnabled: !!loadedSettings.whatsappNumber || state.settings.whatsappEnabled
                }
            }));
        }
        set({ isLoading: false });
      },

      fetchPublicStore: async (identifier: string) => {
          // Clear previous state to avoid confusion
          set({ isLoading: true, appMode: 'buyer', inventory: [], categories: [] });
          
          if (!isSupabaseConfigured) {
              get().generateDemoData();
              set({ 
                  settings: { ...get().settings, companyName: 'Tienda Demo', whatsappEnabled: true, whatsappNumber: '51999999999' },
                  shopOwnerId: 'demo'
              });
              set({ isLoading: false });
              return;
          }

          const userId = identifier;
          set({ shopOwnerId: userId });

          // 1. Fetch Products (including config product)
          const { data: productsData, error: prodError } = await supabase.from('products').select('*').eq('user_id', userId);
          if (prodError) console.error("Error fetching products:", prodError);

          let products: Product[] = productsData ? productsData.map(mapProductFromDB) : [];
          
          // Extract Config
          const configProduct = products.find(p => p.name === CONFIG_PRODUCT_NAME);
          // Filter out config from display inventory
          products = products.filter(p => p.name !== CONFIG_PRODUCT_NAME);

          // 2. Fetch Categories
          const { data: categories } = await supabase.from('categories').select('*').eq('user_id', userId);
          
          // 3. Attempt to Fetch Profile (Store Name, WhatsApp)
          let profileSettings: Partial<AppSettings> = {};
          
          // Primary: Profiles Table
          try {
              const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
              if (profile) {
                  profileSettings = {
                      companyName: profile.company_name,
                      whatsappNumber: profile.whatsapp_number,
                      whatsappEnabled: !!profile.whatsapp_number && profile.whatsapp_number.length > 5,
                      whatsappTemplate: profile.whatsapp_template
                  };
              }
          } catch (e) { console.log('Profile fetch failed', e); }

          // Fallback: Config Product
          if (!profileSettings.whatsappNumber && configProduct && configProduct.description) {
              try {
                  const fallback = JSON.parse(configProduct.description);
                  profileSettings = { ...profileSettings, ...fallback };
              } catch(e) {}
          }

          set({ inventory: products });
          if (categories) set({ categories: categories.map(mapCategoryFromDB) });
          
          // Merge fetched profile settings with defaults for display
          set((state) => ({
              settings: {
                  ...state.settings,
                  companyName: profileSettings.companyName || 'Catálogo Online',
                  whatsappNumber: profileSettings.whatsappNumber,
                  whatsappEnabled: !!profileSettings.whatsappNumber, // Force true if number exists
                  whatsappTemplate: profileSettings.whatsappTemplate || DEFAULT_WA_TEMPLATE
              }
          }));
          
          set({ isLoading: false });
      },
      
      generateDemoData: () => {
          const demoCategories: CategoryConfig[] = [
              { id: '1', name: 'Ropa', prefix: 'APP', margin: 0.50, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', isInternal: false },
              { id: '2', name: 'Accesorios', prefix: 'ACC', margin: 0.60, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', isInternal: false },
          ];

          const demoProducts: Product[] = [
              {
                  id: '101', name: 'Polera Oversize "Eras Tour"', category: 'Ropa', sku: 'APP-TS-001',
                  cost: 15.00, price: 35.00, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=200',
                  description: 'Polera de algodón reactivo.', createdAt: new Date().toISOString(), entryDate: new Date().toISOString(),
                  supplierWarranty: undefined, confidence: 1, folderId: null, tags: ['Trending']
              }
          ];

          set((state) => ({ 
              categories: demoCategories,
              inventory: demoProducts,
              settings: { ...state.settings, plan: 'growth', hasClaimedOffer: true, whatsappEnabled: true, whatsappNumber: '51999999999' }
          }));
      },

      addProduct: async (product) => {
        if (!get().checkAuth()) return;
        const { session } = get();

        const productWithImage = { ...product, imageUrl: product.imageUrl || DEFAULT_PRODUCT_IMAGE };
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
          const sanitizedProducts = products.map(p => ({ ...p, imageUrl: (p.imageUrl && p.imageUrl.length > 5) ? p.imageUrl : DEFAULT_PRODUCT_IMAGE }));
          set((state) => ({ inventory: [...sanitizedProducts, ...state.inventory] }));
          if (session && isSupabaseConfigured) {
              const dbProducts = sanitizedProducts.map(p => ({
                  id: p.id, user_id: session.user.id, name: p.name, category: p.category, brand: p.brand, description: p.description, sku: p.sku, cost: p.cost, price: p.price, stock: p.stock, image_url: p.imageUrl, supplier: p.supplier, entry_date: p.entryDate, supplier_warranty: p.supplierWarranty, confidence: p.confidence, folder_id: p.folderId, tags: p.tags
              }));
              await supabase.from('products').insert(dbProducts);
          }
      },
      addFolder: async (folder) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ folders: [...state.folders, folder] }));
          if (session && isSupabaseConfigured) await supabase.from('folders').insert({ id: folder.id, user_id: session.user.id, name: folder.name, parent_id: folder.parentId });
      },
      updateProduct: async (id, updates) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ inventory: state.inventory.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
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
              set((state) => ({ inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p) }));
              if (session && isSupabaseConfigured) await supabase.from('products').update({ stock: newStock }).eq('id', id);
          }
      },
      decrementStock: async (id) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          const product = get().inventory.find(p => p.id === id);
          if (product) {
              const newStock = Math.max(0, product.stock - 1);
              set((state) => ({ inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p) }));
              if (session && isSupabaseConfigured) await supabase.from('products').update({ stock: newStock }).eq('id', id);
          }
      },
      updateFolder: async (id, updates) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ folders: state.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)) }));
          if (session && isSupabaseConfigured) {
              const dbUpdates: any = { ...updates };
              if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
              await supabase.from('folders').update(dbUpdates).eq('id', id);
          }
      },
      deleteProduct: async (id) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ inventory: state.inventory.filter((p) => p.id !== id) }));
          if (session && isSupabaseConfigured) await supabase.from('products').delete().eq('id', id);
      },
      clearInventory: async () => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set({ inventory: [] });
          if (isSupabaseConfigured && session) await supabase.from('products').delete().eq('user_id', session.user.id);
      },
      deleteFolder: async (id) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ folders: state.folders.filter((f) => f.id !== id), inventory: state.inventory.map(p => p.folderId === id ? { ...p, folderId: null } : p) }));
          if (session && isSupabaseConfigured) {
              await supabase.from('products').update({ folder_id: null }).eq('folder_id', id);
              await supabase.from('folders').delete().eq('id', id);
          }
      },
      moveProduct: async (productId, targetFolderId) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ inventory: state.inventory.map(p => p.id === productId ? { ...p, folderId: targetFolderId } : p) }));
          if (session && isSupabaseConfigured) await supabase.from('products').update({ folder_id: targetFolderId }).eq('id', productId);
      },
      moveFolder: async (folderId, targetFolderId) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ folders: state.folders.map(f => f.id === folderId ? { ...f, parentId: targetFolderId } : f) }));
          if (session && isSupabaseConfigured) await supabase.from('folders').update({ parent_id: targetFolderId }).eq('id', folderId);
      },
      addCategory: async (category) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ categories: [...state.categories, category] }));
          if (session && isSupabaseConfigured) {
              const dbCategory = { id: category.id, user_id: session.user.id, name: category.name, prefix: category.prefix, margin: category.margin, color: category.color, is_internal: category.isInternal };
              await supabase.from('categories').insert(dbCategory);
          }
      },
      bulkAddCategories: async (newCategories) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ categories: [...state.categories, ...newCategories] }));
          if (session && isSupabaseConfigured) {
              const dbCategories = newCategories.map(c => ({ id: c.id, user_id: session.user.id, name: c.name, prefix: c.prefix, margin: c.margin, color: c.color, is_internal: c.isInternal }));
              await supabase.from('categories').insert(dbCategories);
          }
      },
      updateCategory: async (id, updates) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c) }));
          if (session && isSupabaseConfigured) {
              const dbUpdates: any = { ...updates };
              if (updates.isInternal !== undefined) dbUpdates.is_internal = updates.isInternal;
              await supabase.from('categories').update(dbUpdates).eq('id', id);
          }
      },
      deleteCategory: async (id) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
          if (session && isSupabaseConfigured) await supabase.from('categories').delete().eq('id', id);
      },

      addToCart: (product) => set((state) => {
          const existing = state.cart.find(item => item.id === product.id);
          if (existing) {
              return { cart: state.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item), isCartOpen: true };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }], isCartOpen: true };
      }),
      removeFromCart: (productId) => set((state) => ({
          cart: state.cart.filter(item => item.id !== productId)
      })),
      updateCartQuantity: (productId, delta) => set((state) => ({
          cart: state.cart.map(item => {
              if (item.id === productId) {
                  return { ...item, quantity: Math.max(1, item.quantity + delta) };
              }
              return item;
          })
      })),
      clearCart: () => set({ cart: [] }),
      
      createOrder: async (customerInfo) => {
          const { cart, shopOwnerId } = get();
          if (cart.length === 0 || !shopOwnerId) return;

          const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          
          const newOrder: Order = {
              id: crypto.randomUUID(),
              user_id: shopOwnerId, // The seller
              customer_name: customerInfo.name || 'Cliente Web',
              customer_phone: customerInfo.phone,
              status: 'pending',
              total_amount: total,
              created_at: new Date().toISOString(),
              items: cart.map(item => ({
                  product_id: item.id,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price
              }))
          };

          if (isSupabaseConfigured) {
              try {
                  await supabase.from('orders').insert(newOrder);
              } catch (e) { console.error("Error creating order", e); }
          }
          
          set({ cart: [] });
      },

      updateOrderStatus: async (orderId, status) => {
          if (!get().checkAuth()) return;
          const { session } = get();
          
          set((state) => ({
              orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
          }));

          if (session && isSupabaseConfigured) {
              await supabase.from('orders').update({ status }).eq('id', orderId);
          }
      },

      setCurrentFolder: (folderId) => set({ currentFolderId: folderId, currentView: 'files', pendingAction: null }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      resetFilters: () => set({ filters: initialFilters }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrentView: (view) => set({ currentView: view, currentFolderId: null, pendingAction: null }),
      
      updateSettings: (newSettings) => {
          set((state) => ({ settings: { ...state.settings, ...newSettings } }));
          // Fire and forget local update
      },

      saveProfileSettings: async (newSettings) => {
          const { session, settings } = get();
          const mergedSettings = { ...settings, ...newSettings };
          set({ settings: mergedSettings });
          
          if (session && isSupabaseConfigured) {
              let saved = false;
              let errorMessage = '';

              // METHOD 1: Try Standard Profiles Table
              try {
                  const updates: any = { updated_at: new Date().toISOString() };
                  if (newSettings.companyName) updates.company_name = newSettings.companyName;
                  if (newSettings.whatsappNumber !== undefined) updates.whatsapp_number = newSettings.whatsappNumber;
                  if (newSettings.whatsappTemplate) updates.whatsapp_template = newSettings.whatsappTemplate;
                  
                  const { error } = await supabase.from('profiles').upsert({ 
                      id: session.user.id, 
                      ...updates 
                  });
                  
                  if (!error) saved = true;
                  else errorMessage = error.message;
              } catch (e) {
                  errorMessage = (e as any).message;
              }

              // METHOD 2: Fallback to Hidden Product (If Profiles failed)
              if (!saved) {
                  console.warn("Saving to profiles table failed, trying fallback storage...", errorMessage);
                  
                  const configData = {
                      companyName: mergedSettings.companyName,
                      whatsappNumber: mergedSettings.whatsappNumber,
                      whatsappTemplate: mergedSettings.whatsappTemplate
                  };

                  try {
                      // Check if exists
                      const { data: existing } = await supabase
                          .from('products')
                          .select('id')
                          .eq('user_id', session.user.id)
                          .eq('name', CONFIG_PRODUCT_NAME)
                          .single();

                      const productPayload = {
                          name: CONFIG_PRODUCT_NAME,
                          description: JSON.stringify(configData), // Store JSON in description
                          category: 'System',
                          price: 0,
                          stock: 0,
                          sku: 'SYS-CONFIG',
                          user_id: session.user.id,
                          image_url: DEFAULT_PRODUCT_IMAGE,
                          cost: 0
                      };

                      if (existing) {
                          await supabase.from('products').update(productPayload).eq('id', existing.id);
                      } else {
                          await supabase.from('products').insert({ id: crypto.randomUUID(), ...productPayload });
                      }
                      saved = true;
                  } catch (e) {
                      console.error("Fallback storage also failed", e);
                      // Throw the original error to inform user about connection/auth issues
                      throw new Error(errorMessage || "Error guardando en base de datos alternativa.");
                  }
              }
          }
      },
      
      claimOffer: async () => {
        if (!get().checkAuth()) return; 
        const { session } = get();
        set((state) => ({ settings: { ...state.settings, hasClaimedOffer: true, plan: 'growth' } }));
        if (session && isSupabaseConfigured) {
            try { await supabase.from('claimed_offers').insert({ user_id: session.user.id, email: session.user.email, offer_type: 'growth_3_months_free', claimed_at: new Date().toISOString() }); } catch (err) {}
        }
        alert("¡Felicidades! Tu oferta de 3 meses gratis ha sido registrada.");
      },
      
      getBreadcrumbs: () => {
        const { folders, currentFolderId } = get();
        const breadcrumbs: Folder[] = [];
        let currentId = currentFolderId;
        while (currentId) {
          const folder = folders.find(f => f.id === currentId);
          if (folder) { breadcrumbs.unshift(folder); currentId = folder.parentId; } else { break; }
        }
        return breadcrumbs;
      },
      
      getFilteredInventory: () => {
         const { inventory, searchQuery, filters } = get();
         return inventory.filter(item => {
            // Hide Config Item
            if (item.name === CONFIG_PRODUCT_NAME) return false;

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
    }),
    {
      name: 'mymorez-storage', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
          session: state.session,
          inventory: state.inventory,
          folders: state.folders,
          categories: state.categories,
          settings: state.settings,
          orders: state.orders,
          cart: state.cart,
      }),
    }
  )
);
