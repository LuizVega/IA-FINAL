import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { AlertCircle, Package, TrendingUp, ChevronRight, Check, ShoppingBag, ExternalLink, Share2 } from 'lucide-react';
import { ProductImage } from '../ProductImage';
import { DEFAULT_PRODUCT_IMAGE, getPlanLimit, getPlanName } from '../../constants';

export const MobileStatsView: React.FC = () => {
    const { t } = useTranslation();
    const {
        inventory,
        orders = [],
        setCurrentView,
        setFilters,
        setSelectedProduct,
        setIsDetailsOpen,
        settings,
        isDemoMode
    } = useStore() as any;

    // Calc plan limits
    const PLAN_LIMIT = getPlanLimit(settings.plan);
    const usagePercentage = Math.min((inventory.length / PLAN_LIMIT) * 100, 100);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [timeFilter, setTimeFilter] = useState('1W');
    const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);

    // Calc simple metrics based on completed orders mapped from global config
    const completedSales = (orders as any[]).filter((order: any) => order.status === 'completed');
    const pendingOrders = (orders as any[]).filter((order: any) => order.status === 'pending');
    const totalRevenue = completedSales.reduce((sum: number, sale: any) => sum + (sale.totalTotal || sale.total_amount || 0), 0);
    const totalOrders = completedSales.length;

    // Generate chart data based on filter
    const chartData = useMemo(() => {
        const baseData = {
            '1D': [0.4, 0.5, 0.45, 0.6, 0.55, 0.7, 0.65, 0.8],
            '1W': [0.8, 0.6, 0.9, 0.5, 0.7, 0.3, 0.4, 0.2, 0.35],
            '1M': [0.3, 0.4, 0.35, 0.5, 0.45, 0.6, 0.55, 0.7, 0.65, 0.8],
            '1Y': [0.2, 0.35, 0.3, 0.5, 0.6, 0.4, 0.7, 0.8, 0.7, 0.9, 0.85, 1.0]
        };
        return baseData[timeFilter as keyof typeof baseData] || baseData['1W'];
    }, [timeFilter]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            if (!canvas.parentElement) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.parentElement.clientWidth * dpr;
            canvas.height = canvas.parentElement.clientHeight * dpr;
            canvas.style.width = `${canvas.parentElement.clientWidth}px`;
            canvas.style.height = `${canvas.parentElement.clientHeight}px`;
            drawChart();
        };

        const drawChart = () => {
            const w = canvas.width;
            const h = canvas.height;
            const dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);

            // Background Glow for Touch
            if (touchPos) {
                const rect = canvas.getBoundingClientRect();
                const tx = (touchPos.x - rect.left) * dpr;
                const ty = (touchPos.y - rect.top) * dpr;

                const radialGradient = ctx.createRadialGradient(tx, ty, 0, tx, ty, 100 * dpr);
                radialGradient.addColorStop(0, 'rgba(50, 215, 75, 0.15)');
                radialGradient.addColorStop(1, 'rgba(50, 215, 75, 0)');
                ctx.fillStyle = radialGradient;
                ctx.fillRect(0, 0, w, h);

                // Vertical Line
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.setLineDash([5 * dpr, 5 * dpr]);
                ctx.moveTo(tx, 0);
                ctx.lineTo(tx, h);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Main Line
            ctx.strokeStyle = '#32D74B';
            ctx.lineWidth = 4 * dpr;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const step = w / (chartData.length - 1);

            ctx.beginPath();
            ctx.moveTo(0, h - (chartData[0] * h * 0.7) - (h * 0.15));

            for (let i = 0; i < chartData.length - 1; i++) {
                const x1 = i * step;
                const y1 = h - (chartData[i] * h * 0.7) - (h * 0.15);
                const x2 = (i + 1) * step;
                const y2 = h - (chartData[i + 1] * h * 0.7) - (h * 0.15);
                const cp1x = x1 + (x2 - x1) / 2;
                ctx.bezierCurveTo(cp1x, y1, cp1x, y2, x2, y2);
            }

            // Drop Shadow for the line
            ctx.shadowBlur = 15 * dpr;
            ctx.shadowColor = 'rgba(50, 215, 75, 0.5)';
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Area Gradient
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, 'rgba(50, 215, 75, 0.2)');
            gradient.addColorStop(1, 'rgba(50, 215, 75, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Interactive Line Illumination (No bolita)
            if (touchPos) {
                const rect = canvas.getBoundingClientRect();
                const tx = (touchPos.x - rect.left) * dpr;
                const idx = Math.round(tx / step);

                if (chartData[idx] !== undefined) {
                    // Draw a highlighted segment
                    const range = 1; // Highlight neighbor points too
                    const startIdx = Math.max(0, idx - range);
                    const endIdx = Math.min(chartData.length - 1, idx + range);

                    ctx.beginPath();
                    ctx.strokeStyle = '#FFFFFF'; // Bright highlight
                    ctx.lineWidth = 6 * dpr;
                    ctx.shadowBlur = 20 * dpr;
                    ctx.shadowColor = '#32D74B';

                    const startX = startIdx * step;
                    const startY = h - (chartData[startIdx] * h * 0.7) - (h * 0.15);
                    ctx.moveTo(startX, startY);

                    for (let i = startIdx; i < endIdx; i++) {
                        const x1 = i * step;
                        const y1 = h - (chartData[i] * h * 0.7) - (h * 0.15);
                        const x2 = (i + 1) * step;
                        const y2 = h - (chartData[i + 1] * h * 0.7) - (h * 0.15);
                        const cp1x = x1 + (x2 - x1) / 2;
                        ctx.bezierCurveTo(cp1x, y1, cp1x, y2, x2, y2);
                    }
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [chartData, touchPos]);

    const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setTouchPos({ x: clientX, y: clientY });
    };

    const handleViewAllAttention = () => {
        // Filter inventory for items needing attention (stock <= 5)
        setFilters({
            categories: [],
            minPrice: '',
            maxPrice: '',
            tags: [],
            stockBelow: 5
        });
        setCurrentView('all-items' as any); // Navigate to inventory view to show filtered items
    };

    const handleAttentionItemClick = (item: any) => {
        setFilters({
            categories: [],
            minPrice: '',
            maxPrice: '',
            tags: [],
            stockBelow: undefined
        });
        setSelectedProduct(item);
        setIsDetailsOpen(true);
        setCurrentView('all-items' as any);
    };

    // Filter products requiring attention (low stock)
    const attentionNeeded = (inventory as any[]).filter((i: any) => i.stock > 0 && i.stock <= 5).slice(0, 3);
    const noStock = (inventory as any[]).filter((i: any) => i.stock === 0).slice(0, 2);
    const combinedAttention = [...noStock, ...attentionNeeded].slice(0, 3);

    return (
        <div className="p-4 pb-24 bg-black text-white min-h-screen font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 pt-4">
                <div className="flex flex-col">
                    <span className="text-gray-400 text-sm font-medium">{t('dashboard.overview')}</span>
                    <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.analytics')}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/store/${useStore.getState().session?.user.id}`;
                            window.open(url, '_blank');
                        }}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                        title="Ver Tienda"
                    >
                        <ExternalLink size={20} />
                    </button>
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/store/${useStore.getState().session?.user.id}`;
                            if (navigator.share) {
                                navigator.share({
                                    title: 'Mi Tienda en MyMorez',
                                    url: url
                                }).catch(() => { });
                            } else {
                                navigator.clipboard.writeText(url);
                                alert('Enlace copiado al portapapeles');
                            }
                        }}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                        title="Compartir"
                    >
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentView('profile' as any)}
                        className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-[#2C2C2E] flex flex-shrink-0 items-center justify-center overflow-hidden active:scale-95 transition-transform"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                        </svg>
                    </button>
                </div>
            </header>


            <main className="space-y-6">
                {/* Sales Activity */}
                <section>
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#32D74B]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">{t('dashboard.salesActivity')}</h2>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold tracking-tight">${totalRevenue.toLocaleString()}</span>
                                    <div className="flex items-center text-[#32D74B] text-sm font-bold bg-[#32D74B]/10 px-2 py-0.5 rounded-full">
                                        <TrendingUp size={12} className="mr-1" />
                                        14%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Interaction Area */}
                        <div
                            className="h-48 mt-4 relative touch-none"
                            onTouchStart={handleTouch}
                            onTouchMove={handleTouch}
                            onTouchEnd={() => setTouchPos(null)}
                            onMouseMove={handleTouch}
                            onMouseLeave={() => setTouchPos(null)}
                        >
                            <canvas ref={canvasRef} className="w-full h-full"></canvas>
                        </div>

                        {/* Time Filters - Trading Style */}
                        <div className="flex justify-between items-center mt-6 p-1 bg-black/40 rounded-2xl border border-white/5">
                            {['1D', '1W', '1M', '1Y'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setTimeFilter(filter)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${timeFilter === filter ? 'bg-[#32D74B] text-black shadow-lg shadow-[#32D74B]/20' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Metrics Grid */}
                <section className="grid grid-cols-2 gap-4">
                    {/* Orders Block */}
                    <button
                        onClick={() => setCurrentView('orders' as any)}
                        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[32px] p-6 flex flex-col items-start justify-between shadow-xl active:scale-[0.98] transition-all relative overflow-hidden text-left aspect-square"
                    >
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.totalOrders') || 'Pedidos'}</span>
                            <span className="text-4xl font-black text-white">{totalOrders}</span>
                        </div>
                        <div className="text-[#32D74B] text-xs font-bold flex items-center gap-1 bg-[#32D74B]/10 px-2 py-1 rounded-lg">
                            <TrendingUp size={12} />
                            +8%
                        </div>
                    </button>

                    {/* Financial Report Block */}
                    <button
                        onClick={() => setCurrentView('financial-health' as any)}
                        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[32px] p-6 shadow-xl flex flex-col items-start justify-between hover:bg-white/5 transition-colors group active:scale-[0.98] aspect-square"
                    >
                        <div className="w-12 h-12 bg-[#32D74B]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                            <svg className="w-6 h-6 text-[#32D74B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </div>
                        <span className="text-white font-bold text-sm leading-tight">{t('dashboard.viewFinancialReport') || 'Reporte Financiero'}</span>
                    </button>
                </section>

                {/* Attention Needed */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-xl font-bold tracking-tight text-white">{t('dashboard.attentionNeeded') || 'Attention Needed'}</h2>
                        <button onClick={handleViewAllAttention} className="text-[#32D74B] text-sm font-bold active:opacity-60 transition-opacity">
                            View All
                        </button>
                    </div>
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl overflow-hidden shadow-2xl divide-y divide-[#2C2C2E]">
                        {combinedAttention.length > 0 ? combinedAttention.map((item: any) => (
                            <div
                                key={item.id}
                                onClick={() => handleAttentionItemClick(item)}
                                className="flex items-center p-4 hover:bg-white/5 transition-colors active:bg-white/10 group cursor-pointer"
                            >
                                {/* Product Image Placeholder - Squared */}
                                <div className="w-14 h-14 bg-black rounded-2xl border border-white/10 flex items-center justify-center mr-4 overflow-hidden flex-shrink-0 group-hover:border-[#32D74B]/30 transition-colors">
                                    <ProductImage
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate text-base mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded-md ${item.stock === 0 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            <AlertCircle size={12} />
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {item.stock === 0 ? (t('dashboard.outOfStock') || 'Out of stock') : `${t('dashboard.lowStock') || 'Low stock'} • ${item.stock} ${t('dashboard.left') || 'left'}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-lg font-bold text-white">${item.price?.toFixed(0) || '0'}</p>
                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${item.stock === 0 ? 'text-red-500 bg-red-500/10' : 'text-orange-500 bg-orange-500/10'}`}>
                                        Urgent
                                    </span>
                                </div>
                                <ChevronRight size={16} className="text-gray-700 ml-3" />
                            </div>
                        )) : (
                            <div className="flex items-center p-8 justify-center text-gray-500 flex-col gap-2">
                                <div className="w-16 h-16 bg-[#32D74B]/5 rounded-full flex items-center justify-center">
                                    <Check size={32} className="text-[#32D74B]/20" />
                                </div>
                                <span className="text-sm font-medium">{t('dashboard.everythingInOrder') || 'Todo está en orden'}</span>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};
