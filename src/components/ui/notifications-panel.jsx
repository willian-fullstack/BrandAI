import { useState } from "react";
import { Bell, Check, ChevronRight, Star, Info, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

// Mock de notificações para demonstração
const mockNotifications = [
  {
    id: 1,
    title: "Novo agente disponível!",
    message: "O agente de Visual Identity foi adicionado ao seu plano sem custo adicional.",
    type: "feature",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 horas atrás
  },
  {
    id: 2,
    title: "Atualização de sistema",
    message: "O BrandAI foi atualizado para a versão 2.0 com novas funcionalidades.",
    type: "system",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 dia atrás
  },
  {
    id: 3,
    title: "Créditos adicionados",
    message: "10 créditos foram adicionados à sua conta como bônus de uso.",
    type: "credit",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 dias atrás
  }
];

// Hook para obter as notificações
export const useNotifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const loading = false;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  };
};

// Componente principal do painel de notificações
const NotificationsPanel = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'feature':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'credit':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 1000 * 60 * 60) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
    }
    
    if (diff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    }
    
    if (diff < 1000 * 60 * 60 * 24 * 7) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    }
    
    return date.toLocaleDateString('pt-BR');
  };

  if (!isOpen) return null;

  console.log("Renderizando painel de notificações, isOpen:", isOpen);

  return createPortal(
    <>
      {/* Overlay para fechar o painel quando clicar fora */}
      <div 
        className="fixed inset-0 bg-black/5 z-[1000]"
        onClick={onClose}
      />
      
      {/* Painel de notificações */}
      <div 
        className="fixed top-16 right-4 z-[1001] min-w-[320px] max-w-[400px]"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center">
              <h3 className="font-semibold text-foreground">Notificações</h3>
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  className="text-xs text-primary hover:text-primary/80 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="w-10 h-10 relative">
                    <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                  </div>
                  <span className="text-muted-foreground text-sm">Carregando notificações...</span>
                </div>
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          <button 
                            className="flex items-center text-xs text-primary hover:text-primary/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Ver detalhes <ChevronRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-1">Nenhuma notificação</p>
                <p className="text-xs text-muted-foreground/70">
                  Você será notificado sobre atualizações e novidades aqui
                </p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-border bg-card/95">
            <button 
              className="w-full text-center text-sm text-primary hover:text-primary/80 hover:underline py-1"
              onClick={(e) => e.stopPropagation()}
            >
              Ver todas as notificações
            </button>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
};

NotificationsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default NotificationsPanel; 