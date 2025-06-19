import { useState, useEffect, useCallback } from 'react';
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
  Search,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsPanel from '@/components/ui/notifications-panel';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Loading from '@/components/ui/loading';
import { getCurrentUser, isAdmin, logout } from "@/api/base44Client";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter dados do usuário atual
  const userIsAdmin = isAdmin();
  
  // Determinar a rota ativa
  const isActive = (path) => {
    // Verificar se o caminho atual corresponde ao caminho esperado, considerando os prefixos
    const currentPath = location.pathname;
    
    // Para o Dashboard, é um caso especial
    if (path === '/' && (currentPath === '/app' || currentPath === '/app/')) {
      return true;
    }
    
    // Para outras rotas, verificar tanto o caminho direto quanto o caminho com prefixo /app/
    return currentPath === path || 
           currentPath === `/app${path}` ||
           (path !== '/' && (
             currentPath.startsWith(path) || 
             currentPath.startsWith(`/app${path}`)
           ));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      navigate('/login');
    }
  };

  // Detectar mudanças de tema
  useEffect(() => {
    const handleThemeChange = (e) => {
      document.documentElement.classList.toggle('dark', e.detail.theme === 'dark');
    };
    
    // Definir tema inicial
    document.documentElement.classList.add('dark');
    
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

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = () => {
      try {
        const data = getCurrentUser();
        if (!data) {
          navigate('/login');
          return;
        }
        setUserData(data);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  // Handler para abrir/fechar notificações
  const toggleNotifications = useCallback(() => {
    console.log("Toggle notificações, estado atual:", notificationsOpen);
    setNotificationsOpen(prevState => !prevState);
  }, [notificationsOpen]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Overlay para mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link to="/app" className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-gradient-purple flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">BrandAI</span>
            </Link>
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
                  to="/app"
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
                  to="/app/conversas"
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
                  to="/app/agentes"
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
                  to="/app/planos"
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
                  to="/app/afiliados"
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
                    to="/app/admin"
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
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={18} className="text-primary" />
                </div>
                <div className="ml-3 flex-1 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userData?.nome || 'Carregando...'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userData?.email || ''}
                  </p>
                </div>
                <ChevronDown size={16} className="ml-2 text-muted-foreground" />
              </button>
              
              {/* Menu do usuário */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 w-full mb-2 bg-popover rounded-lg shadow-lg border border-border overflow-hidden"
                  >
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sair
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="relative notifications-container">
              <button
                onClick={toggleNotifications}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors relative"
              >
                <Bell size={20} />
                {/* Indicador de notificações */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Painel de notificações */}
              <AnimatePresence>
                {notificationsOpen && (
                  <NotificationsPanel onClose={() => setNotificationsOpen(false)} />
                )}
              </AnimatePresence>
            </div>
            
            <ThemeToggle />
          </div>
        </header>
        
        {/* Área de conteúdo */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

