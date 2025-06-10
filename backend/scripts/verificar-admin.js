import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from '../models/User.js';

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'.cyan.underline))
  .catch((err) => {
    console.error(`Erro: ${err.message}`.red.underline.bold);
    process.exit(1);
  });

const verificarAdmin = async () => {
  try {
    // Obter email do argumento de linha de comando ou usar o padrão
    const args = process.argv.slice(2);
    let email = 'admin@base44.com';
    
    if (args.length > 0) {
      email = args[0];
    }
    
    console.log(`Verificando usuário: ${email}`.yellow);
    
    // Buscar o usuário no banco de dados
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Usuário com email ${email} não encontrado`.red);
      process.exit(1);
    }
    
    console.log('\nDetalhes do usuário:'.cyan);
    console.log(`Nome: ${user.nome}`.white);
    console.log(`Email: ${user.email}`.white);
    console.log(`Função (role): ${user.role}`.white);
    console.log(`Plano: ${user.plano}`.white);
    console.log(`Data de criação: ${user.createdAt}`.white);
    console.log(`Último login: ${user.ultimo_login || 'Nunca'}`.white);
    
    // Verificar se é administrador
    if (user.role === 'admin') {
      console.log('\nEste usuário É UM ADMINISTRADOR'.green.bold);
    } else {
      console.log('\nEste usuário NÃO é um administrador'.red.bold);
      
      // Opção para promover a administrador
      console.log('\nPara tornar este usuário um administrador, execute:'.yellow);
      console.log(`node scripts/promover-admin.js ${email}`.cyan);
    }
  } catch (error) {
    console.error(`Erro: ${error.message}`.red.bold);
  } finally {
    // Fechar conexão com o MongoDB
    mongoose.disconnect();
  }
};

verificarAdmin(); 