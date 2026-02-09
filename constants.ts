
import { CategoryConfig, Product, Folder } from './types';

export const DEFAULT_PRODUCT_IMAGE = "https://media.discordapp.net/attachments/1392377430030811289/1463700082569384088/6ddd4d21-c0ac-4e20-bdfa-25cac7771684.png?ex=6989daad&is=6988892d&hm=72307170afa7d97c95d292f48922f552c388467f99df61724900bcb2f2acb910&=&format=webp&quality=lossless";

// User starts with NO categories
export const INITIAL_CATEGORIES: CategoryConfig[] = [];

// Start with empty inventory
export const MOCK_INVENTORY: Product[] = [];

// Start with empty folders
export const MOCK_FOLDERS: Folder[] = [];
