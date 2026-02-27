import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store';
import { X, RotateCcw, Check, Minus, Plus, Zap } from 'lucide-react';

// ─────────────────────────────────────────────
// MANUAL ENTRY FORM (after capture)
// ─────────────────────────────────────────────
interface ManualFormProps {
    imageDataUrl: string;
    onPublish: (name: string, price: string, stock: number) => void;
    onRetry: () => void;
}

const ManualForm: React.FC<ManualFormProps> = ({ imageDataUrl, onPublish, onRetry }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState(1);
    const [publishing, setPublishing] = useState(false);

    const handlePublish = () => {
        if (!name.trim() || !price) return;
        setPublishing(true);
        setTimeout(() => onPublish(name, price, stock), 400);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col font-sans">
            {/* Photo — top */}
            <div className="relative" style={{ height: '42vh' }}>
                <img src={imageDataUrl} alt="Producto" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <button
                    onClick={onRetry}
                    className="absolute top-12 left-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all"
                >
                    <RotateCcw size={18} className="text-white" />
                </button>
                <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                    <p className="text-white/60 text-xs font-bold">Nueva subida</p>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 space-y-4 bg-[#0a0a0a]">

                {/* Name */}
                <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">
                        Nombre del producto
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ej. Pulsera artesanal..."
                        autoFocus
                        className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-4 py-3.5 text-white font-medium outline-none text-base transition-colors placeholder-white/20"
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-1.5 block">
                        Precio de venta
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-black text-lg">S/</span>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder="0"
                            className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-4 py-3.5 pl-10 text-white font-black text-2xl outline-none transition-colors"
                            inputMode="decimal"
                        />
                    </div>
                </div>

                {/* Stock */}
                <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-2 block">
                        Cantidad disponible
                    </label>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                        <button
                            onClick={() => setStock(s => Math.max(0, s - 1))}
                            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all"
                        >
                            <Minus size={16} className="text-white" />
                        </button>
                        <span className="flex-1 text-center text-white font-black text-2xl">{stock}</span>
                        <button
                            onClick={() => setStock(s => s + 1)}
                            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all"
                        >
                            <Plus size={16} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Publish */}
                <div className="pt-3 pb-6">
                    <button
                        onClick={handlePublish}
                        disabled={publishing || !name.trim() || !price}
                        className="w-full py-4 bg-green-500 text-black font-black text-lg rounded-2xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
                    >
                        {publishing ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                Publicando...
                            </span>
                        ) : (
                            <><Check size={20} /> Publicar al catálogo</>
                        )}
                    </button>
                    <p className="text-white/15 text-[10px] text-center font-bold mt-2">El producto quedará visible en tu tienda</p>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// MAIN SCANNER VIEW — Full Screen Camera
// ─────────────────────────────────────────────
export const MobileScannerView: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [flash, setFlash] = useState(false);
    const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);

    const { setScannerOpen, setCapturedImage, setAddProductModalOpen } = useStore() as any;

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch {
                alert('No se pudo acceder a la cámara. Revisa los permisos.');
                setScannerOpen(false);
            }
        };
        startCamera();
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
    }, []);

    const handleClose = () => setScannerOpen(false);

    const handleCapture = useCallback(() => {
        if (!videoRef.current || !isReady) return;
        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedDataUrl(dataUrl);
    }, [isReady]);

    const handlePublish = (name: string, price: string, stock: number) => {
        if (capturedDataUrl) setCapturedImage(capturedDataUrl);
        setScannerOpen(false);
        setTimeout(() => {
            (window as any).__manualProduct = { name, price, stock };
            setAddProductModalOpen(true);
        }, 50);
    };

    if (capturedDataUrl) {
        return (
            <ManualForm
                imageDataUrl={capturedDataUrl}
                onPublish={handlePublish}
                onRetry={() => setCapturedDataUrl(null)}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black">
            <style>{`
                @keyframes laser-scan {
                    0%   { top: 0%;   opacity: 0; }
                    5%   { opacity: 1; }
                    95%  { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .laser-line {
                    animation: laser-scan 2.5s ease-in-out infinite;
                }
            `}</style>

            <canvas ref={canvasRef} className="hidden" />

            {/* Full-screen camera */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                onPlaying={() => setIsReady(true)}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Flash */}
            {flash && <div className="absolute inset-0 bg-white z-[130] pointer-events-none animate-pulse" />}

            {/* Laser scan line */}
            {isReady && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="laser-line absolute left-0 w-full h-[2px] bg-green-400"
                        style={{ boxShadow: '0 0 12px 4px rgba(74,222,128,0.7), 0 0 40px 12px rgba(74,222,128,0.3)' }}
                    />
                </div>
            )}

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)' }}
            />

            {/* Center brackets */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-56 h-56">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-xl" />
                </div>
            </div>

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 pt-14 pb-6 px-5 flex justify-between items-center z-20 bg-gradient-to-b from-black/70 to-transparent">
                <button
                    onClick={handleClose}
                    className="w-11 h-11 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all"
                >
                    <X size={22} className="text-white" />
                </button>
                <div className="bg-black/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                    <span className="text-white text-xs font-black tracking-wider">NUEVA SUBIDA</span>
                </div>
                <div className="w-11" />
            </div>

            {/* Hint */}
            {isReady && (
                <div className="absolute top-1/3 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full">
                        <p className="text-white/70 text-sm font-bold">Apunta al producto y captura</p>
                    </div>
                </div>
            )}

            {/* Shutter */}
            <div className="absolute bottom-0 left-0 right-0 pb-14 pt-8 px-8 flex flex-col items-center gap-5 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <button
                    onClick={handleCapture}
                    disabled={!isReady}
                    className={`relative w-24 h-24 rounded-full transition-all active:scale-90 ${!isReady ? 'opacity-40' : ''}`}
                >
                    <div className="absolute inset-0 rounded-full border-4 border-white" />
                    <div className="absolute inset-2 rounded-full bg-white" />
                    {!isReady && (
                        <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                    )}
                </button>
                <p className="text-white/50 text-xs font-black uppercase tracking-widest">
                    {isReady ? 'Toca para capturar' : 'Iniciando cámara...'}
                </p>
            </div>
        </div>
    );
};
