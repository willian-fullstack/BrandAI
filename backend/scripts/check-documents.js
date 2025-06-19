const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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

// Função principal
const checkDocuments = async () => {
  try {
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

    // Verificar cada agente e seus documentos
    for (const agente of agentes) {
      console.log(`\n==== Agente: ${agente.codigo} (${agente.nome || 'Sem nome'}) ====`);
      
      if (!agente.documentos_treinamento || agente.documentos_treinamento.length === 0) {
        console.log(`  - Agente não possui documentos de treinamento.`);
        continue;
      }

      console.log(`  - Documentos cadastrados: ${agente.documentos_treinamento.length}`);

      // Verificar cada documento do agente
      for (const documento of agente.documentos_treinamento) {
        console.log(`\n  Documento: ${documento.nome}`);
        console.log(`  Caminho no banco: ${documento.caminho}`);

        // Caminho absoluto baseado no caminho relativo armazenado
        const caminhoAbsoluto = path.join(__dirname, '..', documento.caminho);
        console.log(`  Caminho absoluto: ${caminhoAbsoluto}`);

        // Verificar se o arquivo existe no caminho atual
        const arquivoExiste = fileExists(caminhoAbsoluto);
        console.log(`  Arquivo existe no caminho atual? ${arquivoExiste ? 'SIM' : 'NÃO'}`);

        if (!arquivoExiste) {
          console.log('  Testando caminhos alternativos:');
          
          // Possíveis locais onde o arquivo pode estar
          const possiblePaths = [
            path.join(__dirname, '..', 'uploads', 'training', agente.codigo, documento.nome),
            path.join(__dirname, '..', 'uploads', 'training', documento.nome),
            path.join(__dirname, '..', 'uploads', documento.nome)
          ];

          // Verificar cada caminho possível
          for (const possiblePath of possiblePaths) {
            const exists = fileExists(possiblePath);
            console.log(`  - ${possiblePath}: ${exists ? 'EXISTE' : 'NÃO EXISTE'}`);
          }
        }
      }
    }

    console.log('\nVerificação concluída!');
  } catch (error) {
    console.error('Erro durante o processo:', error);
  } finally {
    // Fechar conexão com o MongoDB
    await mongoose.disconnect();
    console.log('Conexão com MongoDB encerrada.');
  }
};

// Executar a função principal
checkDocuments()
  .then(() => console.log('Script finalizado.'))
  .catch(err => console.error('Erro ao executar script:', err)); 