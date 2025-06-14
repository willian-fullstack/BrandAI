# Manual Técnico - BrandAI

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