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
const fixDocumentPaths = async () => {
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
      console.log(`\nVerificando agente: ${agente.codigo} (${agente.nome})`);
      
      if (!agente.documentos_treinamento || agente.documentos_treinamento.length === 0) {
        console.log(`  - Agente não possui documentos de treinamento.`);
        continue;
      }

      console.log(`  - Documentos cadastrados: ${agente.documentos_treinamento.length}`);
      let documentosAtualizados = false;

      // Verificar cada documento do agente
      for (const documento of agente.documentos_treinamento) {
        console.log(`\n  Documento: ${documento.nome}`);
        console.log(`  Caminho atual: ${documento.caminho}`);

        // Caminho absoluto baseado no caminho relativo armazenado
        const caminhoAbsoluto = path.join(__dirname, '..', documento.caminho);
        console.log(`  Caminho absoluto: ${caminhoAbsoluto}`);

        // Verificar se o arquivo existe no caminho atual
        const arquivoExiste = fileExists(caminhoAbsoluto);
        console.log(`  Arquivo existe no caminho atual? ${arquivoExiste ? 'SIM' : 'NÃO'}`);

        if (!arquivoExiste) {
          // Tentar encontrar o arquivo em locais alternativos
          console.log('  Buscando arquivo em caminhos alternativos...');

          // Criar diretório do agente se não existir
          const diretorioAgente = path.join(__dirname, '..', 'uploads', 'training', agente.codigo);
          if (!fs.existsSync(diretorioAgente)) {
            console.log(`  Criando diretório para o agente: ${diretorioAgente}`);
            fs.mkdirSync(diretorioAgente, { recursive: true });
          }

          // Possíveis locais onde o arquivo pode estar
          const possiblePaths = [
            path.join(__dirname, '..', 'uploads', 'training', agente.codigo, documento.nome),
            path.join(__dirname, '..', 'uploads', 'training', documento.nome),
            path.join(__dirname, '..', 'uploads', documento.nome)
          ];

          let arquivoEncontrado = false;

          // Verificar cada caminho possível
          for (const possiblePath of possiblePaths) {
            if (fileExists(possiblePath)) {
              console.log(`  Arquivo encontrado em: ${possiblePath}`);
              arquivoEncontrado = true;

              // Novo caminho para o arquivo
              const novoNomeArquivo = `${Date.now()}-${documento.nome}`;
              const novoCaminhoAbsoluto = path.join(diretorioAgente, novoNomeArquivo);
              const novoCaminhoRelativo = `/uploads/training/${agente.codigo}/${novoNomeArquivo}`;

              // Copiar arquivo para o novo local
              fs.copyFileSync(possiblePath, novoCaminhoAbsoluto);
              console.log(`  Arquivo copiado para: ${novoCaminhoAbsoluto}`);

              // Atualizar caminho no documento
              documento.caminho = novoCaminhoRelativo;
              documentosAtualizados = true;
              console.log(`  Caminho atualizado para: ${novoCaminhoRelativo}`);
              break;
            }
          }

          if (!arquivoEncontrado) {
            console.log('  ALERTA: Arquivo não encontrado em nenhum caminho alternativo!');
            console.log('  Este documento pode estar corrompido ou o arquivo foi excluído.');
          }
        }
      }

      // Salvar alterações no agente se houve atualizações
      if (documentosAtualizados) {
        await agente.save();
        console.log(`\n  Agente ${agente.codigo} atualizado com sucesso!`);
      } else {
        console.log(`\n  Nenhuma alteração necessária para o agente ${agente.codigo}.`);
      }
    }

    console.log('\nProcesso concluído!');
  } catch (error) {
    console.error('Erro durante o processo:', error);
  } finally {
    // Fechar conexão com o MongoDB
    await mongoose.disconnect();
    console.log('Conexão com MongoDB encerrada.');
  }
};

// Executar a função principal
fixDocumentPaths()
  .then(() => console.log('Script finalizado.'))
  .catch(err => console.error('Erro ao executar script:', err)); 