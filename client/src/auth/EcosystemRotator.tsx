import { useRef, useMemo, Suspense, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import shikshaSeal from "@assets/image_1771692892158.png";
import udyogSeal from "@assets/image_1771923592033.png";
import ushaAvatar from "@/assets/images/usha-avatar.png";

const ROTATION_DURATION = 12;
const LOGO_COUNT = 3;

function CoinMesh() {
  const coinRef = useRef<THREE.Group>(null!);
  const shadowRef = useRef<THREE.Mesh>(null!);
  const frontFaceRef = useRef<THREE.Mesh>(null!);
  const backFaceRef = useRef<THREE.Mesh>(null!);
  const lastFrontIdx = useRef(0);
  const lastBackIdx = useRef(1);

  const [shikshaTex, ushaTex, udyogTex] = useLoader(THREE.TextureLoader, [
    shikshaSeal,
    ushaAvatar,
    udyogSeal,
  ]);

  const textures = useMemo(() => {
    const all = [shikshaTex, ushaTex, udyogTex];
    all.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });
    return all;
  }, [shikshaTex, ushaTex, udyogTex]);

  const edgeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c0c0c0"),
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.2,
    });
  }, []);

  const frontMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: textures[0],
      metalness: 0.4,
      roughness: 0.3,
      envMapIntensity: 0.8,
    });
  }, [textures]);

  const backMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: textures[1],
      metalness: 0.4,
      roughness: 0.3,
      envMapIntensity: 0.8,
    });
  }, [textures]);

  const coinGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(1.5, 1.5, 0.12, 128);
  }, []);

  const ribGeometries = useMemo(() => {
    const ribs: THREE.BufferGeometry[] = [];
    const ribCount = 120;
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const ribGeo = new THREE.BoxGeometry(0.008, 0.1, 0.03);
      const matrix = new THREE.Matrix4();
      matrix.makeTranslation(
        Math.cos(angle) * 1.51,
        0,
        Math.sin(angle) * 1.51
      );
      matrix.multiply(
        new THREE.Matrix4().makeRotationY(-angle + Math.PI / 2)
      );
      ribGeo.applyMatrix4(matrix);
      ribs.push(ribGeo);
    }
    return ribs;
  }, []);

  const faceGeometry = useMemo(() => {
    return new THREE.CircleGeometry(1.48, 128);
  }, []);

  const swapTextures = useCallback(
    (cycleIndex: number) => {
      const frontIdx = (cycleIndex * 2) % LOGO_COUNT;
      const backIdx = (cycleIndex * 2 + 1) % LOGO_COUNT;

      if (frontIdx !== lastFrontIdx.current) {
        frontMaterial.map = textures[frontIdx];
        frontMaterial.needsUpdate = true;
        lastFrontIdx.current = frontIdx;
      }
      if (backIdx !== lastBackIdx.current) {
        backMaterial.map = textures[backIdx];
        backMaterial.needsUpdate = true;
        lastBackIdx.current = backIdx;
      }
    },
    [textures, frontMaterial, backMaterial]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (coinRef.current) {
      coinRef.current.rotation.y = (t / ROTATION_DURATION) * Math.PI * 2 * LOGO_COUNT;
      coinRef.current.position.y = Math.sin(t * 0.8) * 0.08;
    }

    if (shadowRef.current) {
      const scale = 1 - Math.sin(t * 0.8) * 0.08 * 0.5;
      shadowRef.current.scale.set(scale, scale, 1);
      const mat = shadowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 0.8) * 0.03;
    }

    const halfRotation = (ROTATION_DURATION / LOGO_COUNT) / 2;
    const cycleTime = t % ROTATION_DURATION;
    const segmentTime = ROTATION_DURATION / LOGO_COUNT;
    const currentSegment = Math.floor(cycleTime / segmentTime);
    const timeInSegment = cycleTime % segmentTime;

    if (timeInSegment > segmentTime * 0.4 && timeInSegment < segmentTime * 0.6) {
      swapTextures(currentSegment + 1);
    }
  });

  return (
    <>
      <group ref={coinRef} rotation={[Math.PI * 0.05, 0, 0]}>
        <mesh geometry={coinGeometry} material={edgeMaterial} castShadow />

        {ribGeometries.map((ribGeo, i) => (
          <mesh key={i} geometry={ribGeo} material={edgeMaterial} />
        ))}

        <mesh
          ref={frontFaceRef}
          geometry={faceGeometry}
          material={frontMaterial}
          position={[0, 0.061, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />

        <mesh
          ref={backFaceRef}
          geometry={faceGeometry}
          material={backMaterial}
          position={[0, -0.061, 0]}
          rotation={[Math.PI / 2, 0, Math.PI]}
        />
      </group>

      <mesh
        ref={shadowRef as any}
        position={[0, -1.8, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.2, 64]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} color="#e8f0ff" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-3, 4, -2]}
        intensity={0.5}
        color="#b8d4ff"
      />
      <pointLight position={[0, 3, 4]} intensity={0.4} color="#ffffff" />
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
        camera={{ position: [0, 0, 5], fov: 35 }}
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
