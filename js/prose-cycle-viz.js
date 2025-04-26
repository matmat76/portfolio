/**
 * Visualisation 3D du cycle en V pour le projet ProSE - Version optimisée avec intégration visuelle
 */

class VCycleVisualization {
  constructor() {
    // Canvas pour la visualisation du cycle en V
    this.canvas = document.getElementById("v-cycle-canvas");
    if (!this.canvas) return;

    // Redimensionner le canvas pour assurer la visibilité complète
    this.canvas.style.height = "600px"; // Hauteur significativement augmentée
    this.canvas.style.width = "100%";

    // Initialisation Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      40, // Champ de vision plus étroit pour mieux voir les détails
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

    // Position de la caméra - ajustée pour montrer tous les éléments
    this.camera.position.z = 15;
    this.camera.position.y = 0;

    // Controls
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedPhase = null;

    // Définition des phases du cycle en V - avec les 5 phases, dont l'intégration en couleur différente
    this.phases = [
      {
        name: "Spécification",
        url: "specification.html",
        position: new THREE.Vector3(-3, 2, 0), // Haut gauche
        highlighted: true,
        color: 0x3b82f6,
        implemented: true,
      },
      {
        name: "Conception",
        url: "conception.html",
        position: new THREE.Vector3(-1.5, 0, 0), // Milieu gauche
        highlighted: true,
        color: 0x3b82f6,
        implemented: true,
      },
      {
        name: "Implémentation",
        url: "implementation.html",
        position: new THREE.Vector3(0, -2, 0), // Bas du V (centré)
        color: 0x3b82f6,
        implemented: true,
      },
      {
        name: "Tests Unitaires",
        url: "tests.html",
        position: new THREE.Vector3(1.5, 0, 0), // Milieu droit
        color: 0x3b82f6,
        implemented: true,
      },
      {
        name: "Tests d'Intégration",
        url: "tests-integration.html",
        position: new THREE.Vector3(3, 2, 0), // Haut droit
        color: 0xff0000, // Rouge
        implemented: true,
      },
    ];

    // Initialisation
    this.init();

    // Animation
    this.animate();
  }

  init() {
    // Fond simple
    this.scene.background = new THREE.Color(0x0f172a);

    // Ajout des lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 10);
    this.scene.add(directionalLight);

    // Création des objets 3D pour chaque phase
    this.phaseObjects = [];
    this.createPhases();

    // Création des lignes du V
    this.createVLines();

    // Ajout des événements
    window.addEventListener("resize", this.onResize.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("click", this.onClick.bind(this));

    // Animation initiale pour attirer l'attention
    this.animatePhases();
  }

  createPhases() {
    // Forme simple et moderne pour toutes les phases
    const phaseGeometry = new THREE.CircleGeometry(0.8, 32); // Rayon réduit

    this.phases.forEach((phase, index) => {
      // Matériau simple avec couleur claire ou grisée selon l'état d'implémentation
      const phaseMaterial = new THREE.MeshBasicMaterial({
        color: phase.color,
        transparent: true,
        opacity: phase.implemented ? 0.9 : 0.6, // Moins opaque si non implémenté
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

      // Création d'un anneau autour du cercle pour plus de style
      const ringGeometry = new THREE.RingGeometry(0.7, 0.8, 32); // Rayon réduit
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: phase.color,
        transparent: true,
        opacity: phase.implemented ? 0.5 : 0.3,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(phase.position);
      this.scene.add(ring);

      // Création des étiquettes de texte
      this.createPhaseLabel(phase, phaseMesh);
    });
  }

  createPhaseLabel(phase, phaseMesh) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 64;

    // Fond de l'étiquette
    context.fillStyle = "rgba(15, 23, 42, 0.85)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Bordure avec couleur adaptée à l'état d'implémentation
    context.strokeStyle = phase.implemented
      ? `rgba(${(phase.color >> 16) & 255}, ${(phase.color >> 8) & 255}, ${
          phase.color & 255
        }, 0.8)`
      : "rgba(100, 116, 139, 0.5)";
    context.lineWidth = 2;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Texte simple et lisible
    context.font = "bold 24px Inter, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = phase.implemented ? "#ffffff" : "#94a3b8"; // Texte grisé si non implémenté
    context.fillText(phase.name, canvas.width / 2, canvas.height / 2);

    // Texture du sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Positionnement du label
    let labelY = phase.position.y;
    if (phase.name === "Implémentation") {
      // Label sous l'icône du bas
      labelY = phase.position.y - 1.1;
    } else if (phase.position.y > 0) {
      // Labels du haut : entre les icônes
      labelY = phase.position.y - 1.1;
    } else if (phase.position.y === 0) {
      // Labels du milieu : entre les icônes
      labelY = phase.position.y - 1.1;
    }

    sprite.position.set(phase.position.x, labelY, phase.position.z);
    sprite.scale.set(1.5, 0.4, 1);

    this.scene.add(sprite);
  }

  createVLines() {
    // Création d'un matériau pour les lignes principales (implémentées)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      linewidth: 2,
    });

    // Matériau pour les lignes non implémentées
    const nonImplementedLineMaterial = new THREE.LineBasicMaterial({
      color: 0x64748b, // Gris
      linewidth: 2,
      opacity: 0.6,
      transparent: true,
      dashSize: 1,
      gapSize: 0.5,
    });

    // Points pour les différents segments du V
    const leftPoints = [
      this.phases[0].position.clone(), // Spécification
      this.phases[1].position.clone(), // Conception
      this.phases[2].position.clone(), // Implémentation (point du bas)
    ];

    const rightImplementedPoints = [
      this.phases[2].position.clone(), // Implémentation
      this.phases[3].position.clone(), // Tests unitaires
    ];

    const rightNonImplementedPoints = [
      this.phases[3].position.clone(), // Tests unitaires
      this.phases[4].position.clone(), // Tests d'intégration
    ];

    // Créer les segments de ligne
    // Côté gauche (implémenté)
    this.createLineSegment(leftPoints, lineMaterial);

    // Côté droit bas (implémenté)
    this.createLineSegment(rightImplementedPoints, lineMaterial);

    // Côté droit haut (non implémenté)
    this.createLineSegment(
      rightNonImplementedPoints,
      nonImplementedLineMaterial
    );
  }

  createLineSegment(points, material) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
  }

  // Animation des phases pour attirer l'attention
  animatePhases() {
    this.phaseObjects.forEach((obj, index) => {
      // Animation seulement pour les phases implémentées
      if (this.phases[index].implemented) {
        setTimeout(() => {
          const duration = 800;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Effet de scale simple
            let scale;
            if (progress < 0.5) {
              scale = 1 + progress * 0.2;
            } else {
              scale = 1.2 - (progress - 0.5) * 0.2;
            }

            obj.scale.set(scale, scale, scale);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              obj.scale.set(1, 1, 1);
            }
          };

          animate();
        }, index * 150);
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
    // Calcul de la position de la souris
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycasting pour détecter les intersections
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.phaseObjects);

    // Réinitialiser tous les objets
    this.phaseObjects.forEach((obj, index) => {
      const phase = this.phases[index];
      obj.material.opacity = phase.implemented ? 0.9 : 0.6;
      obj.scale.set(1, 1, 1);
      this.canvas.style.cursor = "default";
    });

    // Si une intersection est trouvée et que la phase est implémentée
    if (intersects.length > 0) {
      const object = intersects[0].object;
      const phase = this.phases[object.userData.index];

      if (phase.implemented) {
        // Augmenter l'opacité et la taille
        object.material.opacity = 1;
        object.scale.set(1.2, 1.2, 1.2);
        this.canvas.style.cursor = "pointer";
        this.selectedPhase = object.userData;
      } else {
        // Effet léger même pour les non implémentées
        object.material.opacity = 0.7;
        this.selectedPhase = null;
      }
    } else {
      this.selectedPhase = null;
    }
  }

  onClick() {
    // Navigation seulement si une phase implémentée est sélectionnée
    if (
      this.selectedPhase &&
      this.selectedPhase.phase.implemented &&
      this.selectedPhase.phase.url
    ) {
      window.location.href = this.selectedPhase.phase.url;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Animation très légère
    this.scene.rotation.y = Math.sin(Date.now() * 0.0001) * 0.03;

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
