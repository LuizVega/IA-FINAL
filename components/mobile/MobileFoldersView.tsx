import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Plus, Monitor, Shirt, Home, ShoppingBasket, PenTool, Folder as FolderIcon } from 'lucide-react';

interface MobileFoldersViewProps {
    onEditFolder: (id: string) => void;
    onAddFolder: () => void;
}

export const MobileFoldersView: React.FC<MobileFoldersViewProps> = ({ onEditFolder, onAddFolder }) => {
    const { t } = useTranslation();
    const {
        folders,
        inventory,
        currentFolderId,
        setCurrentFolder,
        searchQuery,
        setSearchQuery,
    } = useStore() as any;

    // Mapping icons dynamically based on name (very basic implementation for presentation)
    const getIconForFolder = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('electrónica') || lowerName.includes('tech')) return <Monitor size={28} />;
        if (lowerName.includes('ropa') || lowerName.includes('apparel')) return <Shirt size={28} />;
        if (lowerName.includes('hogar') || lowerName.includes('home')) return <Home size={28} />;
        if (lowerName.includes('alimento') || lowerName.includes('food')) return <ShoppingBasket size={28} />;
        if (lowerName.includes('herramienta') || lowerName.includes('tool')) return <PenTool size={28} />;
        return <FolderIcon size={28} />;
    };

    // Derived state for display
    const displayFolders = useMemo(() => {
        let result = folders.filter((f: any) => f.parentId === currentFolderId);
        if (searchQuery) {
            result = folders.filter((f: any) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return result;
    }, [folders, currentFolderId, searchQuery]);

    // Derived counts
    const getProductCount = (folderId: string) => {
        return inventory.filter((item: any) => item.folderId === folderId).length;
    };

    return (
        <div className="bg-[#000000] font-sans text-[#FFFFFF] min-h-screen flex flex-col pt-4">

            <header className="px-6 pb-4 flex justify-between items-end">
                <h1 className="text-4xl font-bold tracking-tight text-[#FFFFFF]">{t('nav.categories') || 'Categorías'}</h1>
                <button
                    onClick={onAddFolder}
                    className="bg-[#32D74B] hover:bg-[#32D74B]/90 text-black w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-[#32D74B]/20"
                >
                    <Plus size={24} className="font-bold" />
                </button>
            </header>

            <div className="px-6 py-4">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#32D74B] transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#232323]/60 focus:ring-1 focus:ring-[#32D74B] border border-white/5 focus:border-transparent text-[#FFFFFF] placeholder:text-slate-500 transition-all outline-none"
                        placeholder={t('dashboard.searchPlaceholderCategories') || 'Buscar categorías...'}
                        type="text"
                    />
                </div>
            </div>

            <main className="flex-1 px-6 py-2 space-y-4 overflow-y-auto pb-32">

                {currentFolderId && (
                    <div
                        onClick={() => setCurrentFolder(null)}
                        className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all border border-white/5"
                    >
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[#FFFFFF]">{t('dashboard.backToHome') || 'Volver al inicio'}</h3>
                        </div>
                    </div>
                )}

                {displayFolders.map((folder: any) => (
                    <div
                        key={folder.id}
                        onClick={() => onEditFolder(folder.id)}
                        className="bg-[#191919]/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all border border-white/5"
                    >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${folder.color ? folder.color : 'bg-[#32D74B]/10 text-[#32D74B]'}`}>
                            {getIconForFolder(folder.name)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[#FFFFFF]">{folder.name}</h3>
                            <p className="text-[#C0C0C0] text-sm">{getProductCount(folder.id)} {t('dashboard.productsCount') || 'productos'}</p>
                        </div>
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                ))}

                {displayFolders.length === 0 && (
                    <div className="text-center py-10 text-white/40">
                        {t('dashboard.noCategoriesFound') || 'No se encontraron categorías.'}
                    </div>
                )}
            </main>

            {/* Note: The bottom navigation provided in HTML is rendered at MobileDashboard level, we omit it inside this view component to avoid duplication */}
        </div>
    );
};
