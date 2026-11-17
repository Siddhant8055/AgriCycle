import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import './AppShell.css';

export function AppShell({ children, pageTitle }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-main">
        <Topbar onMenuToggle={() => setMobileOpen((v) => !v)} pageTitle={pageTitle} />
        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
