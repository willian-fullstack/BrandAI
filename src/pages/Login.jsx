import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, LogIn, Loader2, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/base44Client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  // Definir tema padrão como escuro ao carregar
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post('/users/login', { email, password });
      
      // Salvar token e dados do usuário no localStorage
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));
      
      // Redirecionar para a página inicial
      navigate('/');
    } catch (error) {
      setError(
        error.response?.data?.message || 
        "Erro ao fazer login. Verifique suas credenciais."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-purple blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-gradient-blue blur-3xl opacity-20"></div>
      </div>
      
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-amber-400" />
          ) : (
            <Moon size={20} className="text-indigo-400" />
          )}
        </button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2
            }}
            className="w-16 h-16 bg-gradient-purple rounded-xl flex items-center justify-center shadow-glow animate-pulse-slow"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        
        <Card className="glass-card border-border shadow-glass backdrop-blur-lg">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              BrandAI
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Entre com sua conta para acessar os agentes IA
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <a 
                    href="#" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Funcionalidade de recuperação de senha será implementada em breve.");
                    }}
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-purple hover:opacity-90 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <a 
                href="#" 
                className="text-primary hover:text-primary/80 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
              >
                Criar conta
              </a>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          © 2023 BrandAI. Todos os direitos reservados.
        </div>
      </motion.div>
    </div>
  );
} 