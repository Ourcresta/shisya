import { useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import shikshaCoin from "@assets/image_1771927817215.png";
import udyogCoin from "@assets/image_1771927824621.png";
import ushaCoin from "@assets/image_1771927836393.png";

const HOLD_DURATION = 5;
const FLIP_DURATION = 0.9;

function cubicBezierEase(t: number): number {
  const p1x = 0.22, p1y = 1.0;
  const p2x = 0.36, p2y = 1.0;
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const bx = 3 * p1x * mid * (1 - mid) * (1 - mid) + 3 * p2x * mid * mid * (1 - mid) + mid * mid * mid;
    if (bx < t) lo = mid; else hi = mid;
  }
  const u = (lo + hi) / 2;
  return 3 * p1y * u * (1 - u) * (1 - u) + 3 * p2y * u * u * (1 - u) + u * u * u;
}

function CoinMesh() {
  const groupRef = useRef<THREE.Group>(null!);
  const shadowRef = useRef<THREE.Mesh>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const mouseOffset = useRef({ x: 0, y: 0 });

  const phaseRef = useRef<"hold" | "flipping" | "showing" | "flipping_back">("hold");
  const phaseStartRef = useRef(0);
  const flipCountRef = useRef(0);
  const currentAngleRef = useRef(0);

  const [shikshaTex, ushaTex, udyogTex] = useLoader(THREE.TextureLoader, [
    shikshaCoin,
    ushaCoin,
    udyogCoin,
  ]);

  const textures = useMemo(() => {
    [shikshaTex, ushaTex, udyogTex].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });
    return [shikshaTex, ushaTex, udyogTex];
  }, [shikshaTex, ushaTex, udyogTex]);

  const backFaceTextures = useMemo(() => [textures[0], textures[2]], [textures]);

  const edgeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c0c0c0"),
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 1.2,
  }), []);

  const frontMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: textures[1],
    metalness: 0.5,
    roughness: 0.25,
    envMapIntensity: 0.8,
  }), [textures]);

  const backMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: textures[0],
    metalness: 0.5,
    roughness: 0.25,
    envMapIntensity: 0.8,
  }), [textures]);

  const coinMaterials = useMemo(() => [edgeMaterial, frontMaterial, backMaterial], [edgeMaterial, frontMaterial, backMaterial]);

  const coinGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(1.8, 1.8, 0.15, 128);
  }, []);

  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseOffset.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.12;
      mouseOffset.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.08;
    };
    canvas.addEventListener("pointermove", onPointerMove);
    return () => canvas.removeEventListener("pointermove", onPointerMove);
  }, [gl]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const elapsed = t - phaseStartRef.current;

    if (phaseRef.current === "hold") {
      if (elapsed >= HOLD_DURATION) {
        phaseRef.current = "flipping";
        phaseStartRef.current = t;
        const texIdx = flipCountRef.current % 2;
        backMaterial.map = backFaceTextures[texIdx];
        backMaterial.needsUpdate = true;
      }
    } else if (phaseRef.current === "flipping") {
      const progress = Math.min(elapsed / FLIP_DURATION, 1);
      const eased = cubicBezierEase(progress);
      currentAngleRef.current = eased * Math.PI;
      if (progress >= 1) {
        currentAngleRef.current = Math.PI;
        phaseRef.current = "showing";
        phaseStartRef.current = t;
      }
    } else if (phaseRef.current === "showing") {
      if (elapsed >= HOLD_DURATION) {
        phaseRef.current = "flipping_back";
        phaseStartRef.current = t;
      }
    } else if (phaseRef.current === "flipping_back") {
      const progress = Math.min(elapsed / FLIP_DURATION, 1);
      const eased = cubicBezierEase(progress);
      currentAngleRef.current = Math.PI + eased * Math.PI;
      if (progress >= 1) {
        currentAngleRef.current = 0;
        phaseRef.current = "hold";
        phaseStartRef.current = t;
        flipCountRef.current += 1;
      }
    }

    if (groupRef.current) {
      groupRef.current.rotation.z = currentAngleRef.current + mouseOffset.current.x * 0.3;
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.15;
      groupRef.current.rotation.x = mouseOffset.current.y;
      groupRef.current.rotation.y = 0.3;
    }

    if (shadowRef.current) {
      const scale = 1 - Math.sin(t * 0.8) * 0.1;
      shadowRef.current.scale.set(scale * 1.2, scale, 1);
      const mat = shadowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(t * 0.8) * 0.05;
    }
  });

  return (
    <>
      <group ref={groupRef} rotation={[0, 0.3, 0]}>
        <mesh
          ref={meshRef}
          geometry={coinGeometry}
          material={coinMaterials}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        />
      </group>

      <mesh
        ref={shadowRef as any}
        position={[0, -2.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.2, 64]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.5} color="#e8f0ff" />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.6}
        color="#00ffff"
      />
      <pointLight position={[0, 3, 4]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, -2, -3]} intensity={0.2} color="#8ab4f8" />
    </>
  );
}

export default function EcosystemRotator() {
  return (
    <div
      className="eco-rotator__coin-wrapper"
      data-testid="ecosystem-rotator"
    >
      <div className="eco-rotator__glow" />
      <div className="eco-rotator__aura" />
      <div className="eco-rotator__ring" />
      <Canvas
        shadows
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent", position: "relative", zIndex: 1 }}
        dpr={[1, 2]}
      >
        <SceneLighting />
        <Suspense fallback={null}>
          <CoinMesh />
          <Environment preset="studio" environmentIntensity={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
