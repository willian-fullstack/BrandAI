# Base44 Backend

API RESTful para o aplicativo Base44, construída com Node.js, Express e MongoDB.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB (com Mongoose)
- JWT para autenticação
- bcryptjs para criptografia de senhas
- Outros: cors, dotenv, morgan, express-validator, uuid

## Estrutura do Projeto

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
  ├── README.md         # Este arquivo
  └── server.js         # Ponto de entrada da aplicação
```

## Requisitos

- Node.js (v14 ou superior)
- MongoDB (local ou Atlas)

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` baseado no `.env.example`
   - Defina as variáveis necessárias (MongoDB URI, JWT Secret, etc.)

## Uso

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

### Importar dados iniciais

```bash
npm run data:import
```

### Limpar banco de dados

```bash
npm run data:destroy
```

## Modelos de Dados

### User

Modelo para gerenciamento de usuários e autenticação.

```javascript
{
  nome: String,
  email: String,
  password: String,
  role: String, // 'user', 'admin'
  plano: String, // 'free', 'basic', 'premium'
  avatar: String,
  ultimo_login: Date,
  codigo_indicacao: String,
  indicado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creditos: Number,
  status: String, // 'active', 'inactive', 'suspended'
  data_cadastro: Date,
  data_atualizacao: Date
}
```

Métodos:
- `matchPassword`: Compara a senha fornecida com a senha criptografada
- Hooks: pre-save para criptografar a senha antes de salvar

### Conversa

Modelo para armazenar conversas entre usuários e agentes de IA.

```javascript
{
  titulo: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agente: { type: String, ref: 'AgenteConfig' },
  mensagens: [
    {
      remetente: String, // 'user', 'assistant'
      conteudo: String,
      timestamp: Date,
      metadata: Object
    }
  ],
  status: String, // 'active', 'archived', 'deleted'
  data_criacao: Date,
  data_atualizacao: Date,
  ultima_mensagem: Date
}
```

### AgenteConfig

Modelo para configuração de agentes virtuais.

```javascript
{
  nome: String,
  codigo: String, // Identificador único
  descricao: String,
  prompt_sistema: String,
  icone: String,
  cor: String,
  parametros: {
    temperatura: Number,
    top_p: Number,
    max_tokens: Number,
    modelo: String
  },
  categoria: String,
  visibilidade: String, // 'public', 'private', 'premium'
  criado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data_criacao: Date,
  data_atualizacao: Date
}
```

### Indicacao

Modelo para o sistema de indicações e referências.

```javascript
{
  usuario_origem: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usuario_indicado: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  codigo: String,
  status: String, // 'pending', 'completed', 'expired'
  data_criacao: Date,
  data_processamento: Date,
  recompensa_concedida: Boolean,
  valor_recompensa: Number
}
```

### ConfiguracaoIA

Modelo para configurações dos modelos de IA.

```javascript
{
  gpt_api_key: String, // Armazenada com criptografia
  modelo_preferencial_ia: String,
  parametros_padrao: {
    temperatura: Number,
    top_p: Number,
    max_tokens: Number,
    presence_penalty: Number,
    frequency_penalty: Number
  },
  limite_tokens_diario: Number,
  limite_requisicoes_minuto: Number,
  criado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data_criacao: Date,
  data_atualizacao: Date
}
```

### ConfiguracaoPlanos

Modelo para configuração de planos e assinaturas.

```javascript
{
  plano_basico_preco_mensal: Number,
  plano_basico_preco_anual: Number,
  plano_intermediario_preco_mensal: Number,
  plano_intermediario_preco_anual: Number,
  plano_premium_preco_mensal: Number,
  plano_premium_preco_anual: Number,
  desconto_anual_percentual: Number,
  limite_tokens_free: Number,
  limite_tokens_basico: Number,
  limite_tokens_intermediario: Number,
  limite_tokens_premium: Number,
  recursos_premium: [String],
  data_atualizacao: Date
}
```

### Integration

Modelo para integrações com serviços externos.

```javascript
{
  nome: String,
  tipo: String, // 'webhook', 'api', 'database', etc.
  configuracao: {
    url: String,
    token: String,
    headers: Object,
    metodo: String
  },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String, // 'active', 'inactive', 'error'
  ultima_execucao: Date,
  data_criacao: Date,
  data_atualizacao: Date
}
```

## Controladores

### userController

Implementa a lógica de negócio para gerenciamento de usuários:

- `authUser`: Autentica o usuário e gera token JWT
- `registerUser`: Registra novos usuários
- `getUserProfile`: Obtém o perfil do usuário autenticado
- `updateUserProfile`: Atualiza o perfil do usuário
- `getUsers`: Lista todos os usuários (admin)
- `deleteUser`: Exclui um usuário
- `getUserById`: Obtém um usuário por ID
- `updateUser`: Atualiza um usuário por ID
- `changePassword`: Altera a senha do usuário
- `requestPasswordReset`: Solicita redefinição de senha
- `resetPassword`: Redefine a senha

### conversaController

Implementa a lógica para gestão de conversas com agentes:

- `getConversas`: Lista conversas do usuário
- `getConversaById`: Obtém conversa por ID
- `createConversa`: Cria nova conversa
- `updateConversa`: Atualiza conversa existente
- `deleteConversa`: Exclui conversa
- `addMensagem`: Adiciona mensagem a uma conversa
- `updateStatus`: Atualiza o status da conversa
- `updateTitulo`: Atualiza o título da conversa

### agenteConfigController

Implementa a lógica para configuração de agentes virtuais:

- `getAgentesConfig`: Lista configurações de agentes
- `getAgenteConfigByCodigo`: Obtém configuração por código
- `createAgenteConfig`: Cria nova configuração
- `updateAgenteConfig`: Atualiza configuração existente
- `deleteAgenteConfig`: Exclui configuração

### indicacaoController

Implementa a lógica para o sistema de indicações:

- `verificarCodigo`: Verifica código de indicação
- `getIndicacoes`: Lista indicações do usuário
- `createIndicacao`: Cria nova indicação
- `getEstatisticas`: Obtém estatísticas de indicações
- `processarIndicacao`: Processa indicação

### configuracaoIAController

Implementa a lógica para configurações dos modelos de IA:

- `getConfiguracoes`: Lista configurações
- `getConfiguracaoById`: Obtém configuração por ID
- `createConfiguracao`: Cria nova configuração
- `updateConfiguracao`: Atualiza configuração existente
- `deleteConfiguracao`: Exclui configuração
- `testarConfiguracao`: Testa configuração

### configuracaoPlanosController

Implementa a lógica para configuração de planos e assinaturas:

- `getConfiguracoes`: Lista configurações de planos
- `getConfiguracaoByNome`: Obtém configuração por nome
- `createConfiguracao`: Cria nova configuração
- `updateConfiguracao`: Atualiza configuração existente
- `deleteConfiguracao`: Exclui configuração
- `compararPlanos`: Compara planos

### integrationController

Implementa a lógica para integrações com serviços externos:

- `getIntegrations`: Lista integrações
- `getIntegrationById`: Obtém integração por ID
- `createIntegration`: Cria nova integração
- `updateIntegration`: Atualiza integração existente
- `deleteIntegration`: Exclui integração
- `testarIntegration`: Testa integração

## Middleware

### auth.js

Middleware para autenticação e autorização:

- `protect`: Verifica se o usuário está autenticado
  - Extrai o token do cabeçalho Authorization
  - Verifica e decodifica o token JWT
  - Carrega o usuário do banco de dados
  - Adiciona o usuário ao objeto de requisição

- `admin`: Verifica se o usuário é administrador
  - Deve ser usado após o middleware protect
  - Verifica se o usuário tem role 'admin'

- `premium`: Verifica se o usuário tem plano premium
  - Deve ser usado após o middleware protect
  - Verifica se o usuário tem plano 'premium'

### errorHandler.js

Middleware para tratamento padronizado de erros:

- Converte erros em respostas JSON padronizadas
- Trata diferentes tipos de erros (validação, autenticação, etc.)
- Adiciona códigos de status HTTP apropriados

## Utilitários

### generateToken.js

Utilitário para geração de tokens JWT:

```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
```

### validators.js

Funções de validação para entrada de dados:

- Validação de email
- Validação de senha
- Validação de campos obrigatórios
- Validação de formatos específicos

### encryptionUtils.js

Utilitários para criptografia de dados sensíveis:

- Criptografia de chaves de API
- Geração de hashes seguros
- Geração de códigos aleatórios

## Scripts de Seed

### seed.js

Script para popular o banco de dados com dados iniciais:

- Cria usuário administrador padrão
- Cria configurações de agentes predefinidos
- Configura planos e preços iniciais
- Configura parâmetros padrão de IA

```javascript
// Exemplo de dados para seed
const users = [
  {
    nome: 'Admin User',
    email: 'irontechdollbrasil@gmail.com',
    password: 'admin123',
    role: 'admin',
    plano: 'premium'
  },
  {
    nome: 'Regular User',
    email: 'user@base44.com',
    password: '123456',
    role: 'user',
    plano: 'free'
  }
];

const agentesConfig = [
  {
    nome: 'Assistente Geral',
    codigo: 'assistente-geral',
    descricao: 'Assistente virtual para tarefas gerais',
    prompt_sistema: 'Você é um assistente virtual útil e amigável.',
    icone: 'assistant',
    cor: '#4285F4',
    parametros: {
      temperatura: 0.7,
      top_p: 0.9,
      max_tokens: 2000,
      modelo: 'gpt-4'
    },
    categoria: 'geral',
    visibilidade: 'public'
  },
  // Outros agentes...
];
```

## API Endpoints

### Usuários

- `POST /api/users/login` - Autenticar usuário
- `POST /api/users` - Registrar novo usuário
- `GET /api/users/profile` - Obter perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil do usuário
- `GET /api/users` - Listar todos os usuários (admin)
- `GET /api/users/:id` - Obter usuário por ID (admin)
- `PUT /api/users/:id` - Atualizar usuário (admin)
- `DELETE /api/users/:id` - Excluir usuário (admin)
- `POST /api/users/change-password` - Alterar senha
- `POST /api/users/reset-password-request` - Solicitar redefinição de senha
- `POST /api/users/reset-password` - Redefinir senha

### Conversas

- `GET /api/conversas` - Listar conversas do usuário
- `POST /api/conversas` - Criar nova conversa
- `GET /api/conversas/:id` - Obter conversa por ID
- `DELETE /api/conversas/:id` - Excluir conversa
- `POST /api/conversas/:id/mensagens` - Adicionar mensagem a uma conversa
- `PUT /api/conversas/:id/status` - Atualizar status da conversa
- `PUT /api/conversas/:id/titulo` - Atualizar título da conversa

### Configuração de Agentes

- `GET /api/agente-config` - Listar configurações de agentes
- `GET /api/agente-config/:codigo` - Obter configuração de agente por código
- `POST /api/agente-config` - Criar configuração de agente (admin)
- `PUT /api/agente-config/:codigo` - Atualizar configuração de agente (admin)
- `DELETE /api/agente-config/:codigo` - Excluir configuração de agente (admin)

### Indicações

- `GET /api/indicacoes/verificar/:codigo` - Verificar código de indicação
- `GET /api/indicacoes` - Listar indicações do usuário
- `POST /api/indicacoes` - Criar nova indicação
- `GET /api/indicacoes/estatisticas` - Obter estatísticas de indicações
- `PUT /api/indicacoes/processar/:codigo` - Processar indicação

### Configuração de IA

- `GET /api/configuracao-ia` - Listar configurações de IA (admin)
- `GET /api/configuracao-ia/:id` - Obter configuração de IA por ID (admin)
- `POST /api/configuracao-ia` - Criar configuração de IA (admin)
- `PUT /api/configuracao-ia/:id` - Atualizar configuração de IA (admin)
- `DELETE /api/configuracao-ia/:id` - Excluir configuração de IA (admin)
- `POST /api/configuracao-ia/:id/testar` - Testar configuração de IA (admin)

### Configuração de Planos

- `GET /api/configuracao-planos` - Listar configurações de planos
- `GET /api/configuracao-planos/comparar` - Comparar planos
- `GET /api/configuracao-planos/:nome` - Obter configuração de plano por nome
- `POST /api/configuracao-planos` - Criar configuração de plano (admin)
- `PUT /api/configuracao-planos/:id` - Atualizar configuração de plano (admin)
- `DELETE /api/configuracao-planos/:id` - Excluir configuração de plano (admin)

### Integrações

- `GET /api/integrations/minhas` - Listar integrações do usuário
- `POST /api/integrations` - Criar integração
- `GET /api/integrations/:id` - Obter integração por ID
- `PUT /api/integrations/:id` - Atualizar integração
- `DELETE /api/integrations/:id` - Excluir integração
- `POST /api/integrations/:id/testar` - Testar integração
- `GET /api/integrations` - Listar todas as integrações (admin)

## Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Token). Para acessar endpoints protegidos, inclua o token no cabeçalho da requisição:

```
Authorization: Bearer <seu-token>
```

O token é obtido através do endpoint de login (`POST /api/users/login`).

## Licença

Este projeto está licenciado sob a licença MIT. 

## Administração de Usuários

### Criar ou Atualizar um Usuário Administrador

Para criar um novo usuário administrador ou atualizar um usuário existente para administrador, você pode usar o script `createAdmin.js`:

```bash
# Criar administrador com valores padrão
node scripts/createAdmin.js

# Criar administrador com valores personalizados
node scripts/createAdmin.js --nome "Nome do Admin" --email "admin@exemplo.com" --senha "senha123" --plano "enterprise"

# Atualizar usuário existente e forçar atualização do nome
node scripts/createAdmin.js --email "usuario@exemplo.com" --nome "Novo Nome" --force-update

# Atualizar usuário existente incluindo a senha
node scripts/createAdmin.js --email "usuario@exemplo.com" --senha "novasenha123" --force-update --update-password
```

### Administrador Padrão do Seed

Ao executar o script de importação de dados (`npm run data:import`), um usuário administrador padrão é criado:

- **Email**: irontechdollbrasil@gmail.com
- **Senha**: admin123
- **Plano**: Enterprise 

## Visão Geral

Este é o backend da plataforma Base44, um sistema de assistentes virtuais baseados em IA. O backend é construído com Node.js, Express e MongoDB.

## Requisitos

- Node.js 16+
- MongoDB
- Configuração do arquivo .env (veja abaixo)

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo .env:

```
NODE_ENV=development
PORT=5000
MONGO_URI=sua_string_de_conexao_mongodb
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRE=30d
EMAIL_SERVICE=seu_servico_de_email
EMAIL_USERNAME=seu_usuario_de_email
EMAIL_PASSWORD=sua_senha_de_email
EMAIL_FROM=seu_email_de_origem
```

## Executando o Servidor

### Ambiente de Desenvolvimento

```bash
npm run dev
```

### Ambiente de Produção

```bash
npm start
```

## Gerenciamento de Usuários Administradores

### Criar um Usuário Administrador

Para criar um usuário administrador, você pode usar o script `createAdmin.js`:

```bash
node scripts/createAdmin.js --email "admin@base44.com" --senha "sua_senha" --plano "enterprise"
```

Opções:
- `--email`: Email do administrador (obrigatório)
- `--senha`: Senha do administrador (obrigatório)
- `--nome`: Nome do administrador (opcional, padrão: "Administrador Base44")
- `--plano`: Plano do administrador (opcional, padrão: "free")
- `--force-update`: Atualiza o usuário existente para administrador (opcional)

### Criar o Administrador Padrão

Para criar rapidamente o administrador padrão do sistema:

```bash
node scripts/admin-especifico.js
```

Este script criará um administrador com as seguintes credenciais:
- Email: admin@base44.com
- Senha: admin123456

### Verificar Status de Administrador

Para verificar se um usuário é administrador:

```bash
node scripts/verificar-admin.js <email>
```

Se nenhum email for fornecido, o script verificará o usuário admin@base44.com.

### Promover Usuário para Administrador

Para promover um usuário existente para administrador:

```bash
node scripts/promover-admin.js <email>
```

## Solução de Problemas

### Problemas de Login de Administrador

Se você estiver enfrentando problemas com o login de administrador:

1. Verifique se o usuário existe e é administrador:
   ```
   node scripts/verificar-admin.js admin@base44.com
   ```

2. Se o usuário existir mas não for administrador, promova-o:
   ```
   node scripts/promover-admin.js admin@base44.com
   ```

3. Se o usuário não existir, crie-o:
   ```
   node scripts/createAdmin.js --email "admin@base44.com" --senha "admin123456"
   ```

4. Certifique-se de fazer logout e login novamente no frontend para que as alterações sejam aplicadas.

### Importante: Interface Administrativa

Após fazer login como administrador, você deve ver a interface administrativa completa com todas as funcionalidades. Se isso não acontecer:

1. Verifique no console do navegador se há erros
2. Verifique se o token JWT está sendo corretamente gerado e transmitido
3. Certifique-se de que o frontend está verificando corretamente a função 'admin' do usuário

## API Endpoints

### Autenticação
- `POST /api/users/login` - Login do usuário
- `POST /api/users/register` - Registro de novo usuário
- `GET /api/users/profile` - Obter perfil do usuário atual
- `PUT /api/users/profile` - Atualizar perfil do usuário

### Administração
- `GET /api/users` - Listar todos os usuários (apenas admin)
- `GET /api/users/:id` - Obter usuário por ID (apenas admin)
- `PUT /api/users/:id` - Atualizar usuário (apenas admin)
- `DELETE /api/users/:id` - Deletar usuário (apenas admin)

### Diagnóstico
- `GET /api/diagnostic` - Obter informações de diagnóstico do sistema 