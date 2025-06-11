import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  CreditCard,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from 'lucide-react';
import { logout, getCurrentUser, isAdmin } from '../api/base44Client';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter dados do usuário atual
  const userData = getCurrentUser();
  const userIsAdmin = isAdmin();
  
  // Determinar a rota ativa
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para mobile (aberta sob demanda) */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-full bg-white border-r border-gray-200 transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">B44</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                BrandLab
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className={`flex items-center px-3 py-2.5 rounded-md ${
                    isActive('/') 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutGrid size={20} className={`${isActive('/') ? 'text-indigo-700' : 'text-gray-500'} mr-3`} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/agentes"
                  className={`flex items-center px-3 py-2.5 rounded-md ${
                    isActive('/agentes')
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} className={`${isActive('/agentes') ? 'text-indigo-700' : 'text-gray-500'} mr-3`} />
                  Agentes
                </Link>
              </li>
              <li>
                <Link
                  to="/planos"
                  className={`flex items-center px-3 py-2.5 rounded-md ${
                    isActive('/planos')
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard size={20} className={`${isActive('/planos') ? 'text-indigo-700' : 'text-gray-500'} mr-3`} />
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  to="/afiliados"
                  className={`flex items-center px-3 py-2.5 rounded-md ${
                    isActive('/afiliados')
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserPlus size={20} className={`${isActive('/afiliados') ? 'text-indigo-700' : 'text-gray-500'} mr-3`} />
                  Afiliados
                </Link>
              </li>
              
              {/* Link para área administrativa - visível apenas para admins */}
              {userIsAdmin && (
                <li>
                  <Link
                    to="/admin"
                    className={`flex items-center px-3 py-2.5 rounded-md ${
                      isActive('/admin')
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings size={20} className={`${isActive('/admin') ? 'text-indigo-700' : 'text-gray-500'} mr-3`} />
                    Administração
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                  {userData?.nome?.charAt(0) || "U"}
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {userData?.nome || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData?.email || ""}
                  </p>
                </div>
                <ChevronDown size={16} className="ml-auto text-gray-500" />
              </button>
              {userMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} className="mr-2 text-gray-500" />
                    Perfil
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho para mobile */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">B44</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              BrandLab
            </h1>
          </div>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

