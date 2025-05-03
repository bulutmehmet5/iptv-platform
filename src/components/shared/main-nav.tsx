'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Tv, 
  Film, 
  Clapperboard, 
  User, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

const navItems = [
  {
    title: 'Live TV',
    href: '/live',
    icon: Tv,
  },
  {
    title: 'Movies',
    href: '/movies',
    icon: Film,
  },
  {
    title: 'Series',
    href: '/series',
    icon: Clapperboard,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userSession } = useAuthStore();
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="flex md:hidden items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>
      
      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href || pathname?.startsWith(`${item.href}/`)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.title}
          </Link>
        ))}
      </nav>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background pt-16">
          <nav className="flex flex-col p-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-lg font-medium p-3 rounded-md transition-colors hover:bg-accent",
                  pathname === item.href || pathname?.startsWith(`${item.href}/`)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.title}
              </Link>
            ))}
            
            {userSession && (
              <div className="mt-auto pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium">{userSession.username}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Expires: {new Date(userSession.expDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}