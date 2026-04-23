import { createContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'frvstream-theme';
const DEFAULT_THEME = 'dark';

export const ThemeContext = createContext({
    theme: DEFAULT_THEME,
    toggleTheme: () => {},
    setTheme: () => {}
});

const applyThemeAttribute = (theme) => {
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.setAttribute('data-theme', theme);
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') {
            return DEFAULT_THEME;
        }
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
    });

    useEffect(() => {
        applyThemeAttribute(theme);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, theme);
        }
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
            setTheme
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
