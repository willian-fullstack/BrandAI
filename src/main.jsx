import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Aplicar tema inicial baseado na preferência do usuário
const applyInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  // Adicionar a classe de tema ao elemento html
  document.documentElement.classList.add(savedTheme);
  
  // Remover a classe oposta para garantir que apenas um tema esteja ativo
  document.documentElement.classList.remove(savedTheme === 'dark' ? 'light' : 'dark');
  
  // Definir atributo data-theme para compatibilidade adicional
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Assegurar que o localStorage está sincronizado
  localStorage.setItem('theme', savedTheme);
  
  console.log(`Tema aplicado: ${savedTheme}`);
};

// Aplicar tema antes da renderização
applyInitialTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
) 