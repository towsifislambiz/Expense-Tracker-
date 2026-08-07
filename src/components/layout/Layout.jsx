import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Container } from '../common/Container';

export const Layout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-[#060816] text-white font-['Inter',sans-serif] overflow-x-hidden">
      {/* Sidebar Layout Component */}
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Header Layout Component */}
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Content Outlet */}
        <main className="flex-1 py-6">
          <Container>
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
};
