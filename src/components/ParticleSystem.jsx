import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

class Particle {
  constructor(ctx, options = {}) {
    this.ctx = ctx;
    this.x = options.x || Math.random() * ctx.canvas.width;
    this.y = options.y || Math.random() * ctx.canvas.height;
    this.size = options.size || Math.random() * 2.5 + 0.5;
    this.baseSize = this.size;
    this.speedX = options.speedX || (Math.random() - 0.5) * 1.5;
    this.speedY = options.speedY || (Math.random() - 0.5) * 1.5;
    this.color = options.color || '#736ded';
    this.opacity = options.opacity || Math.random() * 0.5 + 0.3;
    this.linkedParticles = [];
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    this.pulseOffset = Math.random() * Math.PI * 2;
  }

  update(mouseX, mouseY, timestamp) {
    // Movimento básico
    this.x += this.speedX;
    this.y += this.speedY;

    // Efeito de pulsação no tamanho
    const pulse = Math.sin(timestamp * this.pulseSpeed + this.pulseOffset);
    this.size = this.baseSize + pulse * 0.5;

    // Efeito de atração para o mouse quando está próximo
    if (mouseX !== undefined && mouseY !== undefined) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
          if (distance < 200) { // Aumentar a área de detecção
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (200 - distance) / 200;
      
      this.speedX += forceDirectionX * force * 0.6; // Dobrar a força de atração
      this.speedY += forceDirectionY * force * 0.6;
      
      // Aumentar o tamanho quando próximo ao mouse
      this.size = this.baseSize + (force * 3); // Aumentar o efeito visual
      }
    }
    
    // Limitar a velocidade (aumentar limite)
    this.speedX = Math.min(Math.max(this.speedX, -3), 3);
    this.speedY = Math.min(Math.max(this.speedY, -3), 3);

    // Aplicar uma resistência menor para movimento mais responsivo
    this.speedX *= 0.95;
    this.speedY *= 0.95;

    // Verificar limites da tela
    if (this.x < 0) {
      this.x = 0;
      this.speedX *= -1;
    } else if (this.x > this.ctx.canvas.width) {
      this.x = this.ctx.canvas.width;
      this.speedX *= -1;
    }
    
    if (this.y < 0) {
      this.y = 0;
      this.speedY *= -1;
    } else if (this.y > this.ctx.canvas.height) {
      this.y = this.ctx.canvas.height;
      this.speedY *= -1;
    }
  }

  draw() {
    // Desenhar o círculo principal
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.globalAlpha = this.opacity;
    this.ctx.fill();
    
    // Adicionar um efeito de brilho
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
    const gradient = this.ctx.createRadialGradient(
      this.x, this.y, this.size * 0.5,
      this.x, this.y, this.size * 2
    );
    gradient.addColorStop(0, `${this.color}80`); // 50% de opacidade
    gradient.addColorStop(1, `${this.color}00`); // 0% de opacidade
    this.ctx.fillStyle = gradient;
    this.ctx.globalAlpha = this.opacity * 0.5;
    this.ctx.fill();
    
    this.ctx.globalAlpha = 1;
  }

  drawConnections() {
    for (const particle of this.linkedParticles) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(particle.x, particle.y);
      
      // Calcular a distância para determinar a opacidade da linha
      const dx = this.x - particle.x;
      const dy = this.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const opacity = 1 - (distance / 150);
      
      // Criar um gradiente para a linha
      const gradient = this.ctx.createLinearGradient(
        this.x, this.y, particle.x, particle.y
      );
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, particle.color);
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = opacity * 0.8;
      this.ctx.globalAlpha = opacity * 0.5;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }
  }
}

class ParticleSystemClass {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouseX = undefined;
    this.mouseY = undefined;
    this.fps = options.fps || 60;
    this.minDist = options.minDist || 150;
    this.particleCount = options.particleCount || 100;
    this.colors = options.colors || ['#736ded', '#00b6ff', '#8a2be2'];
    this.animationId = null;
    this.lastTime = 0;
    this.interval = 1000 / this.fps;
    this.isActive = true;
    
    // Configurar eventos do mouse
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    
    this.canvas.addEventListener('mousemove', this.handleMouseMove, { passive: false });
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleMouseLeave, { passive: false });
    
    // Configurar redimensionamento
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    
    // Log para debug
    console.log('ParticleSystem inicializado com canvas:', this.canvas.width, 'x', this.canvas.height);
  }

  handleResize() {
    const { clientWidth, clientHeight } = document.documentElement;
    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;
    this.init();
    console.log('Canvas redimensionado para:', this.canvas.width, 'x', this.canvas.height);
  }

  handleMouseMove(e) {
    if (!this.isActive) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    
    // Log para debug
    console.log('Mouse move:', this.mouseX, this.mouseY);
  }
  
  handleTouchMove(e) {
    if (!this.isActive || !e.touches || e.touches.length === 0) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.touches[0].clientX - rect.left;
    this.mouseY = e.touches[0].clientY - rect.top;
    e.preventDefault(); // Prevenir scroll em dispositivos móveis
    
    // Log para debug
    console.log('Touch move:', this.mouseX, this.mouseY);
  }

  handleMouseLeave() {
    this.mouseX = undefined;
    this.mouseY = undefined;
  }

  init() {
    this.particles = [];
    
    // Criar partículas
    for (let i = 0; i < this.particleCount; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.particles.push(new Particle(this.ctx, { color }));
    }
  }

  updateParticleLinks() {
    // Limpar links anteriores
    for (const particle of this.particles) {
      particle.linkedParticles = [];
    }
    
    // Estabelecer novos links baseados na distância
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.minDist) {
          this.particles[i].linkedParticles.push(this.particles[j]);
          this.particles[j].linkedParticles.push(this.particles[i]);
        }
      }
    }
  }

  animate(timestamp) {
    if (!this.isActive) return;
    
    const deltaTime = timestamp - this.lastTime;
    
    if (deltaTime >= this.interval) {
      // Limpar o canvas com um efeito de fade
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Atualizar e desenhar partículas
      for (const particle of this.particles) {
        particle.update(this.mouseX, this.mouseY, timestamp * 0.001);
      }
      
      // Atualizar links entre partículas
      this.updateParticleLinks();
      
      // Desenhar conexões e partículas
      for (const particle of this.particles) {
        particle.drawConnections();
      }
      
      for (const particle of this.particles) {
        particle.draw();
      }
      
      this.lastTime = timestamp - (deltaTime % this.interval);
    }
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

  start() {
    if (!this.animationId) {
      this.isActive = true;
      
      // Limpar o canvas antes de iniciar
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.animationId = requestAnimationFrame(this.animate.bind(this));
      console.log('ParticleSystem iniciado');
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.isActive = false;
      console.log('ParticleSystem parado');
    }
  }
  
  cleanup() {
    this.stop();
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleMouseLeave);
    window.removeEventListener('resize', this.handleResize);
    console.log('ParticleSystem limpo');
  }
}

export default function ParticleSystem({ className = '' }) {
  const canvasRef = useRef(null);
  const systemRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const system = new ParticleSystemClass({
      canvas: canvasRef.current,
      particleCount: 60, // Reduzir número de partículas para melhor performance
      minDist: 180, // Aumentar distância de conexão
      fps: 120, // Aumentar taxa de atualização
      colors: ['#736ded', '#00b6ff', '#8a2be2']
    });
    
    system.init();
    system.start();
    systemRef.current = system;
    
    return () => {
      if (systemRef.current) {
        systemRef.current.cleanup();
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 w-full h-full z-0 ${className}`}
      style={{ touchAction: 'none' }} // Impedir comportamentos padrão de toque
    />
  );
}

ParticleSystem.propTypes = {
  className: PropTypes.string
}; 