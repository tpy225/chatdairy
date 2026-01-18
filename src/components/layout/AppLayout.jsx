import React from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import MobileLayout from './MobileLayout';
import DesktopLayout from './DesktopLayout';
import { LayoutProvider } from './LayoutContext';

export default function AppLayout() {
  const isMobile = useIsMobile();

  if (isMobile === undefined) return null;

  return (
    <LayoutProvider>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </LayoutProvider>
  );
}
