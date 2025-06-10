// Servidor simples para testar o endpoint de remoção de usuário
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error(`Erro ao conectar ao MongoDB: ${err.message}`));

// Modelo simplificado de usuário
const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Rota para depuração - remover usuário
app.get('/api/users/debug/clean-users/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    console.log(`Tentando remover usuário com email: ${email}`);
    
    // Primeiro verificar se o usuário existe
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Usuário com email ${email} não encontrado`);
      return res.status(404).json({ message: `Usuário com email ${email} não encontrado` });
    }
    
    // Remover o usuário
    await User.deleteOne({ email });
    console.log(`Usuário com email ${email} removido com sucesso`);
    
    res.json({ message: `Usuário com email ${email} removido com sucesso` });
  } catch (error) {
    console.error(`Erro ao remover usuário: ${error.message}`);
    res.status(500).json({ 
      message: 'Erro ao remover usuário', 
      error: error.message
    });
  }
});

// Rota para testar o servidor
app.get('/', (req, res) => {
  res.json({ message: 'Servidor simples está funcionando!' });
});

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor simples rodando na porta ${PORT}`);
}); 