import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

// Carregar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.MONGO_URI) {
  console.error('Erro: MONGO_URI não encontrado no arquivo .env!'.red.bold);
  process.exit(1);
}

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'.cyan.underline))
  .catch((err) => {
    console.error(`Erro: ${err.message}`.red.underline.bold);
    process.exit(1);
  });

const promoverAdmin = async () => {
  try {
    // Obter email do argumento de linha de comando
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Uso: node scripts/promover-admin.js <email>'.yellow);
      process.exit(1);
    }
    
    const email = args[0];
    console.log(`Promovendo usuário ${email} para administrador...`.yellow);
    
    // Buscar o usuário no banco de dados
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Usuário com email ${email} não encontrado`.red);
      process.exit(1);
    }
    
    // Verificar se já é administrador
    if (user.role === 'admin') {
      console.log(`O usuário ${email} já é um administrador`.cyan);
      process.exit(0);
    }
    
    // Atualizar para administrador
    user.role = 'admin';
    await user.save();
    
    console.log(`\nUsuário ${email} promovido para ADMINISTRADOR com sucesso!`.green.bold);
    console.log(`\nDetalhes do usuário atualizados:`.cyan);
    console.log(`Nome: ${user.nome}`.white);
    console.log(`Email: ${user.email}`.white);
    console.log(`Função (role): ${user.role}`.white);
    console.log(`Plano: ${user.plano}`.white);
    
    console.log(`\nAgora o usuário terá acesso completo à área administrativa.`.yellow);
    console.log(`Certifique-se de fazer login novamente para que as alterações tenham efeito.`.yellow);
    
  } catch (error) {
    console.error(`Erro: ${error.message}`.red.bold);
  } finally {
    // Fechar conexão com o MongoDB
    mongoose.disconnect();
  }
};

promoverAdmin(); 