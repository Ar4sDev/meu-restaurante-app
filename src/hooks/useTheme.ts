import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pdv_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('pdv_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pdv_theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(v => !v) };
}
