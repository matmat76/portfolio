/**
 * three-background.js - Animation Three.js pour l'arrière-plan
 */

class BackgroundAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);

    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });

    this.clock = new THREE.Clock();
    this.init();
  }

  init() {
    // Configuration initiale
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.position.z = 5;

    // Création des particules
    this.createParticles();

    // Ajout des événements
    window.addEventListener("resize", this.onResize.bind(this));

    // Animation
    this.animate();
  }

  createParticles() {
    const particlesCount = window.innerWidth < 768 ? 1000 : 2000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    const colorOptions = [
      new THREE.Color(0x3b82f6), // Primary
      new THREE.Color(0x60a5fa), // Accent
      new THREE.Color(0x93c5fd), // Light blue
      new THREE.Color(0x2563eb), // Dark blue
    ];

    for (let i = 0; i < particlesCount; i++) {
      // Positions
      positions[i * 3] = (Math.random() - 0.5) * 10; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z

      // Colors - random selection from colorOptions
      const color =
        colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color.r; // r
      colors[i * 3 + 1] = color.g; // g
      colors[i * 3 + 2] = color.b; // b

      // Sizes
      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    // Geometry
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Material
    const particlesMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
          attribute float size;
          varying vec3 vColor;
          
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
      fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            gl_FragColor = vec4(vColor, 1.0 - dist * 2.0);
          }
        `,
    });

    // Create points
    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    // Rotate particles
    this.particles.rotation.x = elapsedTime * 0.05;
    this.particles.rotation.y = elapsedTime * 0.03;

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    // Update sizes
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  const heroCanvas = document.getElementById("hero-canvas");

  if (heroCanvas) {
    const backgroundAnimation = new BackgroundAnimation("hero-canvas");
  }
});
