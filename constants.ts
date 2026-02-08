import { CategoryConfig, Product } from './types';

export const INITIAL_CATEGORIES: CategoryConfig[] = [
  { id: 'cat_1', name: 'Ferretería', prefix: 'FER', margin: 0.35, color: 'bg-orange-50 text-orange-700 border-orange-100', isInternal: false },
  { id: 'cat_2', name: 'Farmacia', prefix: 'FAR', margin: 0.45, color: 'bg-green-50 text-green-700 border-green-100', isInternal: false },
  { id: 'cat_3', name: 'Autopartes', prefix: 'AUT', margin: 0.30, color: 'bg-blue-50 text-blue-700 border-blue-100', isInternal: false },
  { id: 'cat_4', name: 'Electrónica', prefix: 'ELE', margin: 0.25, color: 'bg-purple-50 text-purple-700 border-purple-100', isInternal: false },
  { id: 'cat_5', name: 'Hogar', prefix: 'HOG', margin: 0.40, color: 'bg-pink-50 text-pink-700 border-pink-100', isInternal: false },
  { id: 'cat_6', name: 'General', prefix: 'GEN', margin: 0.30, color: 'bg-gray-50 text-gray-700 border-gray-100', isInternal: false },
  { id: 'cat_7', name: 'Uso Interno', prefix: 'INT', margin: 0.00, color: 'bg-slate-100 text-slate-600 border-slate-200', isInternal: true },
];

export const MOCK_INVENTORY: Product[] = [
  {
    id: '1',
    name: 'Válvula de Bola de Latón 1"',
    brand: 'Truper',
    category: 'Ferretería',
    sku: 'FER-VAL-LAT-001',
    cost: 12.50,
    price: 16.88,
    stock: 45,
    imageUrl: 'https://picsum.photos/200/200?random=1',
    createdAt: new Date().toISOString(),
    confidence: 0.98,
    description: 'Válvula de bola de latón resistente para control de agua.',
    folderId: null,
    tags: []
  },
  {
    id: '2',
    name: 'Aceite Sintético Motor 5W-30',
    brand: 'Castrol',
    category: 'Autopartes',
    sku: 'AUT-ACE-SIN-002',
    cost: 25.00,
    price: 32.50,
    stock: 12,
    imageUrl: 'https://picsum.photos/200/200?random=2',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    confidence: 0.95,
    description: 'Aceite de motor totalmente sintético para motores modernos.',
    folderId: null,
    tags: ['Promo']
  },
  {
    id: '3',
    name: 'Tornillo Expansivo 3/8',
    category: 'Ferretería',
    sku: 'FER-TOR-EXP-003',
    cost: 0.50,
    price: 0.80,
    stock: 500,
    imageUrl: 'https://picsum.photos/200/200?random=3',
    createdAt: new Date(Date.now() - 100000000).toISOString(),
    confidence: 0.90,
    description: 'Tornillo de expansión para concreto.',
    folderId: null,
    tags: []
  }
];
