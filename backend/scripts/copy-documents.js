// Este script cria os diretórios necessários e copia o arquivo do branding_posicionamento para os outros agentes
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Configurar dotenv
dotenv.config();

// Função para verificar se um arquivo existe
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error(`Erro ao verificar arquivo ${filePath}:`, error);
    return false;
  }
};

// Função para criar diretório se não existir
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Diretório criado: ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`Erro ao criar diretório ${dirPath}:`, error);
      return false;
    }
  }
  return true;
};

// Função principal
const copyDocuments = async () => {
  try {
    // Encontrar o arquivo de exemplo do branding_posicionamento
    const sourceDirPath = path.join(__dirname, '..', 'uploads', 'training', 'branding_posicionamento');
    
    if (!fs.existsSync(sourceDirPath)) {
      console.error(`Diretório fonte não encontrado: ${sourceDirPath}`);
      return;
    }
    
    // Listar arquivos no diretório fonte
    const files = fs.readdirSync(sourceDirPath);
    if (files.length === 0) {
      console.error(`Nenhum arquivo encontrado no diretório fonte: ${sourceDirPath}`);
      return;
    }
    
    // Usar o primeiro arquivo como fonte
    const sourceFileName = files[0];
    const sourceFilePath = path.join(sourceDirPath, sourceFileName);
    
    console.log(`Arquivo fonte encontrado: ${sourceFilePath}`);
    
    // Ler o conteúdo do arquivo fonte
    const fileContent = fs.readFileSync(sourceFilePath, 'utf8');
    console.log(`Conteúdo do arquivo lido: ${fileContent.length} caracteres`);
    
    // Conectar ao MongoDB para obter a lista de agentes
    console.log('Conectando ao MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/brandlab';
    await mongoose.connect(mongoUri);
    console.log('Conectado ao MongoDB com sucesso!');

    const AgenteConfig = mongoose.model('AgenteConfig', new mongoose.Schema({
      codigo: String,
      nome: String,
      documentos_treinamento: [{
        nome: String,
        caminho: String,
        tipo: String,
        tamanho: Number,
        data_upload: Date
      }]
    }, { timestamps: true }));

    // Buscar todos os agentes
    const agentes = await AgenteConfig.find({});
    console.log(`Encontrados ${agentes.length} agentes no banco de dados.`);

    // Para cada agente, criar o diretório e copiar o arquivo
    for (const agente of agentes) {
      if (agente.codigo === 'branding_posicionamento') {
        console.log(`Pulando agente ${agente.codigo} (é a fonte)`);
        continue;
      }
      
      console.log(`\nProcessando agente: ${agente.codigo}`);
      
      // Verificar se o agente tem documentos de treinamento
      if (!agente.documentos_treinamento || agente.documentos_treinamento.length === 0) {
        console.log(`  - Agente não possui documentos de treinamento. Pulando.`);
        continue;
      }
      
      // Criar diretório para o agente
      const targetDirPath = path.join(__dirname, '..', 'uploads', 'training', agente.codigo);
      if (!createDirectoryIfNotExists(targetDirPath)) {
        console.log(`  - Falha ao criar diretório para o agente. Pulando.`);
        continue;
      }
      
      // Para cada documento do agente
      for (const documento of agente.documentos_treinamento) {
        console.log(`\n  Documento: ${documento.nome}`);
        console.log(`  Caminho no banco: ${documento.caminho}`);
        
        // Extrair o nome do arquivo do caminho
        const fileName = path.basename(documento.caminho);
        
        // Caminho absoluto baseado no caminho relativo armazenado
        const targetFilePath = path.join(__dirname, '..', documento.caminho);
        console.log(`  Caminho absoluto: ${targetFilePath}`);
        
        // Verificar se o arquivo já existe
        if (fileExists(targetFilePath)) {
          console.log(`  Arquivo já existe. Pulando.`);
          continue;
        }
        
        // Criar o diretório do arquivo se não existir
        const targetFileDir = path.dirname(targetFilePath);
        if (!createDirectoryIfNotExists(targetFileDir)) {
          console.log(`  Falha ao criar diretório para o arquivo. Pulando.`);
          continue;
        }
        
        // Copiar o arquivo
        try {
          fs.writeFileSync(targetFilePath, fileContent);
          console.log(`  Arquivo copiado com sucesso para: ${targetFilePath}`);
        } catch (error) {
          console.error(`  Erro ao copiar arquivo: ${error.message}`);
        }
      }
    }

    console.log('\nProcesso concluído!');
  } catch (error) {
    console.error('Erro durante o processo:', error);
  } finally {
    // Fechar conexão com o MongoDB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Conexão com MongoDB encerrada.');
    }
  }
};

// Executar a função principal
copyDocuments()
  .then(() => console.log('Script finalizado.'))
  .catch(err => console.error('Erro ao executar script:', err)); 