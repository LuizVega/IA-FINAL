import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar si la pantalla actual es de tamaño móvil.
 * Por defecto usa un breakpoint de 768px (coincidente con el md de Tailwind).
 */
export const useIsMobile = (breakpoint: number = 768) => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        // Función para revisar el ancho de la ventana
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= breakpoint);
        };

        // Revisar al montar
        checkIsMobile();

        // Agregar event listener para cambios de tamaño de ventana
        window.addEventListener('resize', checkIsMobile);

        // Limpiar event listener
        return () => window.removeEventListener('resize', checkIsMobile);
    }, [breakpoint]);

    return isMobile;
};
