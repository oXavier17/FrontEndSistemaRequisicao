import { useState, useEffect } from 'react';

export function useTheme() {
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('tema') ?? 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (tema === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('tema', tema);
  }, [tema]);

  const toggleTema = () => setTema(t => t === 'dark' ? 'light' : 'dark');

  return { tema, toggleTema };
}