
import { CategoryConfig, Product, Folder } from './types';

export const DEFAULT_PRODUCT_IMAGE = "LOGO_PLACEHOLDER";

export const APP_LOGO = "/Logo_Exo.jpeg";

// Global Limits
export const FREE_PLAN_LIMIT = 50;
export const GROWTH_PLAN_LIMIT = 2000;
export const BUSINESS_PLAN_LIMIT = 30000; // Large number for progress bars

export const getPlanLimit = (plan: string = 'starter') => {
    switch (plan) {
        case 'growth': return GROWTH_PLAN_LIMIT;
        case 'business': return BUSINESS_PLAN_LIMIT;
        default: return FREE_PLAN_LIMIT;
    }
};

export const getPlanName = (plan: string = 'starter') => {
    switch (plan) {
        case 'growth': return 'Growth';
        case 'business': return 'Business';
        default: return 'Starter';
    }
};

// User starts with NO categories
export const INITIAL_CATEGORIES: CategoryConfig[] = [];

// Start with empty inventory
export const MOCK_INVENTORY: Product[] = [];

// Start with empty folders
export const MOCK_FOLDERS: Folder[] = [];
