'use client';

import { useEffect } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useTheme } from '@/hooks/use-theme';

export default function LoginPage() {
  // Redirect to dashboard if already authenticated
  useAuthRedirect(false);
  
  // Apply theme
  useTheme();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">IPTV Platform</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access your content
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}