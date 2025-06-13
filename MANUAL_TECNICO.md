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

### Conclusão

Esta implementação oferece uma experiência visual interativa que reforça o conceito central da plataforma BrandAI. A representação estilizada do cérebro com efeito wireframe ao passar o mouse simboliza a inteligência artificial da plataforma, enquanto mantém a consistência visual com a identidade da marca e garante boa performance em diversos dispositivos. 