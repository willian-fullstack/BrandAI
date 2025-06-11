import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from 'prop-types';

export function ThemeToggle({ className }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    // Sincronizar tema com localStorage e document
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    // Adicionar listener para mudanças de tema
    const handleThemeChange = (e) => {
      setTheme(e.detail.theme);
    };

    document.addEventListener("themeChanged", handleThemeChange);
    return () => document.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Modificar o elemento HTML diretamente
    document.documentElement.classList.add(newTheme);
    document.documentElement.classList.remove(newTheme === "dark" ? "light" : "dark");
    
    // Definir atributo data-theme para compatibilidade adicional
    document.documentElement.setAttribute('data-theme', newTheme);

    // Salvar preferência do usuário no localStorage
    localStorage.setItem("theme", newTheme);

    // Disparar evento para atualizar o tema em todo o aplicativo
    document.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { theme: newTheme } })
    );
    
    console.log(`Tema alterado para: ${newTheme}`);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className || "rounded-full"}
      title={theme === "dark" ? "Alternar para modo claro" : "Alternar para modo escuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </Button>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string
};

export default ThemeToggle; 