/**
 * skills-visualization.js - Visualisation 3D des compétences
 */

class SkillsVisualization {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);

    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });

    // Skills data - skill name and proficiency (0-1)
    this.skills = [
      { name: "C", level: 0.7 },
      { name: "C++", level: 0.7 },
      { name: "Arduino", level: 0.75 },
      { name: "Filtrage", level: 0.85 },
      { name: "Électronique", level: 0.8 },
      { name: "PCB", level: 0.65 },
      { name: "ESP32", level: 0.65 },
      { name: "UML", level: 0.7 },
      { name: "Java", level: 0.7 },
    ];

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    // Configuration initiale
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setClearColor(0x0f172a, 1);

    this.camera.position.z = 20;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // Create skill visualization
    this.createSkillsVisualization();

    // Add event listeners
    window.addEventListener("resize", this.onResize.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));

    // Initial animation
    this.animate();
  }

  createSkillsVisualization() {
    // Create a group to hold all skill objects
    this.skillsGroup = new THREE.Group();
    this.scene.add(this.skillsGroup);

    // Materials
    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.2,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x60a5fa,
        emissiveIntensity: 0.2,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x2563eb,
        emissiveIntensity: 0.2,
      }),
    ];

    // Create skill objects
    this.skillObjects = [];

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const radius = 8;

    this.skills.forEach((skill, index) => {
      // Position on a circle
      const angle = (index / this.skills.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Create sphere
      const material = materials[index % materials.length];
      const sphere = new THREE.Mesh(sphereGeometry, material);

      // Scale based on skill level
      const scale = 0.5 + skill.level * 1.5;
      sphere.scale.set(scale, scale, scale);

      // Position
      sphere.position.set(x, y, 0);

      // Add to group
      this.skillsGroup.add(sphere);

      // Add to skill objects array
      this.skillObjects.push({
        mesh: sphere,
        skill: skill,
        initialPosition: new THREE.Vector3(x, y, 0),
        angle: angle,
      });

      // Create text label
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 256;
      canvas.height = 128;

      context.fillStyle = "#0f172a";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.font = "bold 36px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#ffffff";
      context.fillText(skill.name, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);

      // Position the sprite
      sprite.position.set(x * 1.3, y * 1.3, 0);
      sprite.scale.set(3, 1.5, 1);

      this.skillsGroup.add(sprite);
    });

    // Create connections between skills
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 0; i < this.skillObjects.length; i++) {
      const startObj = this.skillObjects[i];

      for (let j = i + 1; j < this.skillObjects.length; j++) {
        const endObj = this.skillObjects[j];

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          startObj.mesh.position,
          endObj.mesh.position,
        ]);

        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.skillsGroup.add(line);
      }
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    // Rotate the entire skills group
    this.skillsGroup.rotation.y = elapsedTime * 0.1;

    // Animate individual skill objects
    this.skillObjects.forEach((obj, index) => {
      const offset = Math.sin(elapsedTime * 0.5 + index) * 0.5;
      obj.mesh.position.z = offset;

      // Pulse effect
      const scalePulse = Math.sin(elapsedTime * 0.5 + index * 0.5) * 0.1 + 1;
      const baseScale = 0.5 + obj.skill.level * 1.5;
      obj.mesh.scale.set(
        baseScale * scalePulse,
        baseScale * scalePulse,
        baseScale * scalePulse
      );
    });

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.canvas.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.canvas.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(
      this.skillObjects.map((obj) => obj.mesh)
    );

    // Reset all objects
    this.skillObjects.forEach((obj) => {
      obj.mesh.material.emissiveIntensity = 0.2;
    });

    // Highlight intersected object
    if (intersects.length > 0) {
      const object = intersects[0].object;
      object.material.emissiveIntensity = 0.8;

      // Find the skill data for this object
      const skillObj = this.skillObjects.find((obj) => obj.mesh === object);

      if (skillObj) {
        // Show tooltip
        console.log(skillObj.skill.name, skillObj.skill.level);
      }
    }
  }

  onResize() {
    // Update sizes
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height);
  }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  const skillsCanvas = document.getElementById("skills-canvas");

  if (skillsCanvas) {
    const skillsViz = new SkillsVisualization("skills-canvas");

    // Delay initialization to ensure the canvas is properly sized
    setTimeout(() => {
      skillsViz.onResize();
    }, 100);
  }
});
