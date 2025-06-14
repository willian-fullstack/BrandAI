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
import { User as UserEntity } from "@/api/entities";
import { isAdmin, logout } from "@/api/base44Client";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
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

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await UserEntity.me();
        setUserData(data);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    loadUserData();
  }, []);

  // Handler para abrir/fechar notificações
  const toggleNotifications = useCallback(() => {
    console.log("Toggle notificações, estado atual:", notificationsOpen);
    setNotificationsOpen(prevState => !prevState);
  }, [notificationsOpen]);

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
              <button
                onClick={toggleNotifications}
                className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground relative transition-colors"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                  2
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Painel de notificações (fora do fluxo normal do documento) */}
      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onClose={() => {
          console.log("Fechando painel de notificações");
          setNotificationsOpen(false);
        }} 
      />
    </div>
  );
}

