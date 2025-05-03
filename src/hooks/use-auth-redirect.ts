import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

/**
 * Hook to handle authentication redirects
 * - If requireAuth is true, redirects to login if not authenticated
 * - If requireAuth is false, redirects to dashboard if authenticated
 */
export const useAuthRedirect = (requireAuth: boolean = true) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      router.push('/live');
    }
  }, [isAuthenticated, requireAuth, router]);
  
  return { isAuthenticated };
};