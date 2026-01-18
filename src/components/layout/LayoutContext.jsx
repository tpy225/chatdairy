import React, { createContext, useContext, useState } from 'react';

const LayoutContext = createContext({
  isSidebarCollapsed: false,
  toggleSidebar: () => {},
  isRightSidebarOpen: false,
  setRightSidebarOpen: () => {},
  toggleRightSidebar: () => {},
  rightSidebarWidth: 320,
  setRightSidebarWidth: () => {},
});

export function LayoutProvider({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const toggleRightSidebar = () => setRightSidebarOpen(prev => !prev);

  return (
    <LayoutContext.Provider value={{
      isSidebarCollapsed,
      toggleSidebar,
      isRightSidebarOpen,
      setRightSidebarOpen,
      toggleRightSidebar,
      rightSidebarWidth,
      setRightSidebarWidth,
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
