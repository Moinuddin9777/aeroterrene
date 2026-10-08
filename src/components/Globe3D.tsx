import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Trip } from '../types/trip';

interface Globe3DProps {
  trips: Trip[];
  selectedTripId: string | null;
  onSelectTrip: (id: string | null) => void;
  darkMode: boolean;
  autoRotate: boolean;
}

interface ProjectedCityLabel {
  key: string;
  code: string;
  city: string;
  country: string;
  x: number;
  y: number;
  visible: boolean;
  isSelectedEndpoint: boolean;
  hasFlight: boolean;
  visitCount: number;
  trips: Trip[];
}

const GLOBE_RADIUS = 100;

/**
 * Converts latitude and longitude (degrees) into a 3D Cartesian Vector3 on a sphere of given radius.
 */
function latLngToVector3(lat: number, lng: number, radius = GLOBE_RADIUS): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Simplified continental landmass polygons [lng, lat][] for crisp procedural 3D globe cartography
 * that loads instantaneously with zero CORS or external tile dependencies.
 */
const CONTINENT_POLYGONS: [number, number][][] = [
  // North America
  [
    [-168, 65], [-140, 70], [-125, 70], [-95, 72], [-75, 62], [-55, 50],
    [-66, 44], [-75, 35], [-81, 25], [-90, 21], [-83, 9], [-78, 8],
    [-85, 11], [-97, 16], [-105, 20], [-117, 32], [-124, 42], [-130, 54],
    [-150, 60], [-165, 55],
  ],
  // Greenland
  [
    [-55, 60], [-44, 60], [-20, 70], [-18, 81], [-52, 82], [-65, 76],
  ],
  // South America
  [
    [-78, 9], [-62, 10], [-50, 1], [-35, -6], [-38, -15], [-42, -23],
    [-53, -33], [-62, -40], [-68, -54], [-74, -50], [-72, -35], [-70, -18],
    [-81, -5], [-78, 2],
  ],
  // Europe
  [
    [-9, 37], [-9, 43], [-4, 48], [2, 51], [8, 54], [10, 58], [5, 62],
    [15, 69], [28, 71], [42, 67], [60, 68], [58, 52], [40, 46], [28, 41],
    [24, 37], [16, 38], [12, 44], [5, 43], [-2, 36],
  ],
  // United Kingdom & Ireland
  [
    [-6, 50], [-2, 51], [1, 53], [-3, 58], [-7, 57], [-10, 52],
  ],
  // Africa
  [
    [-17, 15], [-6, 35], [10, 37], [32, 31], [43, 12], [51, 12],
    [41, -2], [40, -15], [33, -26], [20, -35], [17, -28], [12, -16],
    [9, -2], [5, 5], [-8, 5], [-16, 12],
  ],
  // Madagascar
  [
    [44, -13], [50, -15], [47, -25], [43, -24],
  ],
  // Asia
  [
    [28, 41], [45, 42], [60, 68], [95, 74], [135, 71], [170, 66],
    [160, 54], [142, 50], [131, 42], [122, 39], [121, 30], [108, 21],
    [104, 1], [100, 13], [92, 22], [80, 14], [77, 8], [68, 23],
    [58, 25], [50, 29], [35, 32],
  ],
  // Arabian Peninsula
  [
    [35, 29], [48, 29], [59, 22], [44, 13], [38, 20],
  ],
  // Japan Archipelago
  [
    [130, 31], [136, 34], [141, 38], [145, 43], [140, 41], [134, 35],
  ],
  // Indonesia / Maritime SE Asia
  [
    [96, 5], [105, -6], [115, -8], [120, -4], [114, 4], [102, 2],
  ],
  // Australia
  [
    [114, -22], [122, -16], [136, -12], [142, -11], [153, -26],
    [149, -37], [138, -35], [128, -32], [115, -34],
  ],
  // New Zealand
  [
    [172, -35], [178, -38], [170, -46], [166, -45],
  ],
];

function createEarthCanvasTexture(darkMode: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Ocean Bathymetry Gradient (#2D3142 deep indigo in dark mode, #E5E7EB / #FAFAFA calm mist in light mode)
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (darkMode) {
      oceanGrad.addColorStop(0, '#141722');
      oceanGrad.addColorStop(0.5, '#1E2231');
      oceanGrad.addColorStop(1, '#141722');
    } else {
      oceanGrad.addColorStop(0, '#E2E5EC');
      oceanGrad.addColorStop(0.5, '#EDF0F5');
      oceanGrad.addColorStop(1, '#E2E5EC');
    }
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Subtle Latitude & Longitude Graticules
    ctx.strokeStyle = darkMode ? 'rgba(191, 192, 192, 0.08)' : 'rgba(79, 93, 117, 0.10)';
    ctx.lineWidth = 1;

    for (let lng = -180; lng <= 180; lng += 15) {
      const x = ((lng + 180) / 360) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let lat = -75; lat <= 75; lat += 15) {
      const y = ((90 - lat) / 180) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Equator highlight
    ctx.strokeStyle = darkMode ? 'rgba(56, 189, 248, 0.35)' : 'rgba(37, 99, 235, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // 3. Draw Continental Landmasses with subtle coastal rim
    ctx.fillStyle = darkMode ? '#22283A' : '#FAFAFA';
    ctx.strokeStyle = darkMode ? 'rgba(56, 189, 248, 0.42)' : 'rgba(79, 93, 117, 0.48)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    CONTINENT_POLYGONS.forEach((poly) => {
      if (poly.length === 0) return;
      ctx.beginPath();
      poly.forEach(([lng, lat], idx) => {
        const x = ((lng + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  trips,
  selectedTripId,
  onSelectTrip,
  darkMode,
  autoRotate,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglLost, setWebglLost] = useState(false);
  const [hoveredCityKey, setHoveredCityKey] = useState<string | null>(null);
  const [projectedCities, setProjectedCities] = useState<ProjectedCityLabel[]>([]);

  // Store Three.js references for reactive updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const routesGroupRef = useRef<THREE.Group | null>(null);
  const pulsesRef = useRef<{ mesh: THREE.Mesh; curve: THREE.Curve<THREE.Vector3>; speed: number; offset: number }[]>([]);

  // Spherical rotation & zoom state
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.35, y: -1.6 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.35, y: -1.6 });
  const targetDistanceRef = useRef<number>(255);
  const currentDistanceRef = useRef<number>(255);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoRotateRef = useRef<boolean>(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  // Aggregate unique visited cities
  const cityNodes = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        code: string;
        city: string;
        country: string;
        lat: number;
        lng: number;
        visitCount: number;
        trips: Trip[];
      }
    >();

    const addPlace = (
      code: string,
      city: string,
      country: string,
      lat: number,
      lng: number,
      trip: Trip
    ) => {
      const key = `${code.toUpperCase()}_${city.toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.visitCount += 1;
        if (!existing.trips.some((t) => t.id === trip.id)) {
          existing.trips.push(trip);
        }
      } else {
        map.set(key, { key, code, city, country, lat, lng, visitCount: 1, trips: [trip] });
      }
    };

    trips.forEach((trip) => {
      addPlace(trip.originCode, trip.originCity, trip.originCountry, trip.originLat, trip.originLng, trip);
      addPlace(trip.destCode, trip.destCity, trip.destCountry, trip.destLat, trip.destLng, trip);
    });

    return Array.from(map.values());
  }, [trips]);

  // Smoothly orient globe rotation toward a lat/lng coordinate
  const focusLatLng = useCallback((lat: number, lng: number, zoomDist = 215) => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    targetRotationRef.current = {
      x: Math.max(-1.1, Math.min(1.1, latRad * 0.85)),
      y: -lngRad - Math.PI / 2,
    };
    targetDistanceRef.current = zoomDist;
  }, []);

  // When selectedTrip changes, smoothly slerp globe toward the midpoint of the route
  useEffect(() => {
    if (!selectedTrip) {
      targetDistanceRef.current = 255;
      return;
    }
    const midLat = (selectedTrip.originLat + selectedTrip.destLat) / 2;
    let dLng = selectedTrip.destLng - selectedTrip.originLng;
    let midLng = (selectedTrip.originLng + selectedTrip.destLng) / 2;
    if (Math.abs(dLng) > 180) {
      midLng += 180;
    }
    focusLatLng(midLat, midLng, 215);
  }, [selectedTrip, focusLatLng]);

  // Initialize Three.js WebGL scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 650;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 1500);
    camera.position.set(0, 0, currentDistanceRef.current);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setWebglLost(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglLost(true);
    };
    const handleContextRestored = () => {
      setWebglLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // Three-Point Studio Lighting per 5_threejs_3d_spatial.md
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.9);
    keyLight.position.set(220, 180, 200);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    fillLight.position.set(-220, -100, 140);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.75);
    rimLight.position.set(0, 200, -240);
    scene.add(rimLight);

    // Master rotatable globe group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 1. Earth Sphere with Physically-Based Standard Material
    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthCanvasTexture(darkMode),
      roughness: 0.65,
      metalness: 0.12,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 2. Subtle Elevated Geodesic Wireframe Shell
    const wireGeo = new THREE.SphereGeometry(GLOBE_RADIUS + 0.35, 36, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: darkMode ? 0x38bdf8 : 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: darkMode ? 0.045 : 0.035,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 3. Atmospheric Outer Rim Halo Sphere
    const haloGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 48, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: darkMode ? 0x0ea5e9 : 0x38bdf8,
      transparent: true,
      opacity: darkMode ? 0.09 : 0.06,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // 4. Orbital Equatorial Compass Ring
    const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.16, GLOBE_RADIUS * 1.168, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: darkMode ? 0x38bdf8 : 0x94a3b8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    globeGroup.add(ringMesh);

    // 5. Routes & City Beacons Group
    const routesGroup = new THREE.Group();
    globeGroup.add(routesGroup);
    routesGroupRef.current = routesGroup;

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 650;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation loop
    let animFrameId: number;
    let frameCount = 0;

    const renderLoop = () => {
      animFrameId = requestAnimationFrame(renderLoop);

      // Auto-rotate gently when not dragging and no trip is locked
      if (!isDraggingRef.current && autoRotateRef.current) {
        targetRotationRef.current.y += 0.0018;
      }

      // Smooth damping / interpolation per 5_threejs_3d_spatial.md
      currentRotationRef.current.x +=
        (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y +=
        (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;
      currentDistanceRef.current +=
        (targetDistanceRef.current - currentDistanceRef.current) * 0.08;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotationRef.current.x;
        globeGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      camera.position.z = currentDistanceRef.current;

      // Animate travelling flight/road pulse spheres along 3D curves
      const now = performance.now() * 0.001;
      pulsesRef.current.forEach((p) => {
        const t = (now * p.speed + p.offset) % 1;
        const pos = p.curve.getPointAt(t);
        p.mesh.position.copy(pos);
      });

      renderer.render(scene, camera);

      // Update projected 2D DOM labels every 3 frames for smooth 60fps performance
      frameCount = (frameCount + 1) % 3;
      if (frameCount === 0 && globeGroupRef.current && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        globeGroupRef.current.updateMatrixWorld();

        const updatedProjections: ProjectedCityLabel[] = cityNodesRef.current.map((node) => {
          const localVec = latLngToVector3(node.lat, node.lng, GLOBE_RADIUS + 2.2);
          const worldVec = localVec.clone().applyMatrix4(globeGroupRef.current!.matrixWorld);

          // Check if city is on the front hemisphere facing the camera
          const camDir = camera.position.clone().normalize();
          const pointNormal = worldVec.clone().normalize();
          const dot = pointNormal.dot(camDir);
          const visible = dot > 0.18;

          const projected = worldVec.clone().project(camera);
          const x = (projected.x * 0.5 + 0.5) * w;
          const y = (-(projected.y * 0.5) + 0.5) * h;

          const sel = selectedTripRef.current;
          const isSelectedEndpoint = Boolean(
            sel &&
              ((sel.originCode === node.code && sel.originCity === node.city) ||
                (sel.destCode === node.code && sel.destCity === node.city))
          );

          return {
            key: node.key,
            code: node.code,
            city: node.city,
            country: node.country,
            x,
            y,
            visible,
            isSelectedEndpoint,
            hasFlight: node.trips.some((t) => t.tripType === 'flight'),
            visitCount: node.visitCount,
            trips: node.trips,
          };
        });

        setProjectedCities(updatedProjections);
      }
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      renderer.dispose();
    };
  }, []);

  // Keep refs synced for projection inside animation loop
  const cityNodesRef = useRef(cityNodes);
  useEffect(() => {
    cityNodesRef.current = cityNodes;
  }, [cityNodes]);

  const selectedTripRef = useRef(selectedTrip);
  useEffect(() => {
    selectedTripRef.current = selectedTrip;
  }, [selectedTrip]);

  // Update Earth texture when dark/light mode changes
  useEffect(() => {
    if (!earthMeshRef.current) return;
    const mat = earthMeshRef.current.material as THREE.MeshStandardMaterial;
    const newTex = createEarthCanvasTexture(darkMode);
    if (mat.map) mat.map.dispose();
    mat.map = newTex;
    mat.needsUpdate = true;
  }, [darkMode]);

  // Rebuild 3D geodesic flight tubes, animated pulses, and city beacon pillars when trips or selection change
  useEffect(() => {
    const routesGroup = routesGroupRef.current;
    if (!routesGroup) return;

    // Clear existing route meshes
    while (routesGroup.children.length > 0) {
      const child = routesGroup.children[0];
      routesGroup.remove(child);
    }
    pulsesRef.current = [];

    // 1. Build 3D Geodesic Cubic Bezier Arcs for each trip
    trips.forEach((trip, idx) => {
      const isSelected = trip.id === selectedTripId;
      const isFlight = trip.tripType === 'flight';

      const startVec = latLngToVector3(trip.originLat, trip.originLng, GLOBE_RADIUS);
      const endVec = latLngToVector3(trip.destLat, trip.destLng, GLOBE_RADIUS);

      const chordDist = startVec.distanceTo(endVec);
      const altitudeBoost = isFlight
        ? Math.min(48, Math.max(8, chordDist * 0.34))
        : Math.min(10, Math.max(2.5, chordDist * 0.1));

      // Control points elevated radially above the sphere
      const ctrl1 = startVec
        .clone()
        .lerp(endVec, 0.33)
        .normalize()
        .multiplyScalar(GLOBE_RADIUS + altitudeBoost);
      const ctrl2 = startVec
        .clone()
        .lerp(endVec, 0.67)
        .normalize()
        .multiplyScalar(GLOBE_RADIUS + altitudeBoost);

      const curve = new THREE.CubicBezierCurve3(startVec, ctrl1, ctrl2, endVec);

      const arcColor = isFlight
        ? isSelected
          ? 0x38bdf8
          : 0x2563eb
        : isSelected
        ? 0x38bdf8
        : 0x0ea5e9;

      const tubeRadius = isSelected ? 0.72 : 0.38;
      const tubeGeo = new THREE.TubeGeometry(curve, 64, tubeRadius, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: isSelected ? 0.98 : 0.68,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      routesGroup.add(tubeMesh);

      // Add glowing outer halo tube when selected
      if (isSelected) {
        const glowGeo = new THREE.TubeGeometry(curve, 64, 1.65, 8, false);
        const glowMat = new THREE.MeshBasicMaterial({
          color: arcColor,
          transparent: true,
          opacity: 0.24,
        });
        routesGroup.add(new THREE.Mesh(glowGeo, glowMat));
      }

      // Add animated travelling light pulse sphere along the 3D arc
      const pulseGeo = new THREE.SphereGeometry(isSelected ? 1.55 : 1.05, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : arcColor,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      routesGroup.add(pulseMesh);

      pulsesRef.current.push({
        mesh: pulseMesh,
        curve,
        speed: isFlight ? 0.26 : 0.16,
        offset: (idx * 0.23) % 1,
      });
    });

    // 2. Build 3D City Beacon Pedestals on the globe surface
    cityNodes.forEach((city) => {
      const surfacePos = latLngToVector3(city.lat, city.lng, GLOBE_RADIUS);
      const normal = surfacePos.clone().normalize();
      const hasFlight = city.trips.some((t) => t.tripType === 'flight');

      const beaconColor = hasFlight ? 0x38bdf8 : 0x60a5fa;

      // Glowing base ring on surface
      const ringGeo = new THREE.RingGeometry(0.9, 1.85, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: beaconColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(surfacePos.clone().add(normal.clone().multiplyScalar(0.3)));
      ringMesh.lookAt(surfacePos.clone().add(normal.clone().multiplyScalar(10)));
      routesGroup.add(ringMesh);

      // Elevated beacon sphere
      const pinGeo = new THREE.SphereGeometry(1.1, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(surfacePos.clone().add(normal.clone().multiplyScalar(1.2)));
      routesGroup.add(pinMesh);
    });
  }, [trips, cityNodes, selectedTripId]);

  // Pointer drag and wheel zoom handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    targetRotationRef.current.y += dx * 0.0055;
    targetRotationRef.current.x = Math.max(
      -1.2,
      Math.min(1.2, targetRotationRef.current.x + dy * 0.0055)
    );
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    targetDistanceRef.current = Math.max(
      155,
      Math.min(360, targetDistanceRef.current + e.deltaY * 0.14)
    );
  };

  if (webglLost) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-300 p-8 text-center">
        <div>
          <p className="text-sm font-medium mb-1">3D WebGL Viewport Paused</p>
          <p className="text-xs text-slate-400">
            Switch to the 2D Atlas view in the top-right controls to inspect routes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${
        darkMode
          ? 'bg-[radial-gradient(ellipse_at_center,_#0f1e36_0%,_#060b16_60%,_#020409_100%)]'
          : 'bg-[radial-gradient(ellipse_at_center,_#f8fafc_0%,_#e2e8f0_65%,_#cbd5e1_100%)]'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Ambient 3D Atmospheric Ring Glow Backdrop */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={`w-[540px] h-[540px] rounded-full blur-3xl opacity-30 ${
            darkMode ? 'bg-sky-500/25' : 'bg-sky-400/25'
          }`}
        />
      </div>

      {/* Three.js WebGL Mount Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Semantic Projected 2D DOM City Callout Labels over 3D Globe */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {projectedCities.map((node) => {
          if (!node.visible) return null;
          const isHovered = hoveredCityKey === node.key;

          return (
            <div
              key={node.key}
              style={{
                transform: `translate3d(${Math.round(node.x)}px, ${Math.round(node.y)}px, 0)`,
              }}
              className="pointer-events-auto absolute top-0 left-0 -translate-x-1/2 -translate-y-full pb-2"
            >
              <button
                type="button"
                onMouseEnter={() => setHoveredCityKey(node.key)}
                onMouseLeave={() => setHoveredCityKey(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.trips.length > 0) {
                    onSelectTrip(node.trips[0].id);
                  }
                }}
                className={`group flex items-center gap-1.5 px-2 py-0.5 rounded-md border backdrop-blur-md transition-transform duration-150 hover:scale-105 ${
                  node.isSelectedEndpoint
                    ? 'bg-[#2563EB] text-white border-[#38BDF8] shadow-lg shadow-blue-500/35 font-semibold'
                    : darkMode
                    ? 'bg-[#181D2C]/85 text-[#FAFAFA] border-white/15 hover:border-[#38BDF8]/70'
                    : 'bg-white/95 text-[#2D3142] border-[#BFC0C0] hover:border-[#2563EB] shadow-sm'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    node.isSelectedEndpoint
                      ? 'bg-white'
                      : node.hasFlight
                      ? 'bg-[#38BDF8]'
                      : 'bg-[#60A5FA]'
                  }`}
                />
                <span className="font-mono text-[10px] tracking-tight">{node.code}</span>
                <span className="text-[10px] hidden sm:inline opacity-85">{node.city}</span>
              </button>

              {/* Hover Quick Tooltip for 3D City Beacon */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 p-2.5 rounded-lg bg-slate-950/95 text-slate-100 border border-white/15 shadow-xl text-left z-30 pointer-events-none">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>
                      {node.city}, {node.country}
                    </span>
                    <span className="font-mono text-sky-400">{node.code}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {node.visitCount} logged {node.visitCount === 1 ? 'journey' : 'journeys'}
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-0.5">
                    {node.trips.slice(0, 2).map((t) => (
                      <div key={t.id} className="text-[10px] text-slate-300 truncate">
                        • {t.originCode} → {t.destCode} · {t.carrierName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
