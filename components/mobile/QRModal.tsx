import React, { useState } from 'react';
import { useStore } from '../../store';
import { X, QrCode, Download, Share2, Copy, Check, ExternalLink } from 'lucide-react';

export const QRModal: React.FC = () => {
    const { isQRModalOpen, setQRModalOpen, settings, session } = useStore() as any;
    const [copied, setCopied] = useState(false);

    if (!isQRModalOpen) return null;

    const storeUrl = `${window.location.origin}/store/${session?.user?.id || 'demo'}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}&bgcolor=FFFFFF&color=000000&margin=0`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(storeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: settings.companyName || 'Mi Tienda MyMorez',
                    text: '¡Escanea mi QR o visita mi catálogo!',
                    url: storeUrl
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            handleCopyLink();
        }
    };

    const handleDownload = () => {
        // Create an invisible link to download the QR image
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `QR-Tienda-${settings.companyName || 'MyMorez'}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setQRModalOpen(false)}
        >
            <div
                className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-[40px] shadow-2xl p-8 relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Background Glow */}
                <div
                    className="absolute -top-24 -left-24 w-64 h-64 blur-[100px] opacity-20 rounded-full pointer-events-none"
                    style={{ backgroundColor: settings.primaryColor || '#22c55e' }}
                ></div>

                <button
                    onClick={() => setQRModalOpen(false)}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                        <QrCode size={32} style={{ color: settings.primaryColor || '#22c55e' }} />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Tu Pasaporte Digital</h2>
                    <p className="text-white/40 text-sm mb-8 px-4">
                        Muestra este QR a tus clientes para capturarlos y recibir pedidos.
                    </p>

                    {/* QR Code Container */}
                    <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-black/50 mb-8 border-4 border-white/10 group active:scale-95 transition-transform duration-300">
                        <img
                            src={qrUrl}
                            alt="QR Tienda"
                            className="w-56 h-56"
                            crossOrigin="anonymous"
                        />
                    </div>

                    <div className="w-full space-y-3">
                        <button
                            onClick={handleShare}
                            style={{ backgroundColor: settings.primaryColor || '#22c55e' }}
                            className="w-full py-4 rounded-2xl text-black font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                            <Share2 size={20} />
                            Compartir QR
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleDownload}
                                className="py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-white/10"
                            >
                                <Download size={18} />
                                Descargar
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-white/10"
                            >
                                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                {copied ? "Copiado" : "Link"}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => window.open(storeUrl, '_blank')}
                        className="mt-8 text-white/30 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
                    >
                        <ExternalLink size={12} />
                        Tienda: {session?.user?.id?.slice(0, 8) || 'demo'}...
                    </button>
                </div>
            </div>
        </div>
    );
};
