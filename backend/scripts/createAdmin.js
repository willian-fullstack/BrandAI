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

const createAdminUser = async () => {
  try {
    // Obter dados do comando
    const args = process.argv.slice(2);
    let nome = 'Admin User';
    let email = 'admin@example.com';
    let password = 'admin123';
    let plano = 'enterprise';

    // Verificar se foram passados argumentos
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--nome' && args[i + 1]) {
        nome = args[i + 1];
      }
      if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1];
      }
      if (args[i] === '--senha' && args[i + 1]) {
        password = args[i + 1];
      }
      if (args[i] === '--plano' && args[i + 1]) {
        plano = args[i + 1];
      }
    }

    console.log('Verificando se o usuário já existe...'.yellow);
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Se o usuário já existe, atualizar para administrador
      console.log(`Usuário ${email} já existe. Atualizando para administrador...`.yellow);
      
      userExists.role = 'admin';
      userExists.plano = plano;
      
      if (args.includes('--force-update')) {
        userExists.nome = nome;
        if (args.includes('--update-password')) {
          userExists.password = password;
        }
      }
      
      await userExists.save();
      console.log(`Usuário atualizado para administrador com sucesso!`.green);
      console.log(`Nome: ${userExists.nome}`);
      console.log(`Email: ${userExists.email}`);
      console.log(`Função: ${userExists.role}`);
      console.log(`Plano: ${userExists.plano}`);
    } else {
      // Se o usuário não existe, criar novo administrador
      console.log(`Criando novo usuário administrador...`.yellow);
      const adminUser = await User.create({
        nome,
        email,
        password,
        role: 'admin',
        plano,
      });

      console.log(`Administrador criado com sucesso!`.green);
      console.log(`Nome: ${adminUser.nome}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Função: ${adminUser.role}`);
      console.log(`Plano: ${adminUser.plano}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`Erro: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Executar a função
createAdminUser(); 