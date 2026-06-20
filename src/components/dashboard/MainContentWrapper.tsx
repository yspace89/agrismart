'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/update-password'].some(p => pathname.startsWith(p));

  return (
    <main className={cn(
      "flex-1 overflow-y-auto",
      !isAuthPage && "pb-24 md:pb-0 px-4 md:px-8 py-6"
    )}>
      {children}
    </main>
  );
}
