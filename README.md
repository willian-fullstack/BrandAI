# BrandzLAB - Plataforma de IA para Marcas

BrandzLAB é uma plataforma de inteligência artificial especializada para marcas de roupas, integrando diversos agentes de IA com expertises específicas para auxiliar negócios do setor de moda.

## Características Principais

- **Múltiplos Agentes Especializados**: Design, E-commerce, Experiência de Unboxing, Gestão Financeira, Marketing e muito mais
- **Sistema de Documentos de Treinamento**: Upload e gerenciamento de documentos para treinar os agentes com conhecimento específico
- **Interface de Chat**: Comunicação intuitiva com os agentes de IA
- **Painel Administrativo**: Gerenciamento completo de usuários, planos e configurações
- **Efeitos Visuais Interativos**: Visualização 3D interativa de um cérebro que reage ao movimento do mouse, representando a IA avançada da plataforma

## Componentes Visuais

### Visualização 3D do Cérebro

A página inicial apresenta uma visualização 3D interativa de um cérebro que:

- É implementada usando Three.js, React Three Fiber e Drei em versões compatíveis (three@0.151.0, @react-three/fiber@8.14.5, @react-three/drei@9.88.0)
- Consiste em uma esfera central representando o cérebro e partículas ao redor simulando conexões neurais
- Alterna para visualização wireframe ao passar o mouse, revelando a estrutura interna
- Mantém rotação suave contínua para destacar a tridimensionalidade
- Utiliza materiais com efeitos brilhantes em tons de roxo, consistentes com a identidade visual
- Oferece excelente performance mesmo em dispositivos com capacidade gráfica limitada

Esta visualização representa visualmente a natureza avançada da inteligência artificial utilizada na plataforma e serve como elemento central de destaque na página inicial.

## Correções Recentes

### Revisão de Segurança e Otimização do Código

Realizamos uma revisão completa do código para identificar e corrigir vulnerabilidades de segurança, remover arquivos duplicados e melhorar a estrutura do projeto. Para mais detalhes, consulte o arquivo [REVISAO_SEGURANCA.md](./REVISAO_SEGURANCA.md).

Principais melhorias:
- Remoção de arquivos duplicados e temporários
- Correção de vulnerabilidades de path traversal
- Implementação de validação segura para upload de arquivos
- Melhoria no gerenciamento de chaves de API
- Sanitização de entradas do usuário

### Correção do Problema de Reconhecimento de Documentos Anexados

Corrigimos um problema crítico onde os documentos anexados não estavam sendo reconhecidos pelo sistema. As seguintes alterações foram implementadas:

1. **Backend (Controllers/integrationController.js)**:
   - Reimplementação completa da lógica de detecção e processamento de documentos
   - Adição de múltiplos caminhos alternativos para busca de arquivos
   - Melhor logging para diagnóstico de problemas
   - Correção da propagação de IDs de agentes

2. **Frontend (Chat.jsx)**:
   - Atualização do componente de chat para garantir que o ID do agente seja sempre enviado corretamente
   - Melhor manipulação de estados para documentos anexados
   - Logging detalhado para debugging

3. **Utilitários**:
   - Criação de um sistema robusto de busca recursiva de arquivos
   - Manipulação correta de diferentes formatos de caminhos

### Correção de Problemas de Interface e Renderização

Corrigimos diversos problemas relacionados à interface do usuário e à renderização de componentes:

1. **Correção do Sistema de Temas**:
   - Implementação robusta de alternância entre temas claro e escuro
   - Aplicação consistente do tema em todas as páginas
   - Persistência do tema escolhido entre sessões
   - Correção de problemas de renderização visual em diferentes componentes

2. **Correção de Renderização de Ícones**:
   - Resolução do problema de renderização incorreta de ícones de agentes
   - Implementação de verificação de tipo para ícones (emoji vs componente)
   - Tratamento apropriado de strings e componentes React

3. **Correção de Erros de API**:
   - Adição da função filter para AgenteConfig que estava faltando
   - Tratamento adequado de respostas de erro
   - Melhor manipulação de estado para evitar inconsistências

4. **Melhorias na Experiência do Usuário**:
   - Formatação consistente de datas em todo o aplicativo
   - Feedback visual melhorado para ações do usuário
   - Correções de navegação entre conversas e agentes

## Estrutura do Projeto

- **/backend**: API Node.js/Express, controladores e modelos
- **/src**: Frontend React
  - **/components**: Componentes reutilizáveis
  - **/pages**: Páginas da aplicação
  - **/api**: Integração com o backend

## Instalação

### Requisitos

- Node.js 16+
- MongoDB

### Passos

1. Clone o repositório:
   ```
   git clone https://github.com/willian-fullstack/BrandzLAB.git
   cd BrandzLAB
   ```

2. Instale as dependências:
   ```
   npm install
   cd backend
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie `.env.example` para `.env` no diretório raiz para o frontend
   - Copie `backend/.env.example` para `backend/.env` para o backend
   - Preencha as variáveis necessárias (MongoDB URI, chaves de API, etc.)
   - **IMPORTANTE**: Nunca compartilhe ou cometa arquivos .env com chaves de API ou senhas

4. Inicie o servidor de desenvolvimento:
   ```
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## Segurança e Variáveis de Ambiente

### Estrutura de Arquivos .env

O projeto utiliza dois arquivos .env separados:

1. **Frontend (.env na raiz)**: 
   - Contém apenas variáveis necessárias para o frontend
   - Prefixadas com VITE_
   - Não deve conter chaves de API sensíveis
   - Exemplo: `VITE_API_URL=http://localhost:5000/api`

2. **Backend (backend/.env)**:
   - Contém variáveis para o backend, incluindo chaves de API e segredos
   - Não são expostas ao frontend
   - Exemplo: `OPENAI_API_KEY=sua_chave_aqui`

### Boas Práticas de Segurança

- Nunca exponha chaves de API diretamente no frontend
- Todas as chamadas para APIs externas devem passar pelo backend
- Não armazene senhas em texto puro nos arquivos .env
- Use o script `createAdmin.js` para criar administradores
- Mantenha os arquivos .env no .gitignore

## Licença

Este projeto é licenciado sob a licença MIT.

## Base44 App

Aplicação completa com frontend React e backend Node.js para o Base44, uma plataforma de assistentes virtuais baseados em IA.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Frontend**: Interface de usuário construída com React
- **Backend**: API RESTful construída com Node.js, Express e MongoDB

## Frontend

O frontend é uma aplicação React que consome a API do backend para fornecer uma interface de usuário intuitiva e responsiva.

### Tecnologias Principais

- React
- React Router
- TailwindCSS
- Axios para requisições HTTP

### Executando o Frontend

```bash
# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento
npm run dev

# Construir para produção
npm run build
```

## Backend

O backend é uma API RESTful que fornece endpoints para todas as funcionalidades da aplicação.

### Tecnologias Principais

- Node.js
- Express
- MongoDB (com Mongoose)
- JWT para autenticação
- bcryptjs para criptografia de senhas

### Estrutura do Backend

```
backend/
  ├── controllers/      # Controladores da API
  ├── data/             # Scripts de seed para o banco de dados
  ├── middleware/       # Middlewares personalizados
  ├── models/           # Modelos do Mongoose
  ├── routes/           # Rotas da API
  ├── utils/            # Utilitários
  ├── .env              # Variáveis de ambiente
  ├── package.json      # Dependências e scripts
  └── server.js         # Ponto de entrada da aplicação
```

### Modelos de Dados

O backend implementa os seguintes modelos de dados:

1. **User**: Gerenciamento de usuários e autenticação
   - Campos: nome, email, password, role, plano, avatar, ultimo_login, codigo_indicacao, etc.
   - Métodos: matchPassword (para validação de senha)
   - Hooks: pre-save para criptografar senha

2. **Conversa**: Conversas entre usuários e agentes de IA
   - Campos: titulo, usuario, agente, mensagens, status, data_criacao, etc.
   - Relacionamentos: Referência ao modelo User e AgenteConfig

3. **AgenteConfig**: Configuração de agentes virtuais
   - Campos: nome, codigo, descricao, prompt_sistema, icone, cor, parametros, etc.
   - Índices: código único para fácil busca

4. **Indicacao**: Sistema de indicações e referências
   - Campos: usuario_origem, usuario_indicado, codigo, status, data_criacao, etc.
   - Relacionamentos: Referências ao modelo User

5. **ConfiguracaoIA**: Configurações dos modelos de IA
   - Campos: gpt_api_key, modelo_preferencial_ia, parametros_padrao, etc.
   - Segurança: Criptografia de chaves de API

6. **ConfiguracaoPlanos**: Configuração de planos e assinaturas
   - Campos: plano_basico_preco_mensal, plano_basico_preco_anual, plano_intermediario_preco_mensal, etc.
   - Métodos: Cálculo de descontos e comparação de planos

7. **Integration**: Integrações com serviços externos
   - Campos: nome, tipo, configuracao, usuario, status, etc.
   - Métodos: Teste de conexão e validação de configuração

### Controladores

Os controladores implementam a lógica de negócio para cada entidade:

1. **userController**: Gerenciamento de usuários
   - authUser: Autenticação de usuário e geração de token JWT
   - registerUser: Registro de novos usuários
   - getUserProfile: Obtenção do perfil do usuário autenticado
   - updateUserProfile: Atualização do perfil do usuário
   - getUsers: Listagem de todos os usuários (admin)
   - deleteUser: Exclusão de usuário
   - getUserById: Obtenção de usuário por ID
   - updateUser: Atualização de usuário por ID
   - changePassword: Alteração de senha
   - requestPasswordReset: Solicitação de redefinição de senha
   - resetPassword: Redefinição de senha

2. **conversaController**: Gestão de conversas com agentes
   - getConversas: Listagem de conversas do usuário
   - getConversaById: Obtenção de conversa por ID
   - createConversa: Criação de nova conversa
   - updateConversa: Atualização de conversa existente
   - deleteConversa: Exclusão de conversa
   - addMensagem: Adição de mensagem a uma conversa
   - updateStatus: Atualização do status da conversa
   - updateTitulo: Atualização do título da conversa

3. **agenteConfigController**: Configuração de agentes virtuais
   - getAgentesConfig: Listagem de configurações de agentes
   - getAgenteConfigByCodigo: Obtenção de configuração por código
   - createAgenteConfig: Criação de nova configuração
   - updateAgenteConfig: Atualização de configuração existente
   - deleteAgenteConfig: Exclusão de configuração

4. **indicacaoController**: Sistema de indicações
   - verificarCodigo: Verificação de código de indicação
   - getIndicacoes: Listagem de indicações do usuário
   - createIndicacao: Criação de nova indicação
   - getEstatisticas: Obtenção de estatísticas de indicações
   - processarIndicacao: Processamento de indicação

5. **configuracaoIAController**: Configurações dos modelos de IA
   - getConfiguracoes: Listagem de configurações
   - getConfiguracaoById: Obtenção de configuração por ID
   - createConfiguracao: Criação de nova configuração
   - updateConfiguracao: Atualização de configuração existente
   - deleteConfiguracao: Exclusão de configuração
   - testarConfiguracao: Teste de configuração

6. **configuracaoPlanosController**: Configuração de planos e assinaturas
   - getConfiguracoes: Listagem de configurações de planos
   - getConfiguracaoByNome: Obtenção de configuração por nome
   - createConfiguracao: Criação de nova configuração
   - updateConfiguracao: Atualização de configuração existente
   - deleteConfiguracao: Exclusão de configuração
   - compararPlanos: Comparação entre planos

7. **integrationController**: Integrações com serviços externos
   - getIntegrations: Listagem de integrações
   - getIntegrationById: Obtenção de integração por ID
   - createIntegration: Criação de nova integração
   - updateIntegration: Atualização de integração existente
   - deleteIntegration: Exclusão de integração
   - testarIntegration: Teste de integração

### Middleware de Autenticação

O sistema implementa middleware de autenticação baseado em JWT:

1. **auth.js**: Middleware principal de autenticação
   - protect: Verifica se o usuário está autenticado
   - admin: Verifica se o usuário é administrador
   - premium: Verifica se o usuário tem plano premium

2. **validateToken.js**: Validação e decodificação de tokens JWT
   - Verificação de expiração
   - Verificação de assinatura
   - Decodificação de payload

### Utilitários

O backend inclui diversos utilitários para funcionalidades comuns:

1. **generateToken.js**: Geração de tokens JWT para autenticação
2. **errorHandler.js**: Tratamento padronizado de erros da API
3. **validators.js**: Funções de validação para entrada de dados
4. **seedData.js**: Dados iniciais para popular o banco de dados

### Rotas da API

O backend implementa rotas RESTful para todas as entidades:

1. **userRoutes.js**: Rotas para gerenciamento de usuários
2. **conversaRoutes.js**: Rotas para gestão de conversas
3. **agenteConfigRoutes.js**: Rotas para configuração de agentes
4. **indicacaoRoutes.js**: Rotas para o sistema de indicações
5. **configuracaoIARoutes.js**: Rotas para configurações de IA
6. **configuracaoPlanosRoutes.js**: Rotas para configuração de planos
7. **integrationRoutes.js**: Rotas para integrações externas

### Executando o Backend

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar em modo de desenvolvimento
npm run dev

# Importar dados iniciais (opcional)
npm run data:import

# Iniciar em modo de produção
npm start
```

### Usuário Administrador Padrão

Após executar o script de importação de dados (`npm run data:import`), o sistema será configurado com um usuário administrador padrão:

- **Email**: irontechdollbrasil@gmail.com
- **Senha**: admin123

Este usuário possui permissões de administrador com acesso a todas as funcionalidades do sistema.

### Usuário Administrador

Para criar ou verificar usuários administradores, use os seguintes scripts:

#### Criar um Administrador Padrão

```bash
cd backend
node scripts/admin-especifico.js
```

Este script criará um administrador com as seguintes credenciais:
- **Email**: admin@base44.com
- **Senha**: admin123456

#### Verificar Status de Administrador

```bash
cd backend
node scripts/verificar-admin.js <email>
```

#### Promover um Usuário para Administrador

```bash
cd backend
node scripts/promover-admin.js <email>
```

#### Criar um Administrador Personalizado

```bash
cd backend
node scripts/createAdmin.js --email "seu-email@exemplo.com" --senha "sua-senha" --plano "enterprise"
```

### Privilégios de Administrador

Os usuários com papel de administrador (role: 'admin') possuem os seguintes privilégios especiais:

1. **Acesso ilimitado a todos os agentes de IA** - Administradores podem acessar todos os agentes disponíveis na plataforma, independentemente do plano.

2. **Créditos ilimitados** - Administradores têm créditos infinitos (∞) para usar os agentes e recursos da plataforma, sem descontos em seu saldo.

3. **Acesso à interface administrativa** - Acesso completo às funcionalidades de gerenciamento de usuários, configurações do sistema e monitoramento de uso.

Para mais detalhes sobre o gerenciamento de usuários administradores, consulte o README do backend.

### Resolução de Problemas Comuns

#### Usuários Duplicados no Banco de Dados

Se encontrar erros como "Usuário já existe" ao tentar registrar usuários, mas não consegue fazer login, pode haver um problema com dados inconsistentes no banco de dados MongoDB. Para resolver:

1. Limpe todos os dados do banco sem reimportar:
   ```bash
   cd backend
   npm run data:destroy
   ```

2. Importe os dados iniciais novamente:
   ```bash
   npm run data:import
   ```

3. Reinicie os servidores de frontend e backend.

Esta operação removerá todos os usuários e dados existentes, então use com cautela em ambientes de produção.

## Comunicação Frontend-Backend

O frontend se comunica com o backend através de uma camada de API implementada com Axios:

1. **base44Client.js**: Cliente Axios configurado com interceptors para:
   - Adicionar token de autenticação às requisições
   - Tratamento de erros de resposta (incluindo redirecionamento para login em caso de erro 401)
   - Funções auxiliares para autenticação (login, registro, logout)

2. **entities.js**: Funções para operações CRUD em cada entidade:
   - User: Gerenciamento de usuários
   - Conversa: Gestão de conversas
   - AgenteConfig: Configuração de agentes
   - Indicacao: Sistema de indicações
   - ConfiguracaoIA: Configurações de IA
   - ConfiguracaoPlanos: Configuração de planos
   - ConfiguracaoPagamento: Configuração de pagamentos

3. **integrations.js**: Funções para integração com serviços externos:
   - InvokeLLM: Invocação de modelos de linguagem
   - GenerateImage: Geração de imagens com IA
   - UploadFile: Upload de arquivos
   - TranscribeAudio: Transcrição de áudio
   - AnalyzeDocument: Análise de documentos
   - RegisterWebhook: Registro de webhooks

## Funcionalidades Principais

- Sistema de autenticação e autorização
- Gerenciamento de usuários e perfis
- Conversas com agentes de IA
- Configuração de agentes personalizados
- Sistema de planos e assinaturas
- Integrações com plataformas externas
- Sistema de indicações

## Documentação

Para mais detalhes sobre a API e suas funcionalidades, consulte a documentação específica:

- [Documentação do Backend](./backend/README.md)

## Solução de Problemas

### Problema: Usuário já existe ou não consegue fazer login

Se você estiver enfrentando problemas com usuários duplicados ou não conseguir fazer login mesmo após o cadastro, siga estas etapas:

1. **Acessar a ferramenta de diagnóstico**: Acesse a página `http://localhost:5173/diagnostico` no navegador.

2. **Limpar o usuário específico**: Use o botão "Remover Usuário" e informe o email que está tendo problemas.

3. **Tentar novamente o cadastro**: Após limpar o usuário, volte para a página de registro (`http://localhost:5173/register`) e tente se cadastrar novamente.

4. **Verificar resposta do servidor**: Se o problema persistir, verifique os logs do servidor para obter mais detalhes sobre o erro.

5. **Limpar o banco de dados**: Se necessário, execute o script de limpeza do banco de dados com `cd backend && node data/seed.js -d`.

### Criando um Usuário Administrador

Para criar um usuário administrador no sistema, você pode usar o script `createAdmin.js`:

```bash
# No diretório backend
cd backend

# Criar administrador com valores padrão (email: admin@example.com, senha: admin123)
node scripts/createAdmin.js

# Criar administrador com valores personalizados
node scripts/createAdmin.js --nome "Nome do Admin" --email "seu@email.com" --senha "suasenha" --plano "enterprise"

# Atualizar usuário existente para administrador
node scripts/createAdmin.js --email "usuario@exemplo.com" --force-update

# Atualizar usuário existente para administrador incluindo atualização de senha
node scripts/createAdmin.js --email "usuario@exemplo.com" --senha "novasenha123" --force-update --update-password
```

Após criar o usuário administrador, você pode fazer login com as credenciais informadas e terá acesso às funcionalidades de administrador do sistema.

### Administrador Padrão

O sistema já vem configurado com um usuário administrador padrão:

- **Email**: irontechdollbrasil@gmail.com
- **Senha**: admin123

### Resolução de Problemas de Interface Administrativa

Se você fez login como administrador mas não está vendo a interface administrativa completa:

1. Verifique se o usuário realmente possui role "admin" no banco de dados usando o script:
   ```bash
   cd backend
   node scripts/verificar-admin.js seu-email@exemplo.com
   ```

2. Certifique-se de fazer logout e login novamente após promover um usuário a administrador

3. Verifique no console do navegador se há erros relacionados à verificação de permissões

## Atualizações e Correções

### Correções de Erros (Última Atualização)

Foram implementadas as seguintes correções:

1. **Adição do método `me()` ao objeto User**:
   - Implementado o método `me()` que primeiro tenta obter os dados do usuário do localStorage e, se não encontrar, busca do servidor.
   - Este método é utilizado em vários componentes como Dashboard, Agentes e Afiliados para obter os dados do usuário logado.

2. **Adição do método `filter()` ao objeto Indicacao e Conversa**:
   - Implementado o método para filtrar indicações e conversas com base em critérios específicos.
   - Utilizado nas páginas de Afiliados e Dashboard para buscar dados filtrados.

3. **Correção do treinamento de agentes**:
   - Corrigido o problema na criação e inicialização de agentes que não fornecia todos os campos obrigatórios.
   - Adicionados os campos `codigo`, `nome`, `descricao` e `instrucoes_sistema` conforme exigido pelo modelo no backend.

4. **Correção do upload de arquivos**:
   - Implementada a rota `/api/integrations/upload` no backend para upload de arquivos genéricos.
   - Corrigida a função `UploadFile` no frontend para criar corretamente o FormData e enviar o arquivo com o nome 'file'.
   - Melhorada a função `handleUploadDocumento` na página Admin para usar a função correta de upload de documentos de treinamento.

### Usuário Administrador