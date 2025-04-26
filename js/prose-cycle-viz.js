/**
 * Visualisation 3D du cycle en V pour le projet ProSE
 */

class VCycleVisualization {
  constructor() {
    // Canvas pour la visualisation du cycle en V
    this.canvas = document.getElementById("v-cycle-canvas");
    if (!this.canvas) return;

    // Initialisation Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });

    // Configuration du renderer
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setClearColor(0x0f172a, 1);

    // Position de la caméra
    this.camera.position.z = 10;
    this.camera.position.y = 2;

    // Controls
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedPhase = null;

    // Définition des phases du cycle en V
    this.phases = [
      {
        name: "Spécification",
        url: "specification.html",
        position: new THREE.Vector3(-7, 4, 0),
        highlighted: true,
      },
      {
        name: "Conception",
        url: "conception.html",
        position: new THREE.Vector3(-7, 0, 0),
        highlighted: true,
      },
      {
        name: "Implémentation",
        url: "implementation.html",
        position: new THREE.Vector3(-7, -4, 0),
      },
      {
        name: "Tests Unitaires",
        url: "tests.html",
        position: new THREE.Vector3(7, 0, 0),
      },
      {
        name: "Tests d'Intégration",
        url: "integration.html",
        position: new THREE.Vector3(7, 4, 0),
      },
    ];

    // Initialisation
    this.init();

    // Animation
    this.animate();
  }

  init() {
    // Ajout des lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // Création des objets 3D pour chaque phase
    this.phaseObjects = [];

    const phaseGeometry = new THREE.BoxGeometry(4, 1.5, 0.5);

    this.phases.forEach((phase, index) => {
      // Matériau de base
      const phaseMaterial = new THREE.MeshStandardMaterial({
        color: phase.highlighted ? 0x3b82f6 : 0x64748b,
        metalness: 0.2,
        roughness: 0.8,
        emissive: phase.highlighted ? 0x3b82f6 : 0x64748b,
        emissiveIntensity: 0.2,
      });

      // Création du mesh
      const phaseMesh = new THREE.Mesh(phaseGeometry, phaseMaterial);
      phaseMesh.position.copy(phase.position);
      phaseMesh.userData = {
        phase: phase,
        index: index,
        originalColor: phaseMaterial.color.clone(),
      };

      this.scene.add(phaseMesh);
      this.phaseObjects.push(phaseMesh);

      // Création des étiquettes de texte (utilisant des sprites)
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 512;
      canvas.height = 128;

      // Dessiner le fond transparent
      context.fillStyle = "rgba(30, 41, 59, 0.8)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Dessiner le texte
      context.font = "bold 40px Inter, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#ffffff";
      context.fillText(phase.name, canvas.width / 2, canvas.height / 2);

      // Texture du sprite
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);

      // Placer le sprite au-dessus du bloc
      sprite.position.set(
        phase.position.x,
        phase.position.y + 1.5,
        phase.position.z
      );
      sprite.scale.set(5, 1.25, 1);

      this.scene.add(sprite);
    });

    // Création des lignes du V
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      linewidth: 2,
    });

    // Ligne verticale gauche
    const pointsLeftVertical = [
      new THREE.Vector3(-7, 4, 0),
      new THREE.Vector3(-7, -4, 0),
    ];
    const leftVerticalGeometry = new THREE.BufferGeometry().setFromPoints(
      pointsLeftVertical
    );
    const leftVerticalLine = new THREE.Line(leftVerticalGeometry, lineMaterial);
    this.scene.add(leftVerticalLine);

    // Ligne verticale droite
    const pointsRightVertical = [
      new THREE.Vector3(7, 4, 0),
      new THREE.Vector3(7, 0, 0),
    ];
    const rightVerticalGeometry = new THREE.BufferGeometry().setFromPoints(
      pointsRightVertical
    );
    const rightVerticalLine = new THREE.Line(
      rightVerticalGeometry,
      lineMaterial
    );
    this.scene.add(rightVerticalLine);

    // Ligne du V
    const pointsV = [
      new THREE.Vector3(-7, -4, 0),
      new THREE.Vector3(0, -7, 0),
      new THREE.Vector3(7, 0, 0),
    ];

    // Créer une courbe pour avoir un V lisse
    const curve = new THREE.CatmullRomCurve3(pointsV);
    const points = curve.getPoints(50);
    const vGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const vLine = new THREE.Line(vGeometry, lineMaterial);
    this.scene.add(vLine);

    // Ajout des événements
    window.addEventListener("resize", this.onResize.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("click", this.onClick.bind(this));

    // Animation initiale pour attirer l'attention
    this.animatePhases();
  }

  // Animation des phases pour attirer l'attention
  animatePhases() {
    this.phaseObjects.forEach((obj, index) => {
      // Animation de mise à l'échelle légère
      gsap.to(obj.scale, {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        duration: 0.8,
        delay: index * 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });

      // Animation de brillance pour les phases mises en avant
      if (obj.userData.phase.highlighted) {
        gsap.to(obj.material, {
          emissiveIntensity: 0.5,
          duration: 0.8,
          delay: index * 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        });
      }
    });
  }

  onResize() {
    if (!this.canvas) return;

    // Mise à jour du renderer et de la caméra lors du redimensionnement
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onMouseMove(event) {
    // Calcul de la position de la souris en coordonnées normalisées
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.canvas.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.canvas.height) * 2 + 1;

    // Raycasting pour détecter les intersections
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.phaseObjects);

    // Réinitialiser tous les objets
    this.phaseObjects.forEach((obj) => {
      obj.material.emissiveIntensity = 0.2;
      this.canvas.style.cursor = "default";
    });

    // Si une intersection est trouvée, surligner l'objet
    if (intersects.length > 0) {
      const object = intersects[0].object;
      object.material.emissiveIntensity = 0.8;
      this.canvas.style.cursor = "pointer";
      this.selectedPhase = object.userData;
    } else {
      this.selectedPhase = null;
    }
  }

  onClick() {
    // Si une phase est sélectionnée, naviguer vers sa page
    if (this.selectedPhase) {
      window.location.href = this.selectedPhase.phase.url;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Légère rotation automatique de la scène pour un effet dynamique
    this.scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;

    // Rendu de la scène
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialisation de la visualisation du cycle en V
document.addEventListener("DOMContentLoaded", () => {
  // Initialisation du background
  if (document.getElementById("prose-canvas")) {
    const proseBackground = new BackgroundAnimation("prose-canvas");
  }

  // Utilisation d'un délai pour s'assurer que Three.js est chargé
  setTimeout(() => {
    if (document.getElementById("v-cycle-canvas")) {
      console.log("Initializing V-Cycle Visualization...");
      try {
        const vCycleViz = new VCycleVisualization();
      } catch (e) {
        console.error("Error initializing V-Cycle Visualization:", e);
      }
    }
  }, 500);
});
