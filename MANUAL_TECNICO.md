# Manual Técnico - BrandzLAB

## Visualização 3D do Cérebro

### Visão Geral

O componente de visualização 3D do cérebro (`Brain3DViewer`) na página inicial utiliza Three.js e React Three Fiber para renderizar uma representação estilizada de um cérebro usando geometrias básicas. Esta visualização é exibida de forma interativa, com efeitos de wireframe ao passar o mouse, representando visualmente o conceito de inteligência artificial avançada da plataforma.

### Implementação Técnica

O componente está localizado em `src/components/Brain3DModel.jsx` e utiliza bibliotecas modernas de renderização 3D:

1. **Bibliotecas Principais**:
   - `three`: Biblioteca JavaScript para renderização 3D (versão 0.151.0)
   - `@react-three/fiber`: Adaptador React para Three.js (versão 8.14.5)
   - `@react-three/drei`: Componentes e helpers úteis para React Three Fiber (versão 9.88.0)

2. **Estrutura do Componente**:
   - `Brain3DViewer`: Componente principal que renderiza o Canvas 3D e controla o estado de hover
   - `Brain`: Componente interno que implementa a representação visual e as animações

### Características Principais

1. **Representação Visual**:
   - Utiliza uma esfera central para representar o cérebro
   - Adiciona partículas ao redor para simular conexões neurais (sinapses)
   - Implementa uma abordagem geometricamente simplificada para melhor performance

2. **Personalização Visual**:
   - Aplica materiais com efeitos brilhantes
   - Utiliza cores em tons de roxo para manter consistência com a identidade visual da marca
   - Alterna entre materiais sólidos e wireframe dependendo da interação do usuário

3. **Animações Interativas**:
   - **Rotação Automática**: Movimento suave de rotação contínua
   - **Efeito Wireframe**: Quando o mouse passa sobre o modelo, ele muda para modo wireframe
   - **Mudança de Cor**: A cor se intensifica no hover para feedback visual

### Exemplo de Código Relevante

```jsx
// Componente do cérebro com animação
function Brain({ isHovered }) {
  const brainRef = useRef();
  
  // Animação de rotação
  useFrame(() => {
    if (brainRef.current) {
      brainRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <group ref={brainRef}>
      {/* Esfera principal (cérebro) */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color={isHovered ? "#b967ff" : "#8a2be2"} 
          wireframe={isHovered}
          emissive="#4b0082"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Partículas ao redor (sinapses) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 1.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 2;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#cc66ff" emissive="#9933ff" />
          </mesh>
        );
      })}
    </group>
  );
}
```

### Otimizações e Performance

Para garantir bom desempenho, o componente implementa várias otimizações:

1. **Geometria Simplificada**: Uso de formas básicas em vez de modelos complexos
2. **Número Limitado de Partículas**: Apenas 20 esferas pequenas para representar sinapses
3. **Materiais Simples**: Uso de `meshStandardMaterial` em vez de materiais mais complexos
4. **Animações Básicas**: Rotação simples sem cálculos complexos

### Requisitos do Sistema

- **Navegadores**: Compatível com navegadores modernos que suportam WebGL
- **Dispositivos**: Funciona bem mesmo em dispositivos com capacidade gráfica limitada
- **Responsividade**: Adapta-se a diferentes tamanhos de tela com altura fixa de 400px

### Versões Compatíveis

Para garantir a compatibilidade e evitar problemas de renderização, o componente utiliza as seguintes versões específicas:

- three: 0.151.0
- @react-three/fiber: 8.14.5
- @react-three/drei: 9.88.0

## Gerenciamento de Usuários no Painel Administrativo

### Visão Geral

O painel administrativo inclui uma seção completa para gerenciamento de usuários, permitindo que administradores visualizem e configurem todos os usuários cadastrados na plataforma. Esta funcionalidade está implementada na aba "Usuários" do componente `Admin.jsx`.

### Funcionalidades Principais

1. **Listagem de Usuários**:
   - Exibição de todos os usuários cadastrados em formato de tabela
   - Informações exibidas: nome, email, plano, créditos, status e permissões de administrador
   - Ordenação e filtragem para facilitar a localização de usuários específicos

2. **Edição de Usuários**:
   - Interface modal para edição completa de informações do usuário
   - Campos editáveis: nome, email, status, plano, permissões de administrador
   - Gerenciamento de créditos com opções para adicionar quantidades predefinidas ou definir um valor específico
   - Opção para configurar créditos ilimitados

3. **Gerenciamento de Acesso a Agentes**:
   - Configuração granular de quais agentes cada usuário pode acessar
   - Interface de seleção múltipla com checkboxes para cada agente disponível
   - Visualização clara dos agentes já liberados para o usuário

4. **Controle de Permissões**:
   - Opção para promover usuários a administradores
   - Configuração de status (ativo, inativo, pendente)
   - Definição de plano (básico, intermediário, premium)

### Implementação Técnica

O gerenciamento de usuários é implementado utilizando:

1. **Componentes de Interface**:
   - Modal de edição com formulário completo
   - Tabela responsiva para listagem de usuários
   - Componentes de seleção, checkbox e input para configurações

2. **Integração com API**:
   - Método `User.getAll()` para listar todos os usuários
   - Método `User.updateAdmin()` para atualizar informações de usuários
   - Tratamento adequado de erros e feedback visual

3. **Modelo de Dados**:
   - Campo `agentes_liberados` no modelo de usuário para armazenar IDs dos agentes liberados
   - Campo `creditos_ilimitados` para configuração de créditos sem limites
   - Campo `role` para definir permissões de administrador

### Exemplo de Código Relevante

```jsx
// Função para alternar a liberação de um agente para um usuário
const toggleAgenteParaUsuario = (usuario, agenteId) => {
  const agentesLiberados = usuario.agentes_liberados || [];
  const novaLista = agentesLiberados.includes(agenteId)
    ? agentesLiberados.filter(id => id !== agenteId)
    : [...agentesLiberados, agenteId];
  
  setEditandoUsuario({
    ...usuario,
    agentes_liberados: novaLista
  });
};

// Função para salvar alterações no usuário
const handleSalvarUsuario = async () => {
  try {
    if (!editandoUsuario) return;
    
    const response = await User.updateAdmin(editandoUsuario._id, {
      nome: editandoUsuario.nome,
      email: editandoUsuario.email,
      role: editandoUsuario.role,
      plano_atual: editandoUsuario.plano_atual,
      status: editandoUsuario.status,
      creditos_restantes: editandoUsuario.creditos_restantes,
      agentes_liberados: editandoUsuario.agentes_liberados || [],
      creditos_ilimitados: editandoUsuario.creditos_ilimitados || false
    });
    
    // Atualizar a lista de usuários
    setUsuarios(usuarios.map(user => 
      user._id === editandoUsuario._id ? response : user
    ));
    
    setEditandoUsuario(null);
    setNotificacao({
      tipo: 'sucesso',
      mensagem: 'Usuário atualizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    setNotificacao({
      tipo: 'erro',
      mensagem: `Erro ao atualizar usuário: ${error.message || 'Erro desconhecido'}`
    });
  }
};
```

### Considerações de Segurança

1. **Validação de Permissões**:
   - Apenas administradores têm acesso ao painel de gerenciamento de usuários
   - Middleware de autenticação no backend verifica permissões antes de permitir operações
   
2. **Validação de Dados**:
   - Validação no frontend e backend para garantir integridade dos dados
   - Tratamento adequado de erros com feedback visual para o administrador

3. **Auditoria**:
   - Registro de alterações em usuários para fins de auditoria
   - Logs detalhados de operações de administração

### Conclusão

O sistema de gerenciamento de usuários oferece controle completo sobre os usuários da plataforma, permitindo configurações granulares de permissões, créditos e acesso a agentes. A interface intuitiva facilita a administração mesmo com um grande número de usuários, mantendo a segurança e a integridade dos dados.

## Gestão de Acesso a Agentes

O sistema implementa uma abordagem híbrida para gerenciar o acesso dos usuários aos agentes IA:

1. **Acesso baseado em plano**:
   - Cada plano (básico, intermediário, premium) tem uma lista predefinida de agentes disponíveis
   - A configuração dos agentes por plano é centralizada no arquivo `src/config/agentes.js`
   - Por padrão, os usuários têm acesso aos agentes incluídos em seu plano atual

2. **Acesso personalizado pelo admin**:
   - Administradores podem personalizar o acesso de cada usuário aos agentes
   - Ao editar um usuário no painel admin, o administrador pode:
     - Selecionar manualmente quais agentes estarão disponíveis para o usuário
     - Ao mudar o plano do usuário, os agentes são automaticamente atualizados conforme o novo plano
     - As personalizações manuais têm prioridade sobre as configurações do plano

3. **Verificação de acesso**:
   - O sistema verifica o acesso aos agentes em dois níveis:
     - Verifica se o agente está disponível no plano do usuário
     - Verifica se o agente foi liberado manualmente pelo administrador
   - O usuário tem acesso se qualquer uma das condições for atendida

Esta abordagem oferece flexibilidade para configurar o acesso padrão por plano e, ao mesmo tempo, permite personalizações específicas por usuário quando necessário.

## Funcionalidades de Ofertas e Cupons

### Visão Geral
O sistema agora suporta ofertas e cupons de desconto para os planos disponíveis. Estas funcionalidades permitem:

1. **Ofertas**: Configurar preços promocionais com exibição do preço original riscado
2. **Cupons de Desconto**: Criar e gerenciar cupons com diferentes tipos de desconto (percentual ou valor fixo)

### Modelo de Dados

O modelo `ConfiguracaoPlanos` foi estendido para incluir:

#### Campos para Ofertas:
- `plano_X_preco_original_mensal`: Preço original mensal do plano (para exibir riscado)
- `plano_X_preco_original_anual`: Preço original anual do plano (para exibir riscado)
- `oferta_ativa`: Booleano que indica se há uma oferta ativa
- `oferta_titulo`: Título da oferta (ex: "Promoção de Lançamento")
- `oferta_descricao`: Descrição da oferta (ex: "30% de desconto por tempo limitado")
- `oferta_data_inicio`: Data de início da oferta
- `oferta_data_fim`: Data de término da oferta

#### Campos para Cupons:
- `cupons`: Array de objetos com a seguinte estrutura:
  - `codigo`: Código do cupom (ex: "PROMO10")
  - `descricao`: Descrição do cupom
  - `tipo`: Tipo de desconto ("percentual" ou "valor_fixo")
  - `valor`: Valor do desconto (percentual ou valor em reais)
  - `data_inicio`: Data de início da validade
  - `data_expiracao`: Data de expiração
  - `limite_usos`: Limite de usos (0 = ilimitado)
  - `usos_atuais`: Contador de usos atuais
  - `planos_aplicaveis`: Array com IDs dos planos aplicáveis ("basico", "intermediario", "premium")
  - `ativo`: Booleano que indica se o cupom está ativo

### Endpoints da API

#### Verificar Cupom
- **Endpoint**: `GET /api/configuracao-planos/verificar-cupom/:codigo`
- **Descrição**: Verifica se um cupom é válido
- **Resposta de Sucesso**:
  ```json
  {
    "valido": true,
    "cupom": {
      "codigo": "PROMO10",
      "tipo": "percentual",
      "valor": 10,
      "descricao": "Desconto de 10%",
      "planos_aplicaveis": ["basico", "intermediario", "premium"]
    }
  }
  ```

#### Aplicar Cupom
- **Endpoint**: `PUT /api/configuracao-planos/aplicar-cupom/:codigo`
- **Descrição**: Incrementa o contador de uso do cupom
- **Resposta de Sucesso**:
  ```json
  {
    "message": "Cupom aplicado com sucesso",
    "usos_atuais": 1
  }
  ```

### Interface de Administração

No painel administrativo, na aba "Ofertas", os administradores podem:

1. **Configurar Ofertas**:
   - Ativar/desativar ofertas
   - Definir título e descrição da oferta
   - Configurar período de validade
   - Definir preços originais para exibição riscada

2. **Gerenciar Cupons**:
   - Criar novos cupons
   - Editar cupons existentes
   - Definir tipo de desconto (percentual ou valor fixo)
   - Configurar validade e limite de usos
   - Especificar planos aplicáveis

### Interface do Cliente

Na página de Planos, os clientes podem:

1. **Ver Ofertas**:
   - Preços promocionais são exibidos normalmente
   - Preços originais são exibidos riscados quando há uma oferta ativa
   - Percentual de desconto é calculado e exibido automaticamente

2. **Aplicar Cupons**:
   - Campo para inserir código de cupom
   - Botão para aplicar o cupom
   - Exibição do desconto aplicado
   - Opção para remover o cupom aplicado

### Lógica de Negócios

1. **Validação de Cupons**:
   - Verifica se o cupom existe
   - Verifica se o cupom está ativo
   - Verifica se o cupom está dentro do período de validade
   - Verifica se o limite de usos não foi excedido

2. **Cálculo de Descontos**:
   - Para descontos percentuais: `preco - (preco * percentual / 100)`
   - Para descontos de valor fixo: `preco - valor`
   - O desconto só é aplicado aos planos especificados em `planos_aplicaveis`

## Sistema de Ofertas e Cupons

### Preços Riscados (Ofertas)

O sistema permite exibir preços promocionais com os preços originais riscados. Para isso, é necessário:

1. Configurar os preços originais para cada plano (mensal e anual)
2. Ativar a oferta através do campo `oferta_ativa`
3. Opcionalmente, configurar um título e descrição para a oferta

Os preços riscados só serão exibidos quando:
- A oferta estiver ativa (`oferta_ativa = true`)
- O preço original for maior que o preço atual
- O preço original for maior que zero

Se houver problemas com a exibição dos preços riscados, verifique se:
- Os preços originais estão corretamente configurados e são maiores que os preços atuais
- A oferta está ativa
- Os valores estão sendo convertidos corretamente para números (use `Number()` para garantir)

Para configurar rapidamente os preços originais, você pode usar o script `scripts/atualizar-precos-originais.js` que define automaticamente os preços originais como 20% maiores que os preços atuais.

### Cupons de Desconto

O sistema de cupons permite oferecer descontos especiais aos usuários. Cada cupom possui:

## Configuração Avançada de Planos

### Visão Geral

O sistema agora oferece configurações avançadas para os planos, permitindo:

1. **Ativar/Desativar Plano Anual**: Opção para mostrar ou ocultar a opção de pagamento anual
2. **Editar Recursos de Cada Plano**: Personalização completa das descrições dos recursos de cada plano

### Modelo de Dados

O modelo `ConfiguracaoPlanos` foi estendido com os seguintes campos:

#### Controle de Plano Anual:
- `plano_anual_ativo`: Booleano que indica se o plano anual está disponível (default: true)

#### Recursos Personalizáveis por Plano:
- `recursos_planos`: Objeto contendo arrays de recursos para cada plano:
  - `basico`: Array de strings com os recursos do plano básico
  - `intermediario`: Array de strings com os recursos do plano intermediário
  - `premium`: Array de strings com os recursos do plano premium

### Interface de Administração

No painel administrativo, na aba "Planos", os administradores podem:

1. **Configurar Disponibilidade do Plano Anual**:
   - Ativar/desativar a opção de pagamento anual através de um checkbox
   - Quando desativado, apenas os preços mensais serão exibidos na página de planos

2. **Editar Recursos de Cada Plano**:
   - Interface de edição de texto com um recurso por linha
   - Edição independente para cada plano (básico, intermediário e premium)
   - As alterações são refletidas imediatamente na página de planos

### Comportamento no Frontend

Na página de Planos, o sistema se comporta da seguinte forma:

1. **Plano Anual Desativado**:
   - O toggle entre plano mensal e anual não é exibido
   - Apenas os preços mensais são mostrados
   - O usuário não tem a opção de escolher o plano anual

2. **Recursos Personalizados**:
   - Os recursos exibidos para cada plano são exatamente os definidos no painel administrativo
   - Se nenhum recurso for definido, o sistema usa valores padrão pré-configurados

### Implementação Técnica

1. **Verificação de Plano Anual**:
   ```jsx
   {configPlanos.plano_anual_ativo !== false && (
     <div className="inline-flex items-center bg-card border border-border p-1 rounded-full backdrop-blur-sm shadow-lg mx-auto mb-6">
       {/* Toggle de plano anual/mensal */}
     </div>
   )}
   ```

2. **Exibição de Recursos Personalizados**:
   ```jsx
   const planos = [
     {
       id: 'basico',
       // ...outros campos
       recursos: configPlanos.recursos_planos?.basico || [
         // recursos padrão caso não haja personalização
       ]
     },
     // outros planos
   ];
   ```

3. **Edição de Recursos no Painel Admin**:
   ```jsx
   <Textarea
     name="recursos_planos_basico"
     value={(configPlanos?.recursos_planos?.basico || [
       // valores padrão
     ]).join('\n')}
     onChange={(e) => {
       const recursos = e.target.value.split('\n').filter(item => item.trim() !== '');
       setConfigPlanos({
         ...configPlanos,
         recursos_planos: {
           ...(configPlanos.recursos_planos || {}),
           basico: recursos
         }
       });
     }}
     placeholder="Digite um recurso por linha"
     className="min-h-[150px]"
   />
   ```

### Considerações Importantes

1. **Migração de Dados**:
   - Ao atualizar para esta versão, os recursos padrão serão usados até que sejam personalizados
   - Não é necessário configurar manualmente os recursos para cada plano se os padrões forem adequados

2. **Compatibilidade**:
   - A desativação do plano anual afeta apenas a interface do usuário, não altera planos existentes
   - Usuários que já possuem planos anuais continuarão com seus planos normalmente

3. **Boas Práticas**:
   - Mantenha os recursos concisos e diretos para melhor legibilidade
   - Use linguagem consistente entre os diferentes planos
   - Destaque claramente as diferenças entre os planos 

## Configuração de Planos

### Planos Administrativos

O sistema permite a configuração completa dos planos através do painel administrativo. As configurações incluem:

1. **Preços mensais e anuais** para cada plano
2. **Ativação/desativação do plano anual** - quando desativado, apenas os preços mensais são exibidos
3. **Recursos de cada plano** - lista de funcionalidades incluídas em cada plano, exibidas como itens com marcadores

### Exibição de Planos

Os planos são exibidos em duas páginas principais:

1. **Página de Planos** (`/planos`) - Página dedicada para visualização e seleção de planos
2. **Página Inicial** (`/`) - Seção de planos na página inicial

Ambas as páginas utilizam as mesmas configurações definidas pelo administrador, garantindo consistência na exibição dos planos em todo o site. Quando o administrador atualiza as configurações de planos no painel administrativo, as alterações são refletidas automaticamente em ambas as páginas.

### Configurações Disponíveis

- **Preços**: Valores mensais e anuais para cada plano
- **Plano Anual**: Opção para ativar ou desativar a exibição e seleção do plano anual
- **Recursos**: Lista de recursos para cada plano, com cada item exibido como uma linha separada
- **Ofertas**: Configuração de preços promocionais com exibição de preços riscados

## Vídeo na Seção Hero

### Visão Geral

A seção hero da página inicial inclui um vídeo demonstrativo que é reproduzido automaticamente quando a página é carregada. O vídeo é exibido em um container estilizado que mantém a consistência visual com o restante da interface.

### Implementação Técnica

O vídeo está implementado no componente `Hero` em `src/pages/Home.jsx` usando a tag HTML5 `<video>` com os seguintes atributos:

```jsx
<video 
  className="w-full block"
  autoPlay
  muted
  loop
  playsInline
  src="/videos/video1.mp4"
>
  Seu navegador não suporta a reprodução de vídeos.
</video>
```

### Atributos do Vídeo

1. **autoPlay**: Inicia a reprodução automaticamente quando a página carrega
2. **muted**: Reproduz sem áudio (necessário para autoplay em muitos navegadores)
3. **loop**: Reproduz o vídeo em loop contínuo
4. **playsInline**: Reproduz inline em dispositivos móveis em vez de tela cheia
5. **className="w-full block"**: Garante que o vídeo ocupe toda a largura disponível e seja exibido como um elemento de bloco

### Estrutura de Arquivos

O arquivo de vídeo está localizado em:
- `/public/videos/video1.mp4`

### Estilização

O container do vídeo utiliza as seguintes classes CSS:
- `hero-video-container`: Classe que aplica animação de fade-in ao carregar a página
- `w-full max-w-4xl mx-auto`: Controla a largura máxima e centraliza o vídeo
- `bg-black/80 border border-gray-800/30`: Aplica fundo escuro e borda sutil
- `rounded-xl overflow-hidden shadow-2xl`: Adiciona cantos arredondados e sombra

### Considerações de Performance

1. **Formato do Vídeo**: MP4 com codificação H.264 para melhor compatibilidade
2. **Tamanho do Arquivo**: O vídeo deve ser otimizado para web para carregamento rápido
3. **Fallback**: Texto alternativo para navegadores que não suportam vídeo HTML5

### Responsividade

O vídeo se adapta a diferentes tamanhos de tela:
- Em dispositivos móveis: Ocupa a largura total disponível
- Em dispositivos maiores: Respeita a largura máxima definida (`max-w-4xl`)
- A proporção de aspecto original do vídeo é mantida automaticamente
- A estrutura simplificada (sem divs aninhados desnecessários) garante que o vídeo mantenha suas proporções originais

### Solução de Problemas

Se o vídeo aparecer cortado:
1. Verifique se não há restrições de altura (height) aplicadas ao vídeo ou seu container
2. Certifique-se de que o vídeo está diretamente dentro do container principal, sem divs intermediários com restrições de tamanho
3. Use a classe `block` no vídeo para garantir que ele seja tratado como um elemento de bloco 