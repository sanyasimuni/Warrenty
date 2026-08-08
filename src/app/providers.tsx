'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { RealtimeProvider } from '@/lib/realtime-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RealtimeProvider>
        {children}
      </RealtimeProvider>
    </AuthProvider>
  );
}
