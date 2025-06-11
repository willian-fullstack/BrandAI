import express from 'express';
import cors from 'cors';

// Inicializar express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste para depuração
app.get('/api/users/debug/clean-users/:email', (req, res) => {
  const { email } = req.params;
  console.log(`Recebida solicitação para limpar usuário: ${email}`);
  res.json({ message: `Simulação: Usuário com email ${email} removido com sucesso` });
});

// Rota padrão
app.get('/', (req, res) => {
  res.send('Servidor de teste está funcionando!');
});

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor de teste rodando na porta ${PORT}`);
}); 