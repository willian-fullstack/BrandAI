import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

// Caminho do modelo 3D
const MODEL_PATH = '/3d/brain_hologram.glb';

// Componente do cérebro que carrega o modelo GLB
function BrainModel({ isHovered }) {
  const [hasError, setHasError] = useState(false);
  const gltf = useLoader(GLTFLoader, MODEL_PATH, undefined, (error) => {
    console.error("Erro ao carregar o modelo 3D:", error);
    setHasError(true);
  });
  
  const modelRef = useRef();
  const { scene } = useThree();
  const [mousePosition, setMousePosition] = useState([0, 0]);
  
  // Clonar o modelo na primeira renderização
  useEffect(() => {
    if (!gltf || hasError) return;
    
    const clonedScene = gltf.scene.clone();
    
    // Aplicar material personalizado e guardar posições originais
    clonedScene.traverse(node => {
      if (node.isMesh) {
        node.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#8a2be2'),
          emissive: new THREE.Color('#4b0082'),
          emissiveIntensity: 0.5,
          wireframe: isHovered
        });
        
        // Guardar a posição original para animação
        node.userData.originalPosition = node.position.clone();
      }
    });
    
    // Ajustar escala e posição - aumentamos a escala para tornar o cérebro maior
    clonedScene.scale.set(3.5, 3.5, 3.5);
    clonedScene.position.set(0, 0, 0);
    
    // Adicionar à cena
    modelRef.current = clonedScene;
    scene.add(clonedScene);
    
    return () => {
      scene.remove(clonedScene);
    };
  }, [gltf, scene, hasError]);
  
  // Atualizar material quando isHovered mudar
  useEffect(() => {
    if (!modelRef.current) return;
    
    modelRef.current.traverse(node => {
      if (node.isMesh && node.material) {
        node.material.wireframe = isHovered;
      }
    });
  }, [isHovered]);
  
  // Configurar listener para movimento do mouse
  useEffect(() => {
    const handleMouseMove = (event) => {
      // Converter posição do mouse para coordenadas normalizadas (-1 a 1)
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition([x, y]);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Animar o modelo a cada frame com interação do mouse
  useFrame(({ clock }) => {
    if (!modelRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Rotação base com movimento suave
    modelRef.current.rotation.y = time * 0.2;
    
    // Movimento suave de flutuação para cima e para baixo
    modelRef.current.position.y = Math.sin(time * 0.5) * 0.3;
    
    // Interação com o mouse - inclinar o cérebro na direção do mouse
    const [mouseX, mouseY] = mousePosition;
    modelRef.current.rotation.x = THREE.MathUtils.lerp(
      modelRef.current.rotation.x,
      mouseY * 0.2,
      0.1
    );
    
    // Adicionar um leve movimento lateral baseado na posição X do mouse
    modelRef.current.rotation.z = THREE.MathUtils.lerp(
      modelRef.current.rotation.z,
      -mouseX * 0.1,
      0.1
    );
    
    // Efeito de "seguir" levemente o cursor com a posição
    modelRef.current.position.x = THREE.MathUtils.lerp(
      modelRef.current.position.x,
      mouseX * 0.5,
      0.05
    );
  });
  
  return null; // O modelo é adicionado diretamente à cena
}

BrainModel.propTypes = {
  isHovered: PropTypes.bool.isRequired
};

// Componente de fallback para quando o modelo estiver carregando
function LoadingFallback() {
  return null; // Removida a esfera de carregamento
}

// Componente principal que renderiza o Canvas 3D como background
export default function Brain3DViewer() {
  const [isHovered, setIsHovered] = useState(false);
  
  // Fallback simples para quando houver erro
  const errorFallback = (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        background: 'linear-gradient(to bottom, #000000, #1a0033)',
        zIndex: 0 
      }}
    />
  );
  
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          zIndex: 0 
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000', 5, 20]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#9c27b0" />
        
        <Suspense fallback={<LoadingFallback />}>
          <BrainModel isHovered={isHovered} />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </ErrorBoundary>
  );
} 