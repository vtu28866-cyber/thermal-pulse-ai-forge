import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Eye, 
  RotateCcw, 
  Layers, 
  Radio, 
  Crosshair, 
  Maximize2, 
  Info, 
  Camera as CameraIcon, 
  Zap, 
  Wrench,
  CheckCircle2,
  Compass,
  Play,
  Pause
} from 'lucide-react';
import { VehicleState, RoverComponentId, RoverComponentInfo } from '../../types';

interface Rover3DCanvasProps {
  currentState: VehicleState;
  speedKmh?: number;
  taskProgressPct?: number;
  batteryPct?: number;
  interactive?: boolean;
  onSelectComponent?: (comp: RoverComponentInfo) => void;
  className?: string;
  showToolbar?: boolean;
}

export const ROVER_COMPONENTS: Record<RoverComponentId, RoverComponentInfo> = {
  chassis: {
    id: 'chassis',
    name: 'Reinforced Titanium-Graphite Monocoque Chassis',
    category: 'Structural',
    status: 'Nominal',
    description: 'Armored IP68 waterproof enclosure with structural roll cage, reinforced Kevlar bottom skid plates for jagged deck debris, and dual modular equipment bays.',
    specs: 'Material: Grade 5 Ti-6Al-4V + Carbon Monocoque | Curb Weight: 142 kg | Payload Cap: 85 kg'
  },
  wheels: {
    id: 'wheels',
    name: '6-Wheel Independent In-Hub Electric Drive',
    category: 'Locomotion',
    status: 'Nominal',
    description: 'High-traction polyurethane-studded rubber tires with sealed planetary reduction hubs, differential skid-steering, and zero-turn turning radius on 15° bridge gradients.',
    specs: 'Motors: 6x 1.2kW Brushless Hub Drives | Max Gradient: 25% | Tire Diameter: 320mm'
  },
  suspension: {
    id: 'suspension',
    name: 'Active Rocker-Bogie Articulated Suspension',
    category: 'Locomotion',
    status: 'Nominal',
    description: 'Mechanical rocker-bogie differential link maintaining all six wheels in uniform surface contact over expansion joints, spalls, and curbs up to 180mm.',
    specs: 'Max Obstacle Clearance: 180mm | Articulation: ±35° | Dual Gas Struts'
  },
  arm_base: {
    id: 'arm_base',
    name: 'Robotic Turret Azimuth Slewing Base',
    category: 'Robotic Arm',
    status: 'Standby',
    description: 'High-precision 360° harmonic drive rotary base with integrated slip ring for continuous rotation without umbilical cable twist.',
    specs: 'Range: 360° Continuous | Backlash: <1.2 arcmin | Torque: 120 Nm'
  },
  arm_upper: {
    id: 'arm_upper',
    name: 'Carbon-Fiber Shoulder & Upper Boom',
    category: 'Robotic Arm',
    status: 'Standby',
    description: 'Ultra-rigid hollow carbon-fiber boom housing internal electrical and polymer feed lines, driven by high-torque brushless actuator with failsafe holding brake.',
    specs: 'Reach: 950mm | Actuator: Cycloidal Reducer | Max Payload: 18 kg'
  },
  arm_forearm: {
    id: 'arm_forearm',
    name: 'Articulated Elbow & Forearm Extension',
    category: 'Robotic Arm',
    status: 'Standby',
    description: 'Secondary articulation link equipped with multi-axis strain gauges for real-time contact force feedback during crack sealant troweling.',
    specs: 'Elbow Range: -135° to +135° | Force Feedback: 6-Axis F/T Sensor'
  },
  arm_effector: {
    id: 'arm_effector',
    name: 'Dual-Tool Maintenance & NDT End Effector',
    category: 'Robotic Arm',
    status: 'Engaged',
    description: 'Swappable dual-mode tool head combining an electrically heated polymer elastomeric sealant extrusion nozzle (165°C cure head) and a 5MHz acoustic ultrasound crack verification transducer.',
    specs: 'Nozzle Temp: Up to 210°C | Ultrasonic Frequency: 5 MHz | Sealant: ASTM D6690 Type IV'
  },
  sensor_mast: {
    id: 'sensor_mast',
    name: 'Telescopic Sensor & Communications Mast',
    category: 'Sensors & Optics',
    status: 'Nominal',
    description: 'Elevated pneumatic carbon mast elevating the primary stereo cameras and dual 5G MIMO/Iridium satellite antennas 650mm above bridge deck level.',
    specs: 'Mast Height: 650mm (Extended) | Antennas: Dual 5G Sub-6 + GNSS RTK Dual-Band'
  },
  camera_gimbal: {
    id: 'camera_gimbal',
    name: '2-Axis Micro-Stabilized Optical Gimbal',
    category: 'Sensors & Optics',
    status: 'Active Scanning',
    description: 'Pan-tilt optical pod housing dual 48MP macro-focus inspection cameras and a radiometric long-wave infrared (LWIR) micro-bolometer for subsurface thermal inspection.',
    specs: 'Sensors: 48MP Sony IMX + FLIR LWIR 640x512 | Pan: ±170° | Tilt: -90° to +45°'
  },
  lidar: {
    id: 'lidar',
    name: '32-Channel 3D Solid-State LiDAR Scanner',
    category: 'Sensors & Optics',
    status: 'Active Scanning',
    description: 'Continuous 360° laser rangefinder generating 600,000 points/second for real-time bridge deck surface profile reconstruction, curb detection, and obstacle avoidance.',
    specs: 'Channels: 32 Beam | Range: 120m | Accuracy: ±15mm | Rate: 20 Hz'
  },
  battery_pack: {
    id: 'battery_pack',
    name: '48V 1.8kWh Solid-State LiFePO4 Energy Core',
    category: 'Power System',
    status: 'Nominal',
    description: 'Ruggedized quick-swap modular power bay with integrated thermal management, automotive battery management system (BMS), and regenerative braking.',
    specs: 'Capacity: 1850 Wh | Nominal Voltage: 48.0 V | Continuous Runtime: 6.5 Hours'
  },
  led_headlights: {
    id: 'led_headlights',
    name: 'High-CRI Matrix Floodlights & Safety Beacons',
    category: 'Structural',
    status: 'Nominal',
    description: 'Forward 4,500 lumen 5000K illumination array for high-contrast shadow-free crack photography, accompanied by 360° perimeter cyan and amber status rings.',
    specs: 'Luminous Flux: 4,500 lm | CRI: 94 | Strobe Rate: Configurable 1-10 Hz'
  }
};

export const Rover3DCanvas: React.FC<Rover3DCanvasProps> = ({
  currentState,
  speedKmh = 0,
  taskProgressPct = 0,
  batteryPct = 85,
  interactive = true,
  onSelectComponent,
  className = 'w-full h-full min-h-[420px]',
  showToolbar = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Interaction & Display States
  const [cameraView, setCameraView] = useState<'perspective' | 'front' | 'rear' | 'left' | 'right' | 'top'>('perspective');
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [showLidarBeams, setShowLidarBeams] = useState<boolean>(true);
  const [showSensorFov, setShowSensorFov] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [activeComponent, setActiveComponent] = useState<RoverComponentInfo>(ROVER_COMPONENTS.chassis);
  const [showComponentDetail, setShowComponentDetail] = useState<boolean>(false);

  // References to animated 3D parts
  const wheelsRef = useRef<THREE.Group[]>([]);
  const mastRef = useRef<THREE.Group | null>(null);
  const gimbalRef = useRef<THREE.Group | null>(null);
  const lidarRef = useRef<THREE.Mesh | null>(null);
  const lidarLaserGroupRef = useRef<THREE.Group | null>(null);
  const armBaseRef = useRef<THREE.Group | null>(null);
  const armShoulderRef = useRef<THREE.Group | null>(null);
  const armElbowRef = useRef<THREE.Group | null>(null);
  const armEffectorRef = useRef<THREE.Group | null>(null);
  const fovConeRef = useRef<THREE.Mesh | null>(null);
  const statusLightRef = useRef<THREE.PointLight | null>(null);
  const headlightBeamRef = useRef<THREE.SpotLight | null>(null);
  const chassisMeshRef = useRef<THREE.Mesh | null>(null);
  const allMaterialsRef = useRef<THREE.Material[]>([]);
  const clickableObjectsRef = useRef<{ mesh: THREE.Object3D; compId: RoverComponentId }[]>([]);

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Generate readable THERMALPULSE procedural texture for side armor
  const createBrandedArmorTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark graphite metallic base
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle carbon hex weave pattern
    ctx.fillStyle = '#1e293b';
    for (let x = 0; x < 1024; x += 16) {
      for (let y = 0; y < 512; y += 16) {
        if ((x + y) % 32 === 0) {
          ctx.fillRect(x, y, 8, 8);
        }
      }
    }

    // Cyan racing & telemetry line
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(40, 240, 944, 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(40, 256, 400, 4);

    // Hazard warning diagonal stripes on rear sector
    ctx.fillStyle = '#eab308';
    for (let i = 820; i < 980; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 40);
      ctx.lineTo(i + 12, 40);
      ctx.lineTo(i - 12, 100);
      ctx.lineTo(i - 24, 100);
      ctx.fill();
    }

    // Bold Brand Logo
    ctx.font = 'bold 76px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('THERMALPULSE', 60, 160);

    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('TX-4 AUTONOMOUS BRIDGE NDT ROVER', 65, 210);

    ctx.font = '18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CIVIL INFRASTRUCTURE & REPAIR DIVISION • DOT-CERTIFIED', 65, 320);
    ctx.fillText('SERIAL: TP-2026-CA-0881 • HIGH-VOLTAGE HYBRID CORE', 65, 350);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060b14);
    scene.fog = new THREE.FogExp2(0x060b14, 0.04);

    // 2. CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.4, 2.3, 3.8);
    cameraRef.current = camera;

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 9;
    controls.minDistance = 1.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't clip below ground
    controlsRef.current = controls;

    // 5. LIGHTING (Aerospace / Laboratory Rig)
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xe0f2fe, 2.2);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x0284c7, 1.2);
    fillLight.position.set(-5, 3, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(0, 4, -6);
    scene.add(rimLight);

    // Under-chassis cyan neon glow
    const underGlow = new THREE.PointLight(0x06b6d4, 2.5, 3.5);
    underGlow.position.set(0, 0.2, 0);
    scene.add(underGlow);

    // Vehicle rear status beacon
    const statusLight = new THREE.PointLight(0x06b6d4, 3.0, 4.0);
    statusLight.position.set(0, 0.9, -1.2);
    scene.add(statusLight);
    statusLightRef.current = statusLight;

    // Headlight projector
    const headlightBeam = new THREE.SpotLight(0xf8fafc, 4.0, 12, Math.PI / 6, 0.35, 1);
    headlightBeam.position.set(0, 0.5, 1.2);
    headlightBeam.target.position.set(0, 0, 6);
    scene.add(headlightBeam);
    scene.add(headlightBeam.target);
    headlightBeamRef.current = headlightBeam;

    // 6. INDUSTRIAL BRIDGE DECK FLOOR
    const deckGeo = new THREE.PlaneGeometry(16, 16);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.2
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.rotation.x = -Math.PI / 2;
    deckMesh.position.y = -0.01;
    deckMesh.receiveShadow = true;
    scene.add(deckMesh);

    // Grid Overlay for Technical Engineering look
    const gridHelper = new THREE.GridHelper(16, 32, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // Circular scanning ring on the deck
    const ringGeo = new THREE.RingGeometry(1.9, 2.05, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.003;
    scene.add(ringMesh);

    // ----------------------------------------------------
    // BUILD HIGHLY DETAILED 3D ROVER MODEL
    // ----------------------------------------------------
    const roverGroup = new THREE.Group();
    scene.add(roverGroup);

    // Shared Materials
    const brandTexture = createBrandedArmorTexture();
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.7,
      map: brandTexture || undefined
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.25,
      metalness: 0.85
    });
    const darkFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.8
    });
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
      metalness: 0.05
    });
    const goldCapMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.9
    });
    const glassCyanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    const glowCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe
    });

    allMaterialsRef.current = [armorMat, metalMat, darkFrameMat, rubberMat, goldCapMat, glassCyanMat, glowCyanMat];

    // A. CHASSIS (Multi-tiered armored body)
    const chassisBase = new THREE.Group();
    roverGroup.add(chassisBase);

    // Lower armor tub
    const lowerTubGeo = new THREE.BoxGeometry(1.2, 0.35, 2.1);
    const lowerTub = new THREE.Mesh(lowerTubGeo, darkFrameMat);
    lowerTub.position.y = 0.38;
    lowerTub.castShadow = true;
    lowerTub.receiveShadow = true;
    chassisBase.add(lowerTub);

    // Upper branded shell
    const upperShellGeo = new THREE.BoxGeometry(1.1, 0.3, 1.8);
    const upperShell = new THREE.Mesh(upperShellGeo, armorMat);
    upperShell.position.set(0, 0.65, -0.05);
    upperShell.castShadow = true;
    upperShell.receiveShadow = true;
    chassisBase.add(upperShell);
    chassisMeshRef.current = upperShell;

    // Sponson side pods (Left & Right)
    [-0.64, 0.64].forEach((xSide) => {
      const podGeo = new THREE.BoxGeometry(0.18, 0.25, 1.6);
      const podMesh = new THREE.Mesh(podGeo, metalMat);
      podMesh.position.set(xSide, 0.42, 0);
      podMesh.castShadow = true;
      chassisBase.add(podMesh);

      // Neon LED strip along side
      const stripGeo = new THREE.BoxGeometry(0.02, 0.04, 1.4);
      const stripMesh = new THREE.Mesh(stripGeo, glowCyanMat);
      stripMesh.position.set(xSide + (xSide > 0 ? 0.09 : -0.09), 0.42, 0);
      chassisBase.add(stripMesh);
    });

    // Front Bumper with Tow Hooks & Radar
    const bumperGeo = new THREE.BoxGeometry(1.3, 0.18, 0.2);
    const bumper = new THREE.Mesh(bumperGeo, metalMat);
    bumper.position.set(0, 0.32, 1.15);
    bumper.castShadow = true;
    chassisBase.add(bumper);

    // Radar Transducer Array (Front)
    const radarGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16);
    radarGeo.rotateX(Math.PI / 2);
    [-0.4, -0.15, 0.15, 0.4].forEach((rx) => {
      const radar = new THREE.Mesh(radarGeo, glassCyanMat);
      radar.position.set(rx, 0.32, 1.26);
      chassisBase.add(radar);
    });

    // Front Dual LED Headlight Units
    [-0.45, 0.45].forEach((hx) => {
      const hHousingGeo = new THREE.BoxGeometry(0.18, 0.12, 0.1);
      const hHousing = new THREE.Mesh(hHousingGeo, darkFrameMat);
      hHousing.position.set(hx, 0.62, 0.88);
      chassisBase.add(hHousing);

      const hLensGeo = new THREE.PlaneGeometry(0.14, 0.08);
      const hLens = new THREE.Mesh(hLensGeo, glowCyanMat);
      hLens.position.set(hx, 0.62, 0.935);
      chassisBase.add(hLens);
    });

    // Rear Hazard Warning Beacons (Amber / Red)
    [-0.45, 0.45].forEach((hx) => {
      const rBeaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12);
      rBeaconGeo.rotateX(Math.PI / 2);
      const rBeaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const rBeacon = new THREE.Mesh(rBeaconGeo, rBeaconMat);
      rBeacon.position.set(hx, 0.72, -0.96);
      chassisBase.add(rBeacon);
    });

    // Cooling Heatsink Fins (Rear Engine Deck)
    for (let f = 0; f < 6; f++) {
      const finGeo = new THREE.BoxGeometry(0.7, 0.08, 0.02);
      const fin = new THREE.Mesh(finGeo, metalMat);
      fin.position.set(0, 0.82, -0.45 - f * 0.08);
      chassisBase.add(fin);
    }

    clickableObjectsRef.current.push({ mesh: upperShell, compId: 'chassis' });

    // B. SIX INDEPENDENT WHEELS & ROCKER-BOGIE SUSPENSION
    const wheelPositions = [
      { x: -0.82, z: 0.75, name: 'FL' },
      { x: 0.82, z: 0.75, name: 'FR' },
      { x: -0.82, z: 0.0, name: 'ML' },
      { x: 0.82, z: 0.0, name: 'MR' },
      { x: -0.82, z: -0.75, name: 'RL' },
      { x: 0.82, z: -0.75, name: 'RR' }
    ];

    wheelsRef.current = [];

    wheelPositions.forEach((pos) => {
      // Suspension Arm Link
      const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
      const armMesh = new THREE.Mesh(armGeo, metalMat);
      armMesh.position.set(pos.x > 0 ? pos.x - 0.15 : pos.x + 0.15, 0.36, pos.z);
      armMesh.rotation.z = pos.x > 0 ? -Math.PI / 4 : Math.PI / 4;
      chassisBase.add(armMesh);

      // Wheel Assembly Group
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(pos.x, 0.22, pos.z);
      chassisBase.add(wheelAssembly);
      wheelsRef.current.push(wheelAssembly);

      // Rubber Tire with tread rings
      const tireGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, rubberMat);
      tire.castShadow = true;
      wheelAssembly.add(tire);

      // Tread Grooves
      const treadRingGeo = new THREE.TorusGeometry(0.242, 0.015, 8, 24);
      treadRingGeo.rotateY(Math.PI / 2);
      const tread1 = new THREE.Mesh(treadRingGeo, darkFrameMat);
      const tread2 = tread1.clone();
      tread1.position.x = -0.05;
      tread2.position.x = 0.05;
      wheelAssembly.add(tread1);
      wheelAssembly.add(tread2);

      // Wheel Rim Hub
      const rimGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.19, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, metalMat);
      wheelAssembly.add(rim);

      // Central Gold Dust Cap & Lug Nuts
      const capGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.21, 12);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, goldCapMat);
      wheelAssembly.add(cap);

      clickableObjectsRef.current.push({ mesh: tire, compId: 'wheels' });
    });

    // C. RAISED ROTATING SENSOR MAST & OPTICAL GIMBAL
    const mastGroup = new THREE.Group();
    mastGroup.position.set(-0.32, 0.8, -0.45);
    chassisBase.add(mastGroup);
    mastRef.current = mastGroup;

    // Mast Base & Cylindrical Pylon
    const mastPylonGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.55, 16);
    const mastPylon = new THREE.Mesh(mastPylonGeo, metalMat);
    mastPylon.position.y = 0.275;
    mastPylon.castShadow = true;
    mastGroup.add(mastPylon);

    // Mast Top Rotating Plate
    const mastPlateGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16);
    const mastPlate = new THREE.Mesh(mastPlateGeo, darkFrameMat);
    mastPlate.position.y = 0.56;
    mastGroup.add(mastPlate);

    // Camera Gimbal Pod (Yaw/Pitch)
    const gimbalGroup = new THREE.Group();
    gimbalGroup.position.set(0, 0.62, 0);
    mastGroup.add(gimbalGroup);
    gimbalRef.current = gimbalGroup;

    // Camera Housing (dual lens optical box)
    const camHousingGeo = new THREE.BoxGeometry(0.18, 0.14, 0.18);
    const camHousing = new THREE.Mesh(camHousingGeo, metalMat);
    camHousing.castShadow = true;
    gimbalGroup.add(camHousing);

    // Main 48MP Macro Lens Barrel
    const lensBarrelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16);
    lensBarrelGeo.rotateX(Math.PI / 2);
    const lensBarrel = new THREE.Mesh(lensBarrelGeo, darkFrameMat);
    lensBarrel.position.set(0.04, 0, 0.12);
    gimbalGroup.add(lensBarrel);

    const lensGlassGeo = new THREE.CircleGeometry(0.045, 16);
    const lensGlass = new THREE.Mesh(lensGlassGeo, glassCyanMat);
    lensGlass.position.set(0.04, 0, 0.171);
    gimbalGroup.add(lensGlass);

    // Secondary Thermal LWIR Lens
    const irLensGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.06, 12);
    irLensGeo.rotateX(Math.PI / 2);
    const irLens = new THREE.Mesh(irLensGeo, goldCapMat);
    irLens.position.set(-0.045, 0, 0.11);
    gimbalGroup.add(irLens);

    // Visual Field-of-View (FOV) Cone
    const fovGeo = new THREE.ConeGeometry(0.8, 1.8, 16, 1, true);
    fovGeo.rotateX(-Math.PI / 2);
    const fovMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const fovCone = new THREE.Mesh(fovGeo, fovMat);
    fovCone.position.set(0.04, 0, 0.95);
    gimbalGroup.add(fovCone);
    fovConeRef.current = fovCone;

    clickableObjectsRef.current.push({ mesh: camHousing, compId: 'camera_gimbal' });
    clickableObjectsRef.current.push({ mesh: mastPylon, compId: 'sensor_mast' });

    // D. 32-CHANNEL ROTATING SOLID-STATE LIDAR
    const lidarPylonGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16);
    const lidarPylon = new THREE.Mesh(lidarPylonGeo, darkFrameMat);
    lidarPylon.position.set(0, 0.84, 0.45);
    chassisBase.add(lidarPylon);

    // Spinning LiDAR Puck
    const lidarPuckGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.1, 24);
    const lidarPuckMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.8
    });
    const lidarPuck = new THREE.Mesh(lidarPuckGeo, lidarPuckMat);
    lidarPuck.position.set(0, 0.93, 0.45);
    lidarPuck.castShadow = true;
    chassisBase.add(lidarPuck);
    lidarRef.current = lidarPuck;

    // LiDAR Laser Scanner Visualization Beam Rings
    const lidarLaserGroup = new THREE.Group();
    lidarLaserGroup.position.set(0, 0.93, 0.45);
    chassisBase.add(lidarLaserGroup);
    lidarLaserGroupRef.current = lidarLaserGroup;

    for (let l = 0; l < 4; l++) {
      const scanRingGeo = new THREE.RingGeometry(0.8 + l * 0.7, 0.82 + l * 0.7, 32);
      scanRingGeo.rotateX(Math.PI / 2);
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35 - l * 0.06,
        side: THREE.DoubleSide
      });
      const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
      scanRing.position.y = -l * 0.05;
      lidarLaserGroup.add(scanRing);
    }

    clickableObjectsRef.current.push({ mesh: lidarPuck, compId: 'lidar' });

    // E. ARTICULATED 5-AXIS ROBOTIC ARM
    const armRoot = new THREE.Group();
    armRoot.position.set(0.28, 0.8, 0.15);
    chassisBase.add(armRoot);
    armBaseRef.current = armRoot;

    // Turret Slewing Base
    const armBaseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.1, 20);
    const armBaseMesh = new THREE.Mesh(armBaseGeo, darkFrameMat);
    armBaseMesh.position.y = 0.05;
    armRoot.add(armBaseMesh);

    // Shoulder Pivot Joint
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(0, 0.12, 0);
    armRoot.add(shoulderGroup);
    armShoulderRef.current = shoulderGroup;

    const shoulderJointGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const shoulderJoint = new THREE.Mesh(shoulderJointGeo, goldCapMat);
    shoulderGroup.add(shoulderJoint);

    // Upper Boom Segment
    const upperBoomGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.55, 16);
    upperBoomGeo.translate(0, 0.275, 0);
    const upperBoom = new THREE.Mesh(upperBoomGeo, armorMat);
    upperBoom.castShadow = true;
    shoulderGroup.add(upperBoom);

    // Elbow Pivot Joint
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, 0.55, 0);
    shoulderGroup.add(elbowGroup);
    armElbowRef.current = elbowGroup;

    const elbowJointGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const elbowJoint = new THREE.Mesh(elbowJointGeo, goldCapMat);
    elbowGroup.add(elbowJoint);

    // Forearm Extension
    const forearmGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.48, 16);
    forearmGeo.translate(0, 0.24, 0);
    const forearm = new THREE.Mesh(forearmGeo, metalMat);
    forearm.castShadow = true;
    elbowGroup.add(forearm);

    // Tooling End Effector (Nozzle + Ultrasound Sensor Probe)
    const effectorGroup = new THREE.Group();
    effectorGroup.position.set(0, 0.48, 0);
    elbowGroup.add(effectorGroup);
    armEffectorRef.current = effectorGroup;

    // Tool Head Body
    const toolHeadGeo = new THREE.BoxGeometry(0.12, 0.1, 0.15);
    const toolHead = new THREE.Mesh(toolHeadGeo, darkFrameMat);
    effectorGroup.add(toolHead);

    // Sealant Extrusion Nozzle (Heated copper tip)
    const nozzleGeo = new THREE.ConeGeometry(0.03, 0.1, 12);
    nozzleGeo.rotateX(Math.PI);
    nozzleGeo.translate(0, -0.08, 0.04);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.1, metalness: 0.9 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    effectorGroup.add(nozzle);

    // Ultrasound Transducer Probe
    const probeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.09, 12);
    probeGeo.translate(0, -0.07, -0.04);
    const probe = new THREE.Mesh(probeGeo, metalMat);
    effectorGroup.add(probe);

    // Initial Stowed Arm Pose
    shoulderGroup.rotation.x = -Math.PI / 3.2;
    elbowGroup.rotation.x = Math.PI / 1.7;

    clickableObjectsRef.current.push({ mesh: toolHead, compId: 'arm_effector' });
    clickableObjectsRef.current.push({ mesh: upperBoom, compId: 'arm_upper' });
    clickableObjectsRef.current.push({ mesh: forearm, compId: 'arm_forearm' });

    // ----------------------------------------------------
    // RAYCASTING FOR CLICKABLE 3D PARTS
    // ----------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const objectsToTest = clickableObjectsRef.current.map((item) => item.mesh);
      const intersects = raycaster.intersectObjects(objectsToTest, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const matched = clickableObjectsRef.current.find(
          (c) => c.mesh === hit || c.mesh === hit.parent
        );
        if (matched) {
          const compData = ROVER_COMPONENTS[matched.compId];
          setActiveComponent(compData);
          setShowComponentDetail(true);
          if (onSelectComponent) {
            onSelectComponent(compData);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // ----------------------------------------------------
    // ANIMATION & STATE-BASED PROCEDURAL RENDERING LOOP
    // ----------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // 1. Controls Update
      controls.update();

      // 2. Wheel Rotation & Suspension Sway when Traveling or Running
      const isMoving = currentState === 'Traveling to Site' || (speedKmh > 0 && currentState !== 'Idle');
      const wheelSpeed = isMoving ? (speedKmh > 0 ? speedKmh * 0.4 : 3.5) : 0;

      wheelsRef.current.forEach((wheel) => {
        wheel.rotation.x += wheelSpeed * 0.05;
      });

      if (isMoving) {
        roverGroup.position.y = Math.sin(elapsed * 12) * 0.008;
        roverGroup.rotation.z = Math.sin(elapsed * 6) * 0.005;
      } else {
        roverGroup.position.y = 0;
        roverGroup.rotation.z = 0;
      }

      // 3. Sensor Mast & Camera Gimbal Scan Motion
      if (gimbalRef.current) {
        if (currentState === 'Assessing Defect' || currentState === 'Inspection Requested') {
          gimbalRef.current.rotation.y = Math.sin(elapsed * 1.5) * 0.6;
          gimbalRef.current.rotation.x = Math.sin(elapsed * 2.2) * 0.25 + 0.15;
        } else {
          gimbalRef.current.rotation.y = Math.sin(elapsed * 0.4) * 0.15;
          gimbalRef.current.rotation.x = 0;
        }
      }

      // 4. LiDAR Spinning Animation
      if (lidarRef.current) {
        lidarRef.current.rotation.y += 0.12;
      }
      if (lidarLaserGroupRef.current) {
        lidarLaserGroupRef.current.rotation.y += 0.03;
        lidarLaserGroupRef.current.visible = showLidarBeams;
      }
      if (fovConeRef.current) {
        fovConeRef.current.visible = showSensorFov;
      }

      // 5. Robotic Arm Articulation during Repair / Inspection
      if (armBaseRef.current && armShoulderRef.current && armElbowRef.current) {
        if (currentState === 'Repair In Progress' || currentState === 'Assessing Defect') {
          // Dynamic Reach-out kinematic motion
          const cycle = elapsed * 1.8;
          armBaseRef.current.rotation.y = Math.sin(cycle * 0.5) * 0.6 + 0.3;
          armShoulderRef.current.rotation.x = -Math.PI / 4 + Math.sin(cycle) * 0.2;
          armElbowRef.current.rotation.x = Math.PI / 3 + Math.cos(cycle) * 0.25;

          // Nozzle tool vibration / sealant pulsation
          if (armEffectorRef.current) {
            armEffectorRef.current.rotation.z = Math.sin(elapsed * 18) * 0.05;
          }
        } else {
          // Smooth return to Stowed position
          armBaseRef.current.rotation.y = 0;
          armShoulderRef.current.rotation.x = -Math.PI / 3.2;
          armElbowRef.current.rotation.x = Math.PI / 1.7;
          if (armEffectorRef.current) {
            armEffectorRef.current.rotation.z = 0;
          }
        }
      }

      // 6. Dynamic State-based Lighting & Status Colors
      if (statusLightRef.current) {
        switch (currentState) {
          case 'Repair In Progress':
            statusLightRef.current.color.setHex(0x38bdf8);
            statusLightRef.current.intensity = 2.5 + Math.sin(elapsed * 8) * 1.5;
            break;
          case 'Verified Completed':
            statusLightRef.current.color.setHex(0x10b981);
            statusLightRef.current.intensity = 2.8;
            break;
          case 'Verification Pending':
          case 'Repair Authorized':
            statusLightRef.current.color.setHex(0xf59e0b);
            statusLightRef.current.intensity = 2.0 + Math.sin(elapsed * 4) * 1.0;
            break;
          case 'Manual Review Required':
            statusLightRef.current.color.setHex(0xf43f5e);
            statusLightRef.current.intensity = 3.5 + Math.sin(elapsed * 12) * 2.0;
            break;
          default:
            statusLightRef.current.color.setHex(0x06b6d4);
            statusLightRef.current.intensity = 2.2;
            break;
        }
      }

      // 7. Auto 360-degree orbit mode
      if (autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 2.0;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update wireframe mode when toggled
  useEffect(() => {
    allMaterialsRef.current.forEach((mat) => {
      if ('wireframe' in mat) {
        (mat as any).wireframe = wireframeMode;
      }
    });
  }, [wireframeMode]);

  // Set Camera View Presets
  const setViewPreset = (preset: 'perspective' | 'front' | 'rear' | 'left' | 'right' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    setCameraView(preset);
    setAutoRotate(false);

    switch (preset) {
      case 'perspective':
        cam.position.set(3.4, 2.3, 3.8);
        ctrl.target.set(0, 0.45, 0);
        break;
      case 'front':
        cam.position.set(0, 0.6, 4.2);
        ctrl.target.set(0, 0.45, 0);
        break;
      case 'rear':
        cam.position.set(0, 0.8, -4.2);
        ctrl.target.set(0, 0.45, 0);
        break;
      case 'left':
        cam.position.set(-4.5, 0.6, 0);
        ctrl.target.set(0, 0.45, 0);
        break;
      case 'right':
        cam.position.set(4.5, 0.6, 0);
        ctrl.target.set(0, 0.45, 0);
        break;
      case 'top':
        cam.position.set(0, 5.2, 0.05);
        ctrl.target.set(0, 0.45, 0);
        break;
    }
    ctrl.update();
  };

  return (
    <div className={`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay: Vehicle Identity & Live Mission State */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 backdrop-blur-md">
            TX-4 AUTONOMOUS ROVER
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border backdrop-blur-md ${
            currentState === 'Repair In Progress' ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500 animate-pulse' :
            currentState === 'Verified Completed' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500' :
            currentState === 'Verification Pending' ? 'bg-amber-950/80 text-amber-300 border-amber-500' :
            'bg-slate-900/80 text-slate-300 border-slate-700'
          }`}>
            {currentState}
          </span>
        </div>
        <p className="text-[11px] font-mono text-slate-400">
          Battery: <span className="text-emerald-400 font-bold">{batteryPct.toFixed(0)}%</span> &bull; 
          Velocity: <span className="text-cyan-300 font-bold">{speedKmh.toFixed(1)} km/h</span> &bull; 
          Kinematics: <span className="text-slate-200">Active</span>
        </p>
      </div>

      {/* Top Right: View Controls & Toggles Toolbar */}
      {showToolbar && (
        <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          {/* Camera View Buttons */}
          <div className="flex items-center gap-1 border-r border-slate-800 pr-1.5 mr-0.5">
            <button
              onClick={() => setViewPreset('perspective')}
              className={`px-2 py-1 rounded text-[10px] ${cameraView === 'perspective' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Perspective View"
            >
              ISO
            </button>
            <button
              onClick={() => setViewPreset('front')}
              className={`px-1.5 py-1 rounded text-[10px] ${cameraView === 'front' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Front View"
            >
              FRONT
            </button>
            <button
              onClick={() => setViewPreset('left')}
              className={`px-1.5 py-1 rounded text-[10px] ${cameraView === 'left' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Side View"
            >
              SIDE
            </button>
            <button
              onClick={() => setViewPreset('top')}
              className={`px-1.5 py-1 rounded text-[10px] ${cameraView === 'top' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Top Down"
            >
              TOP
            </button>
          </div>

          {/* 360 Auto-Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded ${autoRotate ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'text-slate-400 hover:text-white'}`}
            title="360° Inspection Orbit"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>

          {/* LiDAR Toggle */}
          <button
            onClick={() => setShowLidarBeams(!showLidarBeams)}
            className={`p-1.5 rounded ${showLidarBeams ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'text-slate-400 hover:text-white'}`}
            title="Toggle LiDAR Laser Visualization"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>

          {/* Sensor FOV Cone Toggle */}
          <button
            onClick={() => setShowSensorFov(!showSensorFov)}
            className={`p-1.5 rounded ${showSensorFov ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'text-slate-400 hover:text-white'}`}
            title="Toggle Optical Camera Field of View"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Wireframe Mode */}
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`p-1.5 rounded ${wireframeMode ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'text-slate-400 hover:text-white'}`}
            title="Toggle Structural Wireframe / Mesh"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => setViewPreset('perspective')}
            className="p-1.5 rounded text-slate-400 hover:text-cyan-300"
            title="Reset Camera Pose"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Floating Interactive Component Inspector Card */}
      {showComponentDetail && activeComponent && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20 bg-slate-900/95 backdrop-blur-md border border-cyan-800/80 rounded-xl p-3.5 shadow-2xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-slate-100 text-xs">{activeComponent.name}</span>
            </div>
            <button
              onClick={() => setShowComponentDetail(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              &times;
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Subsystem: <span className="text-cyan-300 font-semibold">{activeComponent.category}</span></span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
              {activeComponent.status}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {activeComponent.description}
          </p>

          <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-cyan-200">
            <strong>Engineering Spec:</strong> {activeComponent.specs}
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-2 right-3 z-10 pointer-events-none text-[10px] font-mono text-slate-400 hidden sm:block">
        Left Click Drag: Rotate &bull; Scroll: Zoom &bull; Right Click: Pan &bull; Click Parts for Specs
      </div>
    </div>
  );
};
