import { useTheme as useNextTheme } from 'next-themes';

/**
 * Hook to get and set the active theme
 * @returns Theme context with theme and setTheme
 */
export function useTheme() {
  const { theme, setTheme } = useNextTheme();

  return {
    theme: theme as 'light' | 'dark' | 'system',
    setTheme,
  };
}