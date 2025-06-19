# Correção de Caminhos de Documentos

Este diretório contém scripts para corrigir problemas com os caminhos dos documentos de treinamento dos agentes.

## Problema Identificado

Alguns agentes não conseguem encontrar seus documentos de treinamento porque os caminhos armazenados no banco de dados não correspondem à localização real dos arquivos no sistema de arquivos.

Sintomas do problema:
- Logs mostrando "Não foi possível encontrar o arquivo: [nome_arquivo] em nenhum dos caminhos testados"
- Alguns agentes funcionam corretamente (como o `branding_posicionamento`), enquanto outros não (como o `ecommerce_estrategico`)

## Solução 1: Executar o Script de Correção

O script `fix-document-paths.js` foi criado para corrigir automaticamente os caminhos dos documentos no banco de dados.

### Como executar:

1. Certifique-se de que o MongoDB está em execução
2. Execute o script:

```bash
cd backend/scripts
node fix-document-paths.js
```

O script irá:
1. Verificar todos os agentes no banco de dados
2. Para cada documento de treinamento, verificar se o arquivo existe no caminho especificado
3. Se não existir, procurar o arquivo em caminhos alternativos
4. Se encontrado, copiar o arquivo para o diretório correto e atualizar o caminho no banco de dados

## Solução 2: Melhorias no Código

Além do script de correção, foram feitas melhorias na função `findAndReadFile` no arquivo `integrationController.js` para tornar a busca de arquivos mais robusta:

1. Extração do ID do agente do caminho do arquivo
2. Adição de mais caminhos possíveis para busca
3. Suporte para variações no nome do arquivo (com e sem timestamp)
4. Melhor tratamento de erros e logging

## Solução 3: Upload Manual dos Documentos

Se as soluções automáticas não funcionarem, você pode:

1. Acessar a interface de administração
2. Ir para a seção de Agentes
3. Selecionar o agente com problemas
4. Excluir os documentos de treinamento problemáticos
5. Fazer upload dos documentos novamente

## Prevenção de Problemas Futuros

Para evitar problemas semelhantes no futuro:

1. Sempre use o mesmo formato de caminho para documentos de treinamento
2. Mantenha os documentos organizados na estrutura `/uploads/training/[codigo_agente]/[nome_arquivo]`
3. Não mova ou renomeie arquivos manualmente no sistema de arquivos
4. Use a interface de administração para gerenciar documentos de treinamento 