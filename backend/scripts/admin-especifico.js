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

// Dados do administrador
const adminData = {
  nome: 'Administrador Base44',
  email: 'admin@base44.com',
  password: 'admin123456',
  role: 'admin',
  plano: 'enterprise'
};

const createAdminUser = async () => {
  try {
    console.log('Verificando se o usuário já existe...'.yellow);
    const userExists = await User.findOne({ email: adminData.email });

    if (userExists) {
      // Se o usuário já existe, atualizar para administrador
      console.log(`Usuário ${adminData.email} já existe. Atualizando para administrador...`.yellow);
      
      userExists.role = adminData.role;
      userExists.plano = adminData.plano;
      userExists.nome = adminData.nome;
      userExists.password = adminData.password;
      
      await userExists.save();
      console.log(`Usuário atualizado para administrador com sucesso!`.green);
      console.log(`Nome: ${userExists.nome}`);
      console.log(`Email: ${userExists.email}`);
      console.log(`Função: ${userExists.role}`);
      console.log(`Plano: ${userExists.plano}`);
    } else {
      // Se o usuário não existe, criar novo administrador
      console.log(`Criando novo usuário administrador...`.yellow);
      const adminUser = await User.create(adminData);

      console.log(`Administrador criado com sucesso!`.green);
      console.log(`Nome: ${adminUser.nome}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Função: ${adminUser.role}`);
      console.log(`Plano: ${adminUser.plano}`);
    }

    console.log('\nCredenciais do administrador:'.cyan);
    console.log(`Email: ${adminData.email}`);
    console.log(`Senha: ${adminData.password}`);

    process.exit(0);
  } catch (error) {
    console.error(`Erro: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Executar a função
createAdminUser(); 