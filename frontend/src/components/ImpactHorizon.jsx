import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Lensflare, LensflareElement } from "three/addons/objects/Lensflare.js";

// Use forwardRef to allow parent components to access functions via a ref
const ImpactHorizon = forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const animations = useRef([]);
  const shootingStars = useRef([]);
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const earthRef = useRef();
  const controlsRef = useRef(); // New ref for controls
  const textureLoader = new THREE.TextureLoader();

  const impacts = [
    { year: 1799, lat: 48.2, lon: 0.1, size: "small" },
    { year: 1803, lat: 48.7, lon: 0.6, size: "shower" },
    { year: 1807, lat: 41.2, lon: -73.3, size: "medium" },
    { year: 1825, lat: 13.7, lon: 77.5, size: "small" },
    { year: 1827, lat: 26.3, lon: 75.8, size: "small" },
    { year: 1836, lat: -5.1, lon: -36.6, size: "medium" },
    { year: 1847, lat: 50.4, lon: 13.0, size: "medium" },
    { year: 1860, lat: 39.9, lon: -81.7, size: "small" },
    { year: 1863, lat: 58.5, lon: 25.8, size: "small" },
    { year: 1866, lat: 48.9, lon: 22.5, size: "large" },
    { year: 1868, lat: 52.7, lon: 21.0, size: "shower" },
    { year: 1879, lat: 46.8, lon: 1.1, size: "small" },
    { year: 1882, lat: 46.8, lon: 23.9, size: "shower" },
    { year: 1888, lat: 35.5, lon: 45.4, size: "medium" },
    { year: 1890, lat: 43.1, lon: -94.2, size: "shower" },
    { year: 1908, lat: 60.9, lon: 101.9, size: "massive" },
    { year: 1911, lat: 31.3, lon: 30.3, size: "small" },
    { year: 1912, lat: 34.9, lon: -110.0, size: "shower" },
    { year: 1924, lat: 40.4, lon: -104.7, size: "medium" },
    { year: 1927, lat: 36.3, lon: 140.2, size: "small" },
    { year: 1929, lat: 42.6, lon: 21.1, size: "medium" },
    { year: 1938, lat: 14.1, lon: 120.9, size: "shower" },
    { year: 1938, lat: 39.1, lon: -89.6, size: "small" },
    { year: 1947, lat: 46.1, lon: 134.6, size: "massive" },
    { year: 1949, lat: 53.0, lon: -4.0, size: "small" },
    { year: 1952, lat: 54.0, lon: -112.8, size: "medium" },
    { year: 1954, lat: 33.1, lon: -86.3, size: "small" },
    { year: 1965, lat: 52.5, lon: -1.3, size: "medium" },
    { year: 1969, lat: 26.9, lon: -105.3, size: "massive" },
    { year: 1969, lat: -36.6, lon: 145.1, size: "large" },
    { year: 1971, lat: 41.7, lon: -72.6, size: "small" },
    { year: 1976, lat: 44.0, lon: 126.5, size: "massive" },
    { year: 1977, lat: 38.2, lon: -85.7, size: "medium" },
    { year: 1982, lat: 41.7, lon: -72.6, size: "small" },
    { year: 1992, lat: 1.3, lon: 33.8, size: "small" },
    { year: 1992, lat: 41.2, lon: -73.9, size: "small" },
    { year: 1994, lat: 45.9, lon: -73.0, size: "shower" },
    { year: 1998, lat: 34.0, lon: -103.5, size: "large" },
    { year: 2003, lat: 41.5, lon: -87.6, size: "shower" },
    { year: 2003, lat: 21.8, lon: 86.7, size: "shower" },
    { year: 2007, lat: -16.6, lon: -69.1, size: "large" },
    { year: 2008, lat: 21.0, lon: 31.0, size: "shower" },
    { year: 2009, lat: 43.6, lon: -79.8, size: "small" },
    { year: 2011, lat: 48.6, lon: 2.4, size: "medium" },
    { year: 2013, lat: 54.9, lon: 61.3, size: "massive" },
    { year: 2015, lat: 35.2, lon: 47.7, size: "shower" },
    { year: 2018, lat: -22.4, lon: 22.4, size: "medium" },
    { year: 2019, lat: 10.4, lon: -84.4, size: "large" },
    { year: 2020, lat: 1.7, lon: 98.6, size: "medium" },
    { year: 2021, lat: 51.1, lon: -116.9, size: "medium" },
    { year: 2023, lat: 49.8, lon: 0.7, size: "shower" },
    { year: 2023, lat: 40.6, lon: 16.6, size: "small" },
    { year: 2024, lat: 52.6, lon: 12.8, size: "shower" },
  ];

  // Utility to convert lat/lon to 3D coordinates on a sphere
  const latLonToCartesian = (lat, lon, radius) => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lon + 180) * Math.PI) / 180;
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  };

  // === Setup Scene ===
  const initScene = () => {
    const container = containerRef.current;
    if (!container) return; // Important for cleanup

    // Clear previous scene if re-initializing
    if (sceneRef.current) {
      sceneRef.current.clear(); // Clear all objects from the previous scene
      rendererRef.current.dispose(); // Dispose of previous renderer resources
      container.innerHTML = ""; // Clear existing canvas
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 15, 40); // Initial camera position for animation
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 50;
    controls.enabled = false; // Disable controls during animation
    controlsRef.current = controls; // Store controls in ref

    // Create Scene Components
    createStarfield(scene);
    createShootingStars(scene);
    createCelestials(scene);
    createEarth(scene);

    startIntroAnimation(camera, controls);

    // Resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && containerRef.current) {
        cameraRef.current.aspect =
          containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };
    window.addEventListener("resize", handleResize);

    // Only start animate loop once
    if (!rendererRef.current.hasAnimationFrame) {
      // Prevent multiple animation loops
      animate();
      rendererRef.current.hasAnimationFrame = true;
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.hasAnimationFrame = false;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  };

  useEffect(() => {
    const cleanup = initScene(); // Call initScene on mount
    return cleanup;
  }, []);

  // Expose a method to restart the animation to the parent component
  useImperativeHandle(ref, () => ({
    restartAnimation: () => {
      // Clear existing animations
      animations.current = [];
      // Reset camera to initial position
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 15, 40);
        cameraRef.current.lookAt(0, 0, 0);
        controlsRef.current.enabled = false; // Disable controls during animation
        controlsRef.current.update(); // Update controls after camera reset
      }
      // Start the animation again
      startIntroAnimation(cameraRef.current, controlsRef.current);
    },
  }));

  // === 3D OBJECT FUNCTIONS ===
  const createEarth = (scene) => {
    const geo = new THREE.SphereGeometry(1.5, 64, 64);
    const tex = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/land_ocean_ice_cloud_2048.jpg"
    );
    const mat = new THREE.MeshStandardMaterial({ map: tex });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    earthRef.current = mesh;
  };

  const createStarfield = (scene) => {
    const starVertices = [];
    for (let i = 0; i < 15000; i++) {
      starVertices.push(
        THREE.MathUtils.randFloatSpread(2000),
        THREE.MathUtils.randFloatSpread(2000),
        THREE.MathUtils.randFloatSpread(2000)
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8,
    });
    scene.add(new THREE.Points(geo, mat));
  };

  const createShootingStars = (scene) => {
    const geom = new THREE.SphereGeometry(0.05, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
    });
    for (let i = 0; i < 5; i++) {
      const star = new THREE.Mesh(geom, mat);
      resetShootingStar(star);
      scene.add(star);
      shootingStars.current.push(star);
    }
  };

  const resetShootingStar = (star) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 50 + 80;
    star.position.set(
      Math.cos(angle) * radius,
      THREE.MathUtils.randFloatSpread(50),
      Math.sin(angle) * radius
    );
    const target = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(20),
      THREE.MathUtils.randFloatSpread(20),
      0
    );
    star.userData.velocity = target
      .sub(star.position)
      .normalize()
      .multiplyScalar(THREE.MathUtils.randFloat(0.5, 1.0));
    star.userData.lifetime = THREE.MathUtils.randFloat(200, 400);
  };

  const createCelestials = (scene) => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(20, 5, 5);
    scene.add(directionalLight);

    const textureFlare0 = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lensflare/lensflare0.png"
    );
    const textureFlare3 = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lensflare/lensflare3.png"
    );

    const lensflare = new Lensflare();
    lensflare.addElement(
      new LensflareElement(textureFlare0, 700, 0, directionalLight.color)
    );
    lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
    lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
    lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
    lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
    directionalLight.add(lensflare);
  };

  // === INTRO ANIMATION ===
  const startIntroAnimation = (camera, controls) => {
    const start = camera.position.clone(); // Use current camera position as start
    const end = new THREE.Vector3(0, 0, 5);
    const duration = 4000;

    const anim = {
      startTime: Date.now(),
      update: () => {
        const elapsed = Date.now() - anim.startTime;
        let t = Math.min(elapsed / duration, 1);
        t = t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;

        camera.position.lerpVectors(start, end, t);
        camera.lookAt(0, 0, 0);
        if (t >= 1) {
          anim.isFinished = true;
          controls.enabled = true;
        }
      },
    };
    animations.current.push(anim);
  };

  // === ANIMATE LOOP ===
  const animate = () => {
    requestAnimationFrame(animate);
    const earth = earthRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current; // Get controls from ref

    if (!renderer || !scene || !camera) return; // Prevent errors if not initialized

    // Update animations
    for (let i = animations.current.length - 1; i >= 0; i--) {
      const anim = animations.current[i];
      if (anim) {
        anim.update();
        if (anim.isFinished) animations.current.splice(i, 1);
      }
    }

    shootingStars.current.forEach((star) => {
      star.position.add(star.userData.velocity);
      star.userData.lifetime -= 1;
      if (star.userData.lifetime <= 0) resetShootingStar(star);
    });

    if (earth) earth.rotation.y += 0.0002;
    if (controls) controls.update(); // Update controls

    renderer.render(scene, camera);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    />
  );
});

export default ImpactHorizon;
