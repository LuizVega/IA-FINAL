import { useStore } from '../store';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

type Dictionary = typeof es;
type SectionKeys = keyof Dictionary;

export const useTranslation = () => {
    const language = useStore(state => state.language);

    const dic: Dictionary = language === 'es' ? es : en;

    const t = (keyPath: string, replacements?: Record<string, string | number>) => {
        const keys = keyPath.split('.');
        let value: any = dic;

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                console.warn(`Translation key not found: ${keyPath}`);
                return keyPath;
            }
        }

        let translation = value as string;

        if (replacements && typeof translation === 'string') {
            Object.keys(replacements).forEach(key => {
                translation = translation.replace(`{${key}}`, String(replacements[key]));
            });
        }

        return translation;
    };

    return { t, language };
};
