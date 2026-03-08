import { useEffect, useRef } from 'react';

export default function MesmerizingBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.color = this.getRandomColor();
      }

      getRandomColor() {
        const colors = [
          '232, 160, 191', // accent
          '167, 139, 250', // body
          '245, 158, 122', // home
          '251, 113, 133', // anger
          '103, 232, 249', // dream
          '240, 171, 252', // love
          '134, 239, 172', // worth
          '253, 230, 138'  // voice
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += this.pulseSpeed;

        // Wrap around edges
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
      }

      draw() {
        const pulseFactor = Math.sin(this.pulse) * 0.3 + 0.7;
        const currentSize = this.size * pulseFactor;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentSize * 4);
        gradient.addColorStop(0, `rgba(${this.color}, ${this.opacity})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity * 1.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particles = [];
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Connection lines
    function drawConnections() {
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.2;
            ctx.strokeStyle = `rgba(232, 160, 191, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
    }

    // Floating orbs
    class FloatingOrb {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 60 + 20;
        this.color = `hsla(${Math.random() * 60 + 280}, 70%, 60%, 0.03)`;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color.replace('0.03', '0.08'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const orbs = [];
    for (let i = 0; i < 5; i++) {
      orbs.push(new FloatingOrb());
    }

    // Animation loop
    let time = 0;
    function animate() {
      time += 0.005;

      // Clear with trail effect
      ctx.fillStyle = 'rgba(8, 6, 8, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw orbs
      orbs.forEach(orb => {
        orb.update();
        orb.draw();
      });

      // Draw connections
      drawConnections();

      // Draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Add subtle wave effect
      const waveGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      waveGradient.addColorStop(0, `rgba(167, 139, 250, ${Math.sin(time) * 0.02 + 0.02})`);
      waveGradient.addColorStop(0.5, `rgba(232, 160, 191, ${Math.cos(time) * 0.02 + 0.02})`);
      waveGradient.addColorStop(1, `rgba(103, 232, 249, ${Math.sin(time + 1) * 0.02 + 0.02})`);
      
      ctx.fillStyle = waveGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="mesmerizing-background">
      <canvas
        ref={canvasRef}
        className="background-canvas"
      />
      <div className="background-overlay"></div>
    </div>
  );
}
