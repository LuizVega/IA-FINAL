import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../../store';
import { X, ScanLine } from 'lucide-react';

export const MobileScannerView: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [flash, setFlash] = useState(false);
    const [scanning, setScanning] = useState(true);

    const { setScannerOpen, setCapturedImage, setAddProductModalOpen } = useStore() as any;

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
                alert("No se pudo acceder a la cámara. Por favor, revisa los permisos.");
                handleClose();
            }
        };
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleClose = () => {
        setScannerOpen(false);
    };

    const handleCapture = () => {
        if (!videoRef.current) return;

        // Visual flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 150);

        setScanning(false);

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

            // Set the captured image in the store
            setCapturedImage(dataUrl);

            // Wait a moment for visual feedback, then close scanner and open modal
            setTimeout(() => {
                setScannerOpen(false);
                setAddProductModalOpen(true);
            }, 500);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <style>
                {`
                  @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                  .animate-scan-laser {
                    animation: scan 2.5s ease-in-out infinite;
                  }
                `}
            </style>

            {/* Camera Video Stream */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                onPlaying={() => setIsReady(true)}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Flash Effect */}
            {flash && (
                <div className="absolute inset-0 bg-white z-[110] animate-in fade-out duration-300" />
            )}

            {/* Visual Overlays for "Computer Vision" Effect */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Dark overlay with transparent center */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Scanning Target Area */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 box-border z-10">
                    {/* The cutout box */}
                    <div className="absolute inset-0 ring-[9999px] ring-black/50 rounded-3xl" />

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-500 rounded-tl-3xl opacity-90" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-500 rounded-tr-3xl opacity-90" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-500 rounded-bl-3xl opacity-90" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-500 rounded-br-3xl opacity-90" />

                    {/* Scanning Laser Line */}
                    {scanning && (
                        <div className="absolute left-0 w-full h-0.5 bg-green-400 shadow-[0_0_15px_3px_rgba(74,222,128,0.7)] animate-scan-laser" />
                    )}
                </div>
            </div>

            {/* Header / Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={handleClose}
                    className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform"
                >
                    <X size={24} />
                </button>
                <div className="flex gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <ScanLine size={18} className="text-green-400 animate-pulse" />
                    <span className="text-xs font-medium text-white tracking-wider">VISIÓN IA</span>
                </div>
                <div className="w-10 h-10" /> {/* Spacer */}
            </div>

            {/* Instructions */}
            <div className="absolute top-32 left-0 right-0 px-6 text-center z-20">
                <p className="text-white font-medium text-sm bg-black/50 backdrop-blur-md inline-block px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
                    {scanning ? "Enfoca el producto desde diferentes ángulos" : "Procesando imagen..."}
                </p>
            </div>

            {/* Footer / Capture Button */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center gap-6 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-safe">
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleCapture}
                        disabled={!isReady || !scanning}
                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${!isReady || !scanning
                                ? "border-gray-500 bg-gray-600/50"
                                : "border-green-400 bg-green-500/20 active:scale-90 active:bg-green-500/40"
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-full transition-colors ${!isReady || !scanning ? "bg-gray-400" : "bg-white"}`} />
                    </button>
                    <span className="text-xs font-bold text-white tracking-widest uppercase mt-2">
                        Analizar
                    </span>
                </div>
            </div>
        </div >
    );
};
