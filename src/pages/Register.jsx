import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, UserPlus, Loader2, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { register, login } from "../api/base44Client";

export default function Register() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validação básica
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Remover confirmPassword antes de enviar para a API
      const { confirmPassword, ...registrationData } = formData;
      
      console.log("Enviando dados para registro:", registrationData);
      
      // Usar a função register do base44Client
      await register(registrationData);
      console.log("Registro bem-sucedido");
      
      // Após o registro bem-sucedido, fazer login automático
      try {
        const loginResponse = await login(formData.email, formData.password);
        console.log("Login automático bem-sucedido:", loginResponse);
        
        // Redirecionar para a rota /app após registro e login bem-sucedido
        navigate('/app');
      } catch (loginError) {
        console.error("Erro no login automático após registro:", loginError);
        setError("Registro realizado com sucesso, mas houve um problema no login automático. Por favor, vá para a página de login.");
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      setError(
        error.message || 
        "Erro ao criar conta. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-purple blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-gradient-blue blur-3xl opacity-20"></div>
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
              Criar Conta
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Cadastre-se para acessar os agentes IA da BrandAI
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-foreground">Nome Completo</Label>
                <Input 
                  id="nome" 
                  name="nome"
                  placeholder="Seu nome completo" 
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="seu@email.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <a 
                href="#" 
                className="text-primary hover:text-primary/80 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Entrar
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