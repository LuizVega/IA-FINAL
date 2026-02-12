
import { CategoryConfig, Product, Folder } from './types';

export const DEFAULT_PRODUCT_IMAGE = "LOGO_PLACEHOLDER";

export const APP_LOGO = "/Logo_Exo.jpeg";

// Global Limits
export const FREE_PLAN_LIMIT = 75;

// User starts with NO categories
export const INITIAL_CATEGORIES: CategoryConfig[] = [];

// Start with empty inventory
export const MOCK_INVENTORY: Product[] = [];

// Start with empty folders
export const MOCK_FOLDERS: Folder[] = [];
