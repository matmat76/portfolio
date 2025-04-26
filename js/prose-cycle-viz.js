/**
 * Visualisation 3D du cycle en V pour le projet ProSE - Version compacte
 */

class VCycleVisualization {
  constructor() {
    // Canvas pour la visualisation du cycle en V
    this.canvas = document.getElementById("v-cycle-canvas");
    if (!this.canvas) return;

    // Redimensionner le canvas pour assurer la visibilité complète
    this.canvas.style.height = "600px"; // Hauteur ajustée
    this.canvas.style.width = "100%";

    // Initialisation Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      50, // Champ de vision élargi pour voir plus d'éléments
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

    // Position de la caméra - reculée pour voir l'ensemble
    this.camera.position.z = 20;
    this.camera.position.y = 0;

    // Controls
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedPhase = null;

    // Définition des phases du cycle en V avec positions compactes
    this.phases = [
      // Côté gauche
      {
        name: "Spécification",
        url: "specification.html",
        position: new THREE.Vector3(-10, 6, 0),
        highlighted: true,
        color: 0x3b82f6,
        implemented: true,
        side: "left",
      },
      {
        name: "Conception générale",
        url: "conception-generale.html",
        position: new THREE.Vector3(-8, 2, 0),
        highlighted: true,
        color: 0x3b82f6,
        implemented: true,
        side: "left",
      },
      {
        name: "Conception détaillée",
        url: "conception-detaillee.html",
        position: new THREE.Vector3(-6, -2, 0),
        highlighted: true,
        color: 0x3b82f6,
        implemented: true,
        side: "left",
      },
      {
        name: "Implémentation",
        url: "implementation.html",
        position: new THREE.Vector3(-4, -6, 0),
        color: 0x3b82f6,
        implemented: true,
        side: "left",
      },

      // Côté droit
      {
        name: "Tests composants",
        url: "tests-composants.html",
        position: new THREE.Vector3(4, -6, 0),
        color: 0x3b82f6,
        implemented: true,
        side: "right",
      },
      {
        name: "Tests intégration",
        url: "tests-integration.html",
        position: new THREE.Vector3(6, -2, 0),
        color: 0x3b82f6,
        implemented: true,
        side: "right",
      },
      {
        name: "Tests fonctionnels",
        url: "tests-fonctionnels.html",
        position: new THREE.Vector3(8, 2, 0),
        color: 0x3b82f6,
        implemented: true,
        side: "right",
      },
      {
        name: "Tests performances",
        url: "tests-performances.html",
        position: new THREE.Vector3(10, 6, 0),
        color: 0x3b82f6,
        implemented: true,
        side: "right",
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

    // Création des liens horizontaux
    this.createHorizontalLinks();

    // Ajout des événements
    window.addEventListener("resize", this.onResize.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("click", this.onClick.bind(this));

    // Animation initiale pour attirer l'attention
    this.animatePhases();
  }

  createPhases() {
    // Forme plus petite pour toutes les phases
    const phaseGeometry = new THREE.CircleGeometry(0.8, 32); // Rayon réduit

    this.phases.forEach((phase, index) => {
      // Matériau simple avec couleur claire
      const phaseMaterial = new THREE.MeshBasicMaterial({
        color: phase.color,
        transparent: true,
        opacity: phase.implemented ? 0.9 : 0.6,
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
      const ringGeometry = new THREE.RingGeometry(0.85, 1.0, 32);
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
    canvas.width = 200; // Réduit
    canvas.height = 40; // Réduit

    // Fond de l'étiquette
    context.fillStyle = "rgba(15, 23, 42, 0.85)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Bordure avec couleur adaptée
    context.strokeStyle = phase.implemented
      ? `rgba(${(phase.color >> 16) & 255}, ${(phase.color >> 8) & 255}, ${
          phase.color & 255
        }, 0.8)`
      : "rgba(100, 116, 139, 0.5)";
    context.lineWidth = 2;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Texte plus petit
    context.font = "bold 16px Inter, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = phase.implemented ? "#ffffff" : "#94a3b8";
    context.fillText(phase.name, canvas.width / 2, canvas.height / 2);

    // Texture du sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Positionnement des étiquettes - plus proches des cercles
    let offsetY;

    // Positionnement en fonction du côté et de la position
    if (phase.side === "left") {
      if (phase.position.y > 0) {
        // Haut gauche - au-dessus
        offsetY = 1.5;
        sprite.position.set(
          phase.position.x - 1.5,
          phase.position.y + offsetY,
          phase.position.z
        );
      } else if (phase.position.y < -5) {
        // Bas gauche - en dessous
        offsetY = -1.5;
        sprite.position.set(
          phase.position.x - 1.5,
          phase.position.y + offsetY,
          phase.position.z
        );
      } else {
        // Milieu gauche - à gauche
        sprite.position.set(
          phase.position.x - 3,
          phase.position.y,
          phase.position.z
        );
      }
    } else {
      // Right side
      if (phase.position.y > 0) {
        // Haut droit - au-dessus
        offsetY = 1.5;
        sprite.position.set(
          phase.position.x + 1.5,
          phase.position.y + offsetY,
          phase.position.z
        );
      } else if (phase.position.y < -5) {
        // Bas droit - en dessous
        offsetY = -1.5;
        sprite.position.set(
          phase.position.x + 1.5,
          phase.position.y + offsetY,
          phase.position.z
        );
      } else {
        // Milieu droit - à droite
        sprite.position.set(
          phase.position.x + 3,
          phase.position.y,
          phase.position.z
        );
      }
    }

    // Échelle réduite pour le sprite
    sprite.scale.set(2.5, 0.6, 1);

    this.scene.add(sprite);
  }

  createVLines() {
    // Création d'un matériau pour les lignes du V
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      linewidth: 1.5,
    });

    // Lignes du côté gauche du V
    this.createLineSegment(
      [
        this.phases[0].position.clone(), // Spécification
        this.phases[1].position.clone(), // Conception générale
      ],
      lineMaterial
    );

    this.createLineSegment(
      [
        this.phases[1].position.clone(), // Conception générale
        this.phases[2].position.clone(), // Conception détaillée
      ],
      lineMaterial
    );

    this.createLineSegment(
      [
        this.phases[2].position.clone(), // Conception détaillée
        this.phases[3].position.clone(), // Implémentation
      ],
      lineMaterial
    );

    // Lignes du côté droit du V
    this.createLineSegment(
      [
        this.phases[3].position.clone(), // Implémentation
        this.phases[4].position.clone(), // Tests composants
      ],
      lineMaterial
    );

    this.createLineSegment(
      [
        this.phases[4].position.clone(), // Tests composants
        this.phases[5].position.clone(), // Tests intégration
      ],
      lineMaterial
    );

    this.createLineSegment(
      [
        this.phases[5].position.clone(), // Tests intégration
        this.phases[6].position.clone(), // Tests fonctionnels
      ],
      lineMaterial
    );

    this.createLineSegment(
      [
        this.phases[6].position.clone(), // Tests fonctionnels
        this.phases[7].position.clone(), // Tests performance
      ],
      lineMaterial
    );
  }

  createLineSegment(points, material) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
  }

  createHorizontalLinks() {
    // Création des flèches horizontales reliant les phases correspondantes
    const linkMaterial = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      opacity: 0.3, // Plus transparent pour moins encombrer visuellement
      transparent: true,
    });

    // Flèches entre les phases correspondantes
    for (let i = 0; i < 4; i++) {
      const leftPhase = this.phases[i];
      const rightPhase = this.phases[7 - i]; // Correspondance symétrique

      const points = [leftPhase.position.clone(), rightPhase.position.clone()];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, linkMaterial);
      this.scene.add(line);

      // Ajouter une flèche plus petite au milieu
      this.createArrowhead(
        leftPhase.position,
        rightPhase.position,
        linkMaterial.color
      );
    }
  }

  createArrowhead(start, end, color) {
    // Calculer la direction
    const direction = new THREE.Vector3().subVectors(end, start).normalize();

    // Créer un cône plus petit pour la flèche
    const arrowGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
    });

    // Flèche au milieu du chemin
    const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);

    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.copy(midPoint);

    // Orienter la flèche
    const axis = new THREE.Vector3(0, 1, 0);
    arrow.quaternion.setFromUnitVectors(axis, direction);
    arrow.rotateX(Math.PI / 2);

    this.scene.add(arrow);
  }

  // Animation des phases pour attirer l'attention - simplifiée
  animatePhases() {
    this.phaseObjects.forEach((obj, index) => {
      // Animation simple pour toutes les phases
      setTimeout(() => {
        const duration = 600; // Durée réduite
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Effet de scale léger
          let scale;
          if (progress < 0.5) {
            scale = 1 + progress * 0.1; // Scale max réduit
          } else {
            scale = 1.1 - (progress - 0.5) * 0.1;
          }

          obj.scale.set(scale, scale, scale);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            obj.scale.set(1, 1, 1);
          }
        };

        animate();
      }, index * 100); // Délai entre animations réduit
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
    this.phaseObjects.forEach((obj) => {
      obj.material.opacity = 0.9;
      obj.scale.set(1, 1, 1);
      this.canvas.style.cursor = "default";
    });

    // Si une intersection est trouvée
    if (intersects.length > 0) {
      const object = intersects[0].object;

      // Augmenter l'opacité et la taille
      object.material.opacity = 1;
      object.scale.set(1.2, 1.2, 1.2);
      this.canvas.style.cursor = "pointer";
      this.selectedPhase = object.userData;
    } else {
      this.selectedPhase = null;
    }
  }

  onClick() {
    // Navigation si une phase est sélectionnée
    if (this.selectedPhase && this.selectedPhase.phase.url) {
      window.location.href = this.selectedPhase.phase.url;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Animation très légère
    this.scene.rotation.y = Math.sin(Date.now() * 0.0001) * 0.02;

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
