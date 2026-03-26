
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, Folder, ViewType, AppSettings, CategoryConfig, FilterState, Order, CartItem, OrderStatus } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session, RealtimeChannel } from '@supabase/supabase-js';
import { DEFAULT_PRODUCT_IMAGE } from './constants';

// Helper to map DB snake_case to Frontend camelCase
const mapProductFromDB = (p: any): Product => ({
    ...p,
    imageUrl: p.image_url || DEFAULT_PRODUCT_IMAGE,
    videoUrl: p.video_url || undefined,
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

export interface ManagedShop {
    developer_id: string;
    shop_user_id: string;
    name: string;
}

export interface DemoShop {
    id: string;
    developer_id: string;
    name: string;
    slug: string;
    description: string;
    logo_url: string | null;
    primary_color: string;
    whatsapp_number: string | null;
    settings?: any;
    created_at: string;
}

interface AppState {
    session: Session | null;
    isDemoMode: boolean;
    isDeveloper: boolean;
    activeDeveloperUserId: string | null;
    activeDemoShopId: string | null; // Which demo shop is active
    managedShops: ManagedShop[];
    demoShops: DemoShop[];
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

    // Mobile Scanner
    isScannerOpen: boolean;
    capturedImage: string | null;

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

    language: 'es' | 'en';

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

    setScannerOpen: (isOpen: boolean) => void;
    setCapturedImage: (image: string | null) => void;

    setEditingProduct: (product: Product | null) => void;
    setSelectedProduct: (product: Product | null) => void;

    setPendingAction: (action: 'warranty' | 'stagnant' | null) => void;

    fetchInitialData: () => Promise<void>;
    fetchPublicStore: (identifier: string) => Promise<void>;
    generateDemoData: () => void;
    refreshOrders: () => Promise<void>;
    fetchManagedShops: () => Promise<void>;
    fetchDemoShops: () => Promise<void>;
    switchDeveloperShop: (shopUserId: string | null) => Promise<void>;
    switchDemoShop: (demoShopId: string | null) => Promise<void>;

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
    createOrder: (customerInfo: { name?: string, phone?: string }, status?: OrderStatus) => Promise<string | undefined>;
    createManualOrder: (order: Partial<Order>) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    confirmOrderExternal: (orderId: string, pin?: string) => Promise<any>;
    reduceStockFromCart: () => Promise<void>;

    subscribeToOrders: () => void;
    unsubscribeFromOrders: () => void;

    setCurrentFolder: (folderId: string | null) => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: Partial<FilterState>) => void;
    resetFilters: () => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    setCurrentView: (view: ViewType) => void;
    updateSettings: (settings: Partial<AppSettings>) => void;

    setLanguage: (lang: 'es' | 'en') => void;
    saveProfileSettings: (settings: Partial<AppSettings>) => Promise<void>; // New explicit async action
    claimOffer: () => Promise<void>;
    confirmInStallPurchase: () => Promise<void>;
    setShopOwnerId: (id: string | null) => void;
    exitBuyerMode: () => Promise<void>;

    // Helpers
    getBreadcrumbs: () => Folder[];
    getFilteredInventory: () => Product[];
    checkAuth: () => boolean;
    isQRModalOpen: boolean;
    setQRModalOpen: (open: boolean) => void;
    isPromoBannerDismissed: boolean;
    setPromoBannerDismissed: (dismissed: boolean) => void;

    // Developer helpers
    getEffectiveUserId: () => string | null;
    randomizeInventory: () => Promise<void>;
    simulateRandomOrder: () => Promise<void>;
}

const initialFilters: FilterState = {
    categories: [],
    minPrice: '',
    maxPrice: '',
    tags: [],
    stockBelow: undefined,
};

const DEFAULT_WA_TEMPLATE = "Hola *{{TIENDA}}*, me interesa:\n\n{{PEDIDO}}\n\n💰 Total: {{TOTAL}}\n👤 Mis datos: {{CLIENTE}}";

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            session: null,
            isDemoMode: false,
            isDeveloper: false,
            activeDeveloperUserId: null,
            activeDemoShopId: null,
            managedShops: [],
            demoShops: [],
            isAuthModalOpen: false,
            appMode: 'seller',
            shopOwnerId: null,

            tourStep: 0,

            isAddProductModalOpen: false,
            isImporterOpen: false,
            isDetailsOpen: false,
            isWhatsAppModalOpen: false,
            isCartOpen: false,
            isQRModalOpen: false,
            isPromoBannerDismissed: false,

            isScannerOpen: false,
            capturedImage: null,

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
            language: 'es',
            settings: {
                companyName: 'Mi Tienda',
                currency: 'USD',
                taxRate: 0.16,
                hasClaimedOffer: false,
                plan: 'starter',
                stagnantDaysThreshold: 90,
                whatsappEnabled: false,
                whatsappTemplate: DEFAULT_WA_TEMPLATE,
                theme: 'dark',
                storeSlug: '',
                primaryColor: '#32D74B',
                secondaryColor: '#10B981',
            },
            isLoading: true, // Let it start as true so we don't flash "Empty Catalog" before fetching begins

            pendingAction: null,

            getEffectiveUserId: () => {
                const { session, activeDeveloperUserId, isDeveloper } = get();
                if (isDeveloper && activeDeveloperUserId) return activeDeveloperUserId;
                return session?.user.id || null;
            },

            setSession: (session) => {
                set({ session });
                if (!session && get().appMode === 'seller') {
                    set({ inventory: [], folders: [], categories: [], orders: [], isDeveloper: false, activeDeveloperUserId: null, activeDemoShopId: null, managedShops: [], demoShops: [] });
                    get().unsubscribeFromOrders();
                }
            },
            setLanguage: (lang) => set({ language: lang }),
            setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
            setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),

            setTourStep: (step) => set({ tourStep: step }),

            setAddProductModalOpen: (isOpen) => set({ isAddProductModalOpen: isOpen }),
            setIsImporterOpen: (isOpen) => set({ isImporterOpen: isOpen }),
            setIsDetailsOpen: (isOpen) => set({ isDetailsOpen: isOpen }),
            setCreateMenuOpen: (isOpen) => set({ isCreateMenuOpen: isOpen }),
            setWhatsAppModalOpen: (isOpen) => set({ isWhatsAppModalOpen: isOpen }),
            setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

            setScannerOpen: (isOpen) => set({ isScannerOpen: isOpen }),
            setCapturedImage: (image) => set({ capturedImage: image }),

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

            fetchManagedShops: async () => {
                const { session } = get();
                if (!session || !isSupabaseConfigured) return;
                const { data } = await supabase.from('managed_shops').select('*').eq('developer_id', session.user.id);
                if (data) set({ managedShops: data as ManagedShop[] });
            },

            fetchDemoShops: async () => {
                const { session } = get();
                if (!session || !isSupabaseConfigured) return;
                const { data } = await supabase.from('demo_shops').select('*').eq('developer_id', session.user.id).order('created_at', { ascending: false });
                if (data) set({ demoShops: data as DemoShop[] });
            },

            switchDeveloperShop: async (shopUserId) => {
                if (!shopUserId) {
                    set({ activeDeveloperUserId: null, activeDemoShopId: null });
                    await get().fetchInitialData();
                    return;
                }
                set({ isLoading: true, activeDeveloperUserId: shopUserId, activeDemoShopId: null });
                const [productsRes, foldersRes, categoriesRes, ordersRes] = await Promise.all([
                    supabase.from('products').select('*').eq('user_id', shopUserId).is('demo_shop_id', null),
                    supabase.from('folders').select('*').eq('user_id', shopUserId).is('demo_shop_id', null),
                    supabase.from('categories').select('*').eq('user_id', shopUserId).is('demo_shop_id', null),
                    supabase.from('orders').select('*').eq('user_id', shopUserId).is('demo_shop_id', null),
                ]);
                const allProducts = (productsRes.data || []).map(mapProductFromDB);
                set({
                    inventory: allProducts.filter(p => p.name !== CONFIG_PRODUCT_NAME),
                    folders: (foldersRes.data || []).map(mapFolderFromDB),
                    categories: (categoriesRes.data || []).map(mapCategoryFromDB),
                    orders: (ordersRes.data || []).map(mapOrderFromDB),
                    isLoading: false,
                });
                try {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', shopUserId).single();
                    const configProduct = allProducts.find(p => p.name === CONFIG_PRODUCT_NAME);
                    let extraSettings: any = {};
                    if (configProduct?.description) {
                        try { extraSettings = JSON.parse(configProduct.description); } catch {}
                    }
                    if (profile) {
                        const defaultSettings: AppSettings = {
                            companyName: 'Tienda',
                            currency: 'USD',
                            taxRate: 0.16,
                            hasClaimedOffer: false,
                            plan: 'starter',
                            stagnantDaysThreshold: 90,
                            whatsappEnabled: !!profile.whatsapp_number,
                            whatsappTemplate: profile.whatsapp_template || DEFAULT_WA_TEMPLATE,
                            theme: 'dark',
                            storeSlug: profile.store_slug || '',
                        };

                        set({
                            settings: {
                                ...defaultSettings,
                                ...extraSettings,
                                companyName: profile.company_name || extraSettings.companyName || 'Tienda',
                                displayName: profile.display_name,
                                whatsappNumber: profile.whatsapp_number,
                                storeSlug: profile.store_slug || '',
                            }
                        });
                    }
                } catch {}
            },

            switchDemoShop: async (demoShopId) => {
                if (!demoShopId) {
                    set({ activeDemoShopId: null, activeDeveloperUserId: null });
                    await get().fetchInitialData();
                    return;
                }
                const { session, demoShops } = get();
                if (!session) return;
                const shop = demoShops.find(s => s.id === demoShopId);
                if (!shop) return;
                set({ isLoading: true, activeDemoShopId: demoShopId, activeDeveloperUserId: null });
                const [productsRes, foldersRes, categoriesRes, ordersRes] = await Promise.all([
                    supabase.from('products').select('*').eq('user_id', session.user.id).eq('demo_shop_id', demoShopId),
                    supabase.from('folders').select('*').eq('user_id', session.user.id).eq('demo_shop_id', demoShopId),
                    supabase.from('categories').select('*').eq('user_id', session.user.id).eq('demo_shop_id', demoShopId),
                    supabase.from('orders').select('*').eq('user_id', session.user.id).eq('demo_shop_id', demoShopId),
                ]);
                
                const baseSettings = get().settings; // Capture current settings for potential fallback
                const defaultSettings: AppSettings = {
                    companyName: 'Tienda Demo',
                    currency: 'USD',
                    taxRate: 0.16,
                    hasClaimedOffer: false,
                    plan: 'starter',
                    stagnantDaysThreshold: 90,
                    whatsappEnabled: !!baseSettings.whatsappNumber,
                    whatsappTemplate: DEFAULT_WA_TEMPLATE,
                    theme: 'dark',
                    storeSlug: '',
                    whatsappNumber: baseSettings.whatsappNumber,
                };

                set({
                    inventory: (productsRes.data || []).map(mapProductFromDB),
                    folders: (foldersRes.data || []).map(mapFolderFromDB),
                    categories: (categoriesRes.data || []).map(mapCategoryFromDB),
                    orders: (ordersRes.data || []).map(mapOrderFromDB),
                    isLoading: false,
                    settings: {
                        ...defaultSettings,
                        ...shop.settings,
                        companyName: shop.name || shop.settings?.companyName || 'Tienda Demo',
                        storeSlug: shop.slug || shop.settings?.storeSlug || '',
                        whatsappNumber: shop.whatsapp_number || shop.settings?.whatsappNumber || defaultSettings.whatsappNumber,
                        primaryColor: shop.primary_color || shop.settings?.primaryColor || '#32D74B',
                        storeLogo: shop.logo_url || shop.settings?.storeLogo || undefined,
                        storeDescription: shop.description || shop.settings?.storeDescription || '',
                    }
                });
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
                    // Check if developer
                    const { data: devRow } = await supabase
                        .from('developers')
                        .select('user_id')
                        .eq('user_id', session.user.id)
                        .maybeSingle();
                    
                    if (devRow) {
                        set({ isDeveloper: true });
                        get().fetchManagedShops();
                        get().fetchDemoShops();
                    } else {
                        set({ isDeveloper: false, activeDeveloperUserId: null, activeDemoShopId: null });
                    }

                    if (get().activeDemoShopId) {
                        get().switchDemoShop(get().activeDemoShopId);
                        return;
                    }
                    if (get().activeDeveloperUserId) {
                        await get().switchDeveloperShop(get().activeDeveloperUserId);
                        return;
                    }

                    const [productsRes, foldersRes, categoriesRes, offersRes, ordersRes] = await Promise.all([
                        supabase.from('products').select('*').eq('user_id', session.user.id).is('demo_shop_id', null),
                        supabase.from('folders').select('*').eq('user_id', session.user.id).is('demo_shop_id', null),
                        supabase.from('categories').select('*').eq('user_id', session.user.id).is('demo_shop_id', null),
                        supabase.from('claimed_offers').select('*').eq('user_id', session.user.id).eq('offer_type', 'growth_3_months_free'),
                        supabase.from('orders').select('*').eq('user_id', session.user.id).is('demo_shop_id', null),
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

                    // Init Realtime
                    get().subscribeToOrders();

                    // Strategy: Try loading from Profiles table first, fallback to Config Product
                    let loadedSettings: Partial<AppSettings> = {};

                    // 1. Load from Config Product first for the custom fields
                    if (configProduct && configProduct.description) {
                        try {
                            const fallbackConfig = JSON.parse(configProduct.description);
                            loadedSettings = { ...loadedSettings, ...fallbackConfig };
                        } catch (e) { }
                    }

                    // 2. Try Profiles Table (overrides Config Product)
                    try {
                        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                        if (profile) {
                            loadedSettings = {
                                ...loadedSettings,
                                displayName: profile.display_name,
                                companyName: profile.company_name || loadedSettings.companyName,
                                whatsappNumber: profile.whatsapp_number || loadedSettings.whatsappNumber,
                                whatsappEnabled: !!profile.whatsapp_number,
                                whatsappTemplate: profile.whatsapp_template || loadedSettings.whatsappTemplate,
                                storeSlug: profile.store_slug || '',
                                primaryColor: profile.primary_color || loadedSettings.primaryColor,
                                secondaryColor: profile.secondary_color || loadedSettings.secondaryColor,
                            };
                        }
                    } catch (e) {
                        console.log('Profile table fetch failed, relying on config product...');
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

            refreshOrders: async () => {
                const { session } = get();
                if (!session || !isSupabaseConfigured) return;
                const { data } = await supabase.from('orders').select('*').eq('user_id', session.user.id);
                if (data) {
                    set({ orders: data.map(mapOrderFromDB) });
                }
            },

            subscribeToOrders: () => {
                const { session, shopOwnerId } = get();
                const targetUserId = session?.user.id || shopOwnerId;
                if (!targetUserId || !isSupabaseConfigured) return;

                // Unsubscribe previous if any (to avoid duplicates)
                supabase.removeAllChannels();

                const channel = supabase.channel('app-realtime')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${targetUserId}` },
                        (payload) => {
                            console.log("🔔 Realtime Order Update:", payload);
                            if (payload.eventType === 'INSERT') {
                                const newOrder = mapOrderFromDB(payload.new);
                                set(state => {
                                    if (state.orders.some(o => o.id === newOrder.id)) return state;
                                    return { orders: [newOrder, ...state.orders] };
                                });
                            } else if (payload.eventType === 'UPDATE') {
                                const updatedOrder = mapOrderFromDB(payload.new);
                                set(state => ({
                                    orders: state.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                                }));
                            }
                        }
                    )
                    .on(
                        'postgres_changes',
                        // Listen for config product (settings) changes for cross-device sync
                        { event: 'UPDATE', schema: 'public', table: 'products', filter: `user_id=eq.${targetUserId}` },
                        (payload) => {
                            if (payload.new?.name === CONFIG_PRODUCT_NAME) {
                                try {
                                    const config = JSON.parse(payload.new.description || '{}');
                                    set(state => ({
                                        settings: {
                                            ...state.settings,
                                            theme: config.theme || state.settings.theme,
                                            primaryColor: config.primaryColor || state.settings.primaryColor,
                                            secondaryColor: config.secondaryColor || state.settings.secondaryColor,
                                            storeLogo: config.storeLogo || state.settings.storeLogo,
                                            storeDescription: config.storeDescription ?? state.settings.storeDescription,
                                            instagramUrl: config.instagramUrl ?? state.settings.instagramUrl,
                                            facebookUrl: config.facebookUrl ?? state.settings.facebookUrl,
                                            websiteUrl: config.websiteUrl ?? state.settings.websiteUrl,
                                            companyName: config.companyName || state.settings.companyName,
                                        }
                                    }));
                                    console.log('🎨 Store settings synced in real-time');
                                } catch (e) {
                                    console.warn('Failed to parse realtime config update', e);
                                }
                            } else {
                                // Real-time sync for general products
                                const updatedProduct = mapProductFromDB(payload.new);
                                set(state => ({
                                    inventory: state.inventory.map(p => p.id === updatedProduct.id ? updatedProduct : p)
                                }));
                                console.log('📦 Product updated in real-time:', updatedProduct.name);
                            }
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: 'INSERT', schema: 'public', table: 'products', filter: `user_id=eq.${targetUserId}` },
                        (payload) => {
                            const newProduct = mapProductFromDB(payload.new);
                            if (newProduct.name === CONFIG_PRODUCT_NAME) return;
                            set(state => ({
                                inventory: [newProduct, ...state.inventory]
                            }));
                            console.log('📦 New product added in real-time:', newProduct.name);
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: 'DELETE', schema: 'public', table: 'products', filter: `user_id=eq.${targetUserId}` },
                        (payload) => {
                            set(state => ({
                                inventory: state.inventory.filter(p => p.id !== payload.old.id)
                            }));
                            console.log('📦 Product deleted in real-time');
                        }
                    )
                    .subscribe();
            },

            unsubscribeFromOrders: () => {
                supabase.removeAllChannels();
            },

            fetchPublicStore: async (identifier: string) => {
                // Clear previous state to avoid confusion — always start fresh in buyer mode
                set({ isLoading: true, appMode: 'buyer', inventory: [], categories: [], cart: [] });

                if (!isSupabaseConfigured) {
                    get().generateDemoData();
                    set({
                        settings: { ...get().settings, companyName: 'Tienda Demo', whatsappEnabled: true, whatsappNumber: '51999999999', storeSlug: 'demo' },
                        shopOwnerId: 'demo'
                    });
                    set({ isLoading: false });
                    return;
                }

                let finalUserId = identifier;
                let demoShopFilter: string | null = null;
                const cleanIdentifier = identifier.trim().toLowerCase();

                // If identifier looks like a slug (not uuid), resolve it
                const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);
                if (!isUuid) {
                    // Try profiles first
                    const { data: profileMatch } = await supabase.from('profiles').select('id, store_slug').eq('store_slug', cleanIdentifier).maybeSingle();
                    if (profileMatch && profileMatch.id) {
                        finalUserId = profileMatch.id;
                    } else {
                        // Try demo_shops
                        const { data: demoMatch } = await supabase.from('demo_shops').select('id, developer_id, slug').eq('slug', cleanIdentifier).maybeSingle();
                        if (demoMatch) {
                            finalUserId = demoMatch.developer_id;
                            demoShopFilter = demoMatch.id;
                        } else {
                            console.error("Store not found for slug:", identifier);
                            set({ isLoading: false });
                            return;
                        }
                    }
                }

                set({ shopOwnerId: finalUserId, activeDemoShopId: demoShopFilter });

                // 1. Fetch Data Concurrently
                let productsQuery = supabase.from('products').select('*').eq('user_id', finalUserId);
                let categoriesQuery = supabase.from('categories').select('*').eq('user_id', finalUserId);
                if (demoShopFilter) {
                    productsQuery = productsQuery.eq('demo_shop_id', demoShopFilter);
                    categoriesQuery = categoriesQuery.eq('demo_shop_id', demoShopFilter);
                } else {
                    productsQuery = productsQuery.is('demo_shop_id', null);
                    categoriesQuery = categoriesQuery.is('demo_shop_id', null);
                }

                const [productsRes, categoriesRes, profileRes, demoShopRes] = await Promise.all([
                    productsQuery,
                    categoriesQuery,
                    supabase.from('profiles').select('*').eq('id', finalUserId).maybeSingle(),
                    demoShopFilter ? supabase.from('demo_shops').select('*').eq('id', demoShopFilter).single() : Promise.resolve({ data: null }),
                ]);

                if (productsRes.error) console.error("Error fetching products:", productsRes.error);

                let products: Product[] = productsRes.data ? productsRes.data.map(mapProductFromDB) : [];

                // Extract Config
                const configProduct = products.find(p => p.name === CONFIG_PRODUCT_NAME);
                // Filter out config from display inventory
                products = products.filter(p => p.name !== CONFIG_PRODUCT_NAME);

                // 2. Attempt to parse Profile Settings
                let profileSettings: Partial<AppSettings> = {};

                // Primary: Fallback Config Product First
                if (configProduct && configProduct.description) {
                    try {
                        const fallback = JSON.parse(configProduct.description);
                        profileSettings = { ...profileSettings, ...fallback };
                    } catch (e) { }
                }

                // Override with Profiles Table if exists
                if (profileRes.data) {
                    const profile = profileRes.data;
                    profileSettings = {
                        ...profileSettings,
                        displayName: profile.display_name,
                        companyName: profile.company_name || profileSettings.companyName,
                        whatsappNumber: profile.whatsapp_number || profileSettings.whatsappNumber,
                        whatsappEnabled: !!profile.whatsapp_number && profile.whatsapp_number.length > 5,
                        whatsappTemplate: profile.whatsapp_template || profileSettings.whatsappTemplate,
                        storeSlug: profile.store_slug || profileSettings.storeSlug,
                        primaryColor: profile.primary_color || profileSettings.primaryColor,
                        secondaryColor: profile.secondary_color || profileSettings.secondaryColor,
                    };
                } else if (profileRes.error && profileRes.error.code !== 'PGRST116' && !demoShopFilter) {
                    console.log('Profile fetch failed, using fallback config', profileRes.error);
                }

                // FINAL OVERRIDE: Demo Shop Settings (Highest priority if in a demo shop)
                if (demoShopFilter && demoShopRes.data) {
                    const shop = demoShopRes.data;
                    profileSettings = {
                        ...profileSettings,
                        ...shop.settings,
                        companyName: shop.name || shop.settings?.companyName || profileSettings.companyName,
                        storeSlug: shop.slug || shop.settings?.storeSlug || profileSettings.storeSlug,
                        whatsappNumber: shop.whatsapp_number || shop.settings?.whatsappNumber || profileSettings.whatsappNumber,
                        primaryColor: shop.primary_color || shop.settings?.primaryColor || profileSettings.primaryColor,
                        storeLogo: shop.logo_url || shop.settings?.storeLogo || profileSettings.storeLogo,
                        storeDescription: shop.description || shop.settings?.storeDescription || profileSettings.storeDescription,
                    };
                }

                set({ inventory: products });
                if (categoriesRes.data) set({ categories: categoriesRes.data.map(mapCategoryFromDB) });

                // Merge ALL settings (including theme, colors, logo, description, social links, currency) from config product
                set((state) => ({
                    settings: {
                        ...state.settings,
                        companyName: profileSettings.companyName || 'Catálogo Online',
                        whatsappNumber: profileSettings.whatsappNumber,
                        whatsappEnabled: !!profileSettings.whatsappNumber,
                        whatsappTemplate: profileSettings.whatsappTemplate || DEFAULT_WA_TEMPLATE,
                        storeSlug: profileSettings.storeSlug || '',
                        // Brand settings from config product JSON blob
                        theme: profileSettings.theme || state.settings.theme,
                        primaryColor: profileSettings.primaryColor || state.settings.primaryColor,
                        secondaryColor: profileSettings.secondaryColor || state.settings.secondaryColor,
                        storeLogo: profileSettings.storeLogo || state.settings.storeLogo,
                        storeDescription: profileSettings.storeDescription || '',
                        instagramUrl: profileSettings.instagramUrl || '',
                        facebookUrl: profileSettings.facebookUrl || '',
                        websiteUrl: profileSettings.websiteUrl || '',
                        currency: profileSettings.currency || state.settings.currency,
                        taxRate: profileSettings.taxRate !== undefined ? profileSettings.taxRate : state.settings.taxRate,
                    }
                }));

                // Realtime: re-subscribe to this store's profile for live sync
                get().subscribeToOrders();

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
                const { session, activeDemoShopId, inventory } = get();

                if (activeDemoShopId && inventory.length >= 10) {
                    alert("Las tiendas demo tienen un límite de 10 productos.");
                    return;
                }

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
                        tags: productWithImage.tags,
                        demo_shop_id: activeDemoShopId
                    };
                    await supabase.from('products').insert(dbProduct);
                }
            },

            bulkAddProducts: async (products) => {
                if (!get().checkAuth()) return;
                const { session, activeDemoShopId, inventory } = get();

                let toAdd = products;
                if (activeDemoShopId) {
                    const remaining = 10 - inventory.length;
                    if (remaining <= 0) {
                        alert("Límite de 10 productos alcanzado.");
                        return;
                    }
                    toAdd = products.slice(0, remaining);
                }

                const sanitizedProducts = toAdd.map(p => ({ ...p, imageUrl: (p.imageUrl && p.imageUrl.length > 5) ? p.imageUrl : DEFAULT_PRODUCT_IMAGE }));
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
                        tags: p.tags,
                        demo_shop_id: activeDemoShopId
                    }));
                    await supabase.from('products').insert(dbProducts);
                }
            },
            addFolder: async (folder) => {
                if (!get().checkAuth()) return;
                const { session, activeDemoShopId } = get();
                set((state) => ({ folders: [...state.folders, folder] }));
                if (session && isSupabaseConfigured) await supabase.from('folders').insert({ id: folder.id, user_id: session.user.id, name: folder.name, parent_id: folder.parentId, demo_shop_id: activeDemoShopId });
            },
            updateProduct: async (id, updates) => {
                if (!get().checkAuth()) return;
                const { session } = get();
                const previousInventory = [...get().inventory];
                set((state) => ({ inventory: state.inventory.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
                
                if (session && isSupabaseConfigured) {
                    const dbUpdates: any = {};
                    // Explicit mapping to database snake_case columns
                    if (updates.name !== undefined) dbUpdates.name = updates.name;
                    if (updates.category !== undefined) dbUpdates.category = updates.category;
                    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
                    if (updates.description !== undefined) dbUpdates.description = updates.description;
                    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
                    if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
                    if (updates.price !== undefined) dbUpdates.price = updates.price;
                    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
                    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
                    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
                    if (updates.entryDate !== undefined) dbUpdates.entry_date = updates.entryDate;
                    if (updates.supplierWarranty !== undefined) dbUpdates.supplier_warranty = updates.supplierWarranty;
                    if (updates.confidence !== undefined) dbUpdates.confidence = updates.confidence;
                    if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId;
                    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

                    const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
                    if (error) {
                        console.error("Database Update Failed:", error);
                        set({ inventory: previousInventory });
                        alert("No se pudo actualizar el producto: " + error.message);
                    }
                }
            },
            incrementStock: async (id) => {
                if (!get().checkAuth()) return;
                const { session } = get();
                const product = get().inventory.find(p => p.id === id);
                if (product) {
                    const newStock = product.stock + 1;
                    const previousInventory = [...get().inventory];
                    set((state) => ({ inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p) }));
                    if (session && isSupabaseConfigured) {
                        const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
                        if (error) {
                            console.error("Increment stock failed:", error);
                            set({ inventory: previousInventory });
                            alert("No se pudo aumentar el stock.");
                        }
                    }
                }
            },
            decrementStock: async (id) => {
                if (!get().checkAuth()) return;
                const { session } = get();
                const product = get().inventory.find(p => p.id === id);
                if (product) {
                    const newStock = Math.max(0, product.stock - 1);
                    const previousInventory = [...get().inventory];
                    set((state) => ({ inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p) }));
                    if (session && isSupabaseConfigured) {
                        const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
                        if (error) {
                            console.error("Decrement stock failed:", error);
                            set({ inventory: previousInventory });
                            alert("No se pudo reducir el stock.");
                        }
                    }
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
                const { session, activeDemoShopId } = get();
                set((state) => ({ categories: [...state.categories, category] }));
                if (session && isSupabaseConfigured) {
                    const dbCategory = { id: category.id, user_id: session.user.id, name: category.name, prefix: category.prefix, margin: category.margin, color: category.color, is_internal: category.isInternal, demo_shop_id: activeDemoShopId };
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

            createOrder: async (customerInfo, status) => {
                const { cart, shopOwnerId, settings } = get();
                if (cart.length === 0) return;

                if (!shopOwnerId) {
                    console.error("CRITICAL ERROR: createOrder called without shopOwnerId. This usually means the store identifier is missing from the URL.");
                    throw new Error("Missing shopOwnerId");
                }

                const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                
                const newOrder: Order = {
                    id: crypto.randomUUID(),
                    user_id: shopOwnerId, // The seller
                    customer_name: customerInfo.name || 'Cliente Web',
                    customer_phone: customerInfo.phone || 'WhatsApp',
                    status: status || 'pending',
                    total_amount: total,
                    created_at: new Date().toISOString(),
                    demo_shop_id: get().activeDemoShopId || undefined,
                    items: cart.map(item => ({
                        product_id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };

                // 1. Local State Update (Instant feedback)
                if (!isSupabaseConfigured || get().isDemoMode) {
                    set(state => ({ orders: [newOrder, ...state.orders] }));
                }

                // 2. Supabase Persistence
                if (isSupabaseConfigured && !get().isDemoMode) {
                    try {
                        const { error } = await supabase.from('orders').insert(newOrder);
                        if (error) {
                            console.error("Supabase Order Insert Error Detail:", error);
                            throw new Error(`Sync Error: ${error.message} (${error.code})`);
                        }
                        console.log("Order saved to database successfully.");
                    } catch (error: any) {
                        console.error("CRITICAL: Failed to save order to database:", error);
                        throw error;
                    }
                }

                // Clear cart after successful attempt (or if demo)
                set({ cart: [], isCartOpen: false });
                
                return newOrder.id;
            },

            reduceStockFromCart: async () => {
                const { cart, inventory } = get();
                if (cart.length === 0) return;

                if (isSupabaseConfigured && !get().isDemoMode) {
                    try {
                        for (const item of cart) {
                            const product = inventory.find(p => p.id === item.id);
                            if (product) {
                                const newStock = Math.max(0, product.stock - item.quantity);
                                const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
                                if (error) throw error;
                            }
                        }
                    } catch (error) {
                        console.error("CRITICAL: Failed to reduce stock:", error);
                        throw error;
                    }
                }

                // Update Local State directly
                const newInventory = inventory.map(product => {
                    const cartItem = cart.find(i => i.id === product.id);
                    if (cartItem) {
                        return { ...product, stock: Math.max(0, product.stock - cartItem.quantity) };
                    }
                    return product;
                });

                set({
                    inventory: newInventory,
                    cart: [],
                    isCartOpen: false
                });
            },

            createManualOrder: async (orderData) => {
                const { session, orders } = get();
                if (!session && !get().isDemoMode) return;

                const newOrder: Order = {
                    id: crypto.randomUUID(),
                    user_id: session?.user.id || 'demo',
                    customer_name: orderData.customer_name || 'Venta Manual',
                    customer_phone: orderData.customer_phone || '',
                    status: 'pending', // Manual orders start as pending for verification, or could be 'completed'
                    total_amount: orderData.total_amount || 0,
                    created_at: new Date().toISOString(),
                    demo_shop_id: get().activeDemoShopId || undefined,
                    items: orderData.items || []
                };

                // 1. Local State Update
                set(state => ({ orders: [newOrder, ...state.orders] }));

                // 2. Supabase Persistence
                if (session && isSupabaseConfigured) {
                    try {
                        const dbOrder = {
                            id: newOrder.id,
                            user_id: newOrder.user_id,
                            customer_name: newOrder.customer_name,
                            customer_phone: newOrder.customer_phone,
                            status: newOrder.status,
                            total_amount: newOrder.total_amount,
                            created_at: newOrder.created_at,
                            items: newOrder.items,
                            demo_shop_id: newOrder.demo_shop_id
                        };
                        const { error } = await supabase.from('orders').insert(dbOrder);
                        if (error) throw error;
                    } catch (error) {
                        console.error("Failed to save manual order:", error);
                        throw error;
                    }
                }
            },

            updateOrderStatus: async (orderId, status) => {
                if (!get().checkAuth()) return;
                const { session, orders, inventory } = get();

                const order = orders.find(o => o.id === orderId);
                if (!order) return;

                // CRITICAL: Prevent redundant stock deduction if already completed
                if (status === 'completed' && order.status === 'completed') {
                    console.log("Order already completed, skipping stock deduction.");
                    return;
                }

                // STOCK DEDUCTION LOGIC
                if (status === 'completed') {
                    try {
                        // Verify stock levels before attempting deduction
                        for (const item of order.items) {
                            const product = inventory.find(p => p.id === item.product_id);
                            if (product && product.stock < item.quantity) {
                                console.warn(`Insufficient stock for ${product.name}`);
                                // We still allow it but warn, or we could block it if requirements were stricter
                            }
                        }

                        // Update DB first (Single Source of Truth)
                        if (session && isSupabaseConfigured) {
                            for (const item of order.items) {
                                const product = inventory.find(p => p.id === item.product_id);
                                if (product) {
                                    const newStock = Math.max(0, product.stock - item.quantity);
                                    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
                                    if (error) throw error;
                                }
                            }

                            const { error: orderError } = await supabase.from('orders').update({ status }).eq('id', orderId);
                            if (orderError) throw orderError;
                        }

                        // Update Local State
                        const newInventory = inventory.map(product => {
                            const orderItem = order.items.find(i => i.product_id === product.id);
                            if (orderItem) {
                                return { ...product, stock: Math.max(0, product.stock - orderItem.quantity) };
                            }
                            return product;
                        });

                        set({
                            inventory: newInventory,
                            orders: orders.map(o => o.id === orderId ? { ...o, status } : o)
                        });

                    } catch (error) {
                        console.error("Failed to confirm order and update stock:", error);
                        throw error;
                    }
                    return;
                }

                // STOCK RESTORATION LOGIC
                if (status === 'cancelled' && order.status === 'completed') {
                    try {
                        if (session && isSupabaseConfigured) {
                            for (const item of order.items) {
                                const product = inventory.find(p => p.id === item.product_id);
                                if (product) {
                                    const { error } = await supabase.from('products').update({ stock: product.stock + item.quantity }).eq('id', item.product_id);
                                    if (error) throw error;
                                }
                            }
                            await supabase.from('orders').update({ status }).eq('id', orderId);
                        }

                        const newInventory = inventory.map(product => {
                            const orderItem = order.items.find(i => i.product_id === product.id);
                            if (orderItem) {
                                return { ...product, stock: product.stock + orderItem.quantity };
                            }
                            return product;
                        });

                        set({
                            inventory: newInventory,
                            orders: orders.map(o => o.id === orderId ? { ...o, status } : o)
                        });
                    } catch (error) {
                        console.error("Failed to restore stock:", error);
                        throw error;
                    }
                    return;
                }

                // Default status update (no stock logic)
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
            exitBuyerMode: async () => {
                const { session, isDemoMode } = get();
                set({ appMode: 'seller', shopOwnerId: null, inventory: [], categories: [] });
                // We clear inventory/categories because fetchInitialData will re-populate them for the seller
                if (session || isDemoMode) {
                    await get().fetchInitialData();
                }
            },
            setQRModalOpen: (open) => set({ isQRModalOpen: open }),
            setPromoBannerDismissed: (dismissed) => set({ isPromoBannerDismissed: dismissed }),

            updateSettings: (newSettings) => {
                set((state) => ({ settings: { ...state.settings, ...newSettings } }));
            },

            confirmOrderExternal: async (orderId: string, pin?: string) => {
                const { data, error } = await supabase.functions.invoke('confirm-order', {
                    body: { order_id: orderId, pin }
                });
                if (error) throw error;
                return data;
            },

            saveProfileSettings: async (newSettings) => {
                const { session, settings, activeDemoShopId } = get();
                const mergedSettings = { ...settings, ...newSettings };
                set({ settings: mergedSettings });

                if (session && isSupabaseConfigured) {
                    if (activeDemoShopId) {
                        // SAVE TO DEMO SHOP
                        const updates: any = { settings: mergedSettings };
                        if (newSettings.companyName) updates.name = newSettings.companyName;
                        if (newSettings.storeSlug) updates.slug = newSettings.storeSlug;
                        if (newSettings.whatsappNumber) updates.whatsapp_number = newSettings.whatsappNumber;
                        if (newSettings.primaryColor) updates.primary_color = newSettings.primaryColor;
                        if (newSettings.storeLogo) updates.logo_url = newSettings.storeLogo;
                        if (newSettings.storeDescription) updates.description = newSettings.storeDescription;

                        await supabase.from('demo_shops').update(updates).eq('id', activeDemoShopId);
                        get().fetchDemoShops();
                        return;
                    }

                    let saved = false;
                    let errorMessage = '';

                    // METHOD 1: Try Standard Profiles Table
                    try {
                        const updates: any = { updated_at: new Date().toISOString() };
                        if (newSettings.displayName) updates.display_name = newSettings.displayName;
                        if (newSettings.companyName) updates.company_name = newSettings.companyName;
                        if (newSettings.whatsappNumber !== undefined) updates.whatsapp_number = newSettings.whatsappNumber;
                        if (newSettings.whatsappTemplate) updates.whatsapp_template = newSettings.whatsappTemplate;
                        if (newSettings.storeSlug !== undefined) updates.store_slug = newSettings.storeSlug.trim().toLowerCase();
                        if (newSettings.primaryColor) updates.primary_color = newSettings.primaryColor;
                        if (newSettings.secondaryColor) updates.secondary_color = newSettings.secondaryColor;
                        if (newSettings.sellerPin) updates.seller_pin = newSettings.sellerPin;
                        
                        // Persist flags in the jsonb settings column
                        updates.settings = { 
                            whatsappEnabled: mergedSettings.whatsappEnabled,
                            showInventoryCount: mergedSettings.showInventoryCount
                        };

                        const { error } = await supabase.from('profiles').upsert({
                            id: session.user.id,
                            ...updates
                        });

                        if (error) errorMessage = error.message;
                    } catch (e) {
                        errorMessage = (e as any).message;
                    }

                    // ALWAYS save to Config Product to ensure custom fields (logo, colors, urls) persist
                    const configData = {
                        displayName: mergedSettings.displayName,
                        companyName: mergedSettings.companyName,
                        whatsappNumber: mergedSettings.whatsappNumber,
                        whatsappTemplate: mergedSettings.whatsappTemplate,
                        storeLogo: mergedSettings.storeLogo,
                        primaryColor: mergedSettings.primaryColor,
                        secondaryColor: mergedSettings.secondaryColor,
                        sellerPin: mergedSettings.sellerPin,
                        theme: mergedSettings.theme,       // ← ADDED: so public store loads the correct theme
                        instagramUrl: mergedSettings.instagramUrl,
                        facebookUrl: mergedSettings.facebookUrl,
                        websiteUrl: mergedSettings.websiteUrl,
                        storeDescription: mergedSettings.storeDescription,
                        currency: mergedSettings.currency,
                        taxRate: mergedSettings.taxRate
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
                            image_url: mergedSettings.storeLogo || DEFAULT_PRODUCT_IMAGE,
                            cost: 0
                        };

                        if (existing) {
                            await supabase.from('products').update(productPayload).eq('id', existing.id);
                        } else {
                            await supabase.from('products').insert({ id: crypto.randomUUID(), ...productPayload });
                        }
                    } catch (e) {
                        console.error("Config Product storage failed", e);
                        throw new Error(errorMessage || "Error guardando la configuración de tienda.");
                    }
                }
            },

            claimOffer: async () => {
                if (!get().checkAuth()) return;
                const { session } = get();
                set((state) => ({ settings: { ...state.settings, hasClaimedOffer: true, plan: 'growth' } }));
                if (session && isSupabaseConfigured) {
                    try { await supabase.from('claimed_offers').insert({ user_id: session.user.id, email: session.user.email, offer_type: 'growth_3_months_free', claimed_at: new Date().toISOString() }); } catch (err) { }
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
                    if (filters.stockBelow !== undefined && item.stock > filters.stockBelow) return false;
                    return true;
                });
            },

            confirmInStallPurchase: async () => {
                // Award 1 Morez point and 1 purchase count
                // In a production environment, this would increment valid counters in the DB
                console.log("MOREZ AWARDED: 1 point for in-person purchase.");
            },
            setShopOwnerId: (id) => set({ shopOwnerId: id }),
            randomizeInventory: async () => {
                if (!get().checkAuth()) return;
                const { inventory, session } = get();
                if (!session || !isSupabaseConfigured) return;
                
                const randomized = inventory.map(p => ({
                    ...p,
                    price: Math.floor(Math.random() * 490) + 10,
                    stock: Math.floor(Math.random() * 45) + 5
                }));
                
                set({ inventory: randomized });
                
                // Batch update in DB using upsert on conflict ID
                const dbUpdates = randomized.map(p => ({
                    id: p.id,
                    user_id: session.user.id,
                    price: p.price,
                    stock: p.stock
                }));
                
                const { error } = await supabase.from('products').upsert(dbUpdates, { onConflict: 'id' });
                if (error) console.error("Randomize failed:", error);
            },
            simulateRandomOrder: async () => {
                if (!get().checkAuth()) return;
                const { inventory, createOrder, session, shopOwnerId } = get();
                const available = inventory.filter(p => p.stock > 0);
                if (available.length === 0) {
                    alert("No hay productos con stock para simular un pedido.");
                    return;
                }
                
                // Ensure we have a target ID for the order
                const targetUserId = session?.user.id || shopOwnerId;
                if (!targetUserId) return;

                // Pick 1-3 random items
                const count = Math.floor(Math.random() * 3) + 1;
                const itemsToOrder = [];
                const shuffled = [...available].sort(() => 0.5 - Math.random());
                for (let i = 0; i < Math.min(count, shuffled.length); i++) {
                    itemsToOrder.push({ ...shuffled[i], quantity: 1 });
                }
                
                // Temporarily swap cart and shopOwnerId if needed
                const originalCart = get().cart;
                const originalShopId = get().shopOwnerId;
                
                set({ cart: itemsToOrder, shopOwnerId: targetUserId });
                
                const names = ["Juan Perez", "Maria Garcia", "Carlos Soto", "Elena Rivas", "Luis Vega"];
                const name = names[Math.floor(Math.random() * names.length)];
                
                try {
                    await createOrder({ name, phone: "51912345678" }, 'pending');
                    console.log("Simulated order created successfully.");
                } catch (e) {
                    console.error("Order simulation failed:", e);
                } finally {
                    // Restore original state (cart is cleared by createOrder, but we restore if it failed or for safety)
                    set({ shopOwnerId: originalShopId });
                }
            },
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
                shopOwnerId: state.shopOwnerId,
                activeDemoShopId: state.activeDemoShopId,
                activeDeveloperUserId: state.activeDeveloperUserId,
            }),
        }
    )
);
