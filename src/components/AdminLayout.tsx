import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Upload, 
  Users, 
  LogOut, 
  Menu, 
  X,
  FileSpreadsheet,
  Search,
  Plus,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Importar CSV', href: '/admin/import', icon: Upload },
  { name: 'Gerenciar Leads', href: '/admin/leads', icon: Users },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <img 
                  src="https://cdn.cookielaw.org/logos/ca573dc2-6848-4d5d-811b-a73af38af8db/351dcc81-561f-44be-ad95-966e6f1bb905/f0416ebe-67db-4d95-aee0-56e49a2678f4/logo_jadlog.png" 
                  alt="JadLog Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => navigate(item.href)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar para mobile */}
      <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-md text-white p-2"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <img 
                  src="https://cdn.cookielaw.org/logos/ca573dc2-6848-4d5d-811b-a73af38af8db/351dcc81-561f-44be-ad95-966e6f1bb905/f0416ebe-67db-4d95-aee0-56e49a2678f4/logo_jadlog.png" 
                  alt="JadLog Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <nav className="mt-8 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.name}
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className={`w-full justify-start ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header mobile */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Conteúdo da página */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
