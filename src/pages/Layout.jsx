import { useState, useEffect } from 'react';
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
  MessageSquare,
  Search
} from 'lucide-react';
import { logout, getCurrentUser, isAdmin } from '../api/base44Client';
import { motion } from 'framer-motion';
import NotificationsPanel, { NotificationIcon } from '@/components/ui/notifications-panel';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
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

  // Detectar mudanças de tema
  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail.theme);
    };
    
    document.addEventListener('themeChanged', handleThemeChange);
    return () => document.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  // Fechar menus quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
      if (notificationsOpen && !event.target.closest('.notifications-container')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, notificationsOpen]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Overlay para mobile */}
      <div
        className={`fixed inset-0 z-20 bg-black/80 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-full glass transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-purple rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                BrandAI
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-secondary rounded-lg pl-9 pr-4 py-2 text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu Principal
            </div>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/"
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <LayoutGrid size={18} className="mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/conversas"
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/conversas')
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <MessageSquare size={18} className="mr-3" />
                  Conversas
                </Link>
              </li>
              <li>
                <Link
                  to="/agentes"
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/agentes')
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <Users size={18} className="mr-3" />
                  Agentes
                </Link>
              </li>
              <li>
                <Link
                  to="/planos"
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/planos')
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <CreditCard size={18} className="mr-3" />
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  to="/afiliados"
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/afiliados')
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <UserPlus size={18} className="mr-3" />
                  Afiliados
                </Link>
              </li>
              
              {/* Link para área administrativa - visível apenas para admins */}
              {userIsAdmin && (
                <li>
                  <Link
                    to="/admin"
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Settings size={18} className="mr-3" />
                    Administração
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-border">
            <div className="relative user-menu-container">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors duration-200"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white">
                  {userData?.nome?.charAt(0) || "U"}
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium truncate">
                    {userData?.nome || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userData?.email || ""}
                  </p>
                </div>
                <ChevronDown size={16} className="ml-auto text-muted-foreground" />
              </button>
              
              {userMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-2 left-0 w-full glass-card rounded-lg shadow-lg border border-border py-1 z-50"
                >
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <User size={16} className="mr-2 text-muted-foreground" />
                    Perfil
                  </a>
                  <div className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors">
                    <ThemeToggle className="mr-2 p-0 h-auto" />
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-secondary transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sair
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <header className="flex h-16 items-center px-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-4 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="ml-auto flex items-center space-x-4">
            {/* Botão de tema */}
            <ThemeToggle />

            {/* Notificações */}
            <div className="relative notifications-container">
              <NotificationIcon onClick={() => setNotificationsOpen(!notificationsOpen)} />
              
              <NotificationsPanel 
                isOpen={notificationsOpen} 
                onClose={() => setNotificationsOpen(false)} 
              />
            </div>
          </div>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

