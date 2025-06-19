import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Loader2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { login } from "../api/base44Client";

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
      // Usar a função login do cliente API que já implementa o gerenciamento seguro de tokens
      await login(email, password);
      
      // Redirecionar para a rota /app após login bem-sucedido
      navigate('/app');
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
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="flex items-center">
            <img src="/img/logo.png" alt="BrandzLAB Logo" className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">
              <span className="text-[#00b6ff]" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>Brandz</span>
              <span className="text-[#736ded]" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>LAB</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-center">Entrar na sua conta</h1>
        </div>
        
        <Card className="glass-card border-border shadow-glass backdrop-blur-lg">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#00b6ff] to-[#736ded] bg-clip-text text-transparent">
              Entrar
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse sua conta no BrandzLAB
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
                className="w-full bg-[#736ded] hover:bg-[#6058db] transition-all duration-300"
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
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} BrandzLAB. Todos os direitos reservados.</p>
        </div>
      </motion.div>
    </div>
  );
} 