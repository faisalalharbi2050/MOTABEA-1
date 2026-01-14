import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import '../../styles/sidebar-responsive.css';
// @ts-ignore
import Sidebar from './Sidebar';
// @ts-ignore
import Header from './Header';

const Layout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-gray-50 rtl min-h-screen">
      <Sidebar 
        onClose={showMobileSidebar ? () => setShowMobileSidebar(false) : undefined} 
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={`main-content flex flex-col h-screen overflow-hidden ${isCollapsed ? 'collapsed-margin' : ''}`}>
        <div className="shrink-0 pl-8">
            <Header onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)} />
        </div>
        <main className="flex-1 overflow-y-auto pl-4">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
