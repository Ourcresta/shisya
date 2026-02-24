import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import sealLogoUrl from "@assets/image_1771692892158.png";
import udyogLogoUrl from "@assets/image_1771923592033.png";

function CoinMesh() {
  const coinRef = useRef<THREE.Group>(null!);
  const shadowRef = useRef<THREE.Mesh>(null!);

  const [frontTexture, backTexture] = useLoader(THREE.TextureLoader, [
    sealLogoUrl,
    udyogLogoUrl,
  ]);

  const edgeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c0c0c0"),
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.2,
    });
  }, []);

  const frontMaterial = useMemo(() => {
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.generateMipmaps = true;
    frontTexture.minFilter = THREE.LinearMipmapLinearFilter;
    frontTexture.magFilter = THREE.LinearFilter;
    return new THREE.MeshStandardMaterial({
      map: frontTexture,
      metalness: 0.4,
      roughness: 0.3,
      envMapIntensity: 0.8,
    });
  }, [frontTexture]);

  const backMaterial = useMemo(() => {
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.generateMipmaps = true;
    backTexture.minFilter = THREE.LinearMipmapLinearFilter;
    backTexture.magFilter = THREE.LinearFilter;
    return new THREE.MeshStandardMaterial({
      map: backTexture,
      metalness: 0.4,
      roughness: 0.3,
      envMapIntensity: 0.8,
    });
  }, [backTexture]);

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

  useFrame(({ clock }) => {
    if (coinRef.current) {
      const t = clock.getElapsedTime();
      coinRef.current.rotation.y = (t / 8) * Math.PI * 2;
      coinRef.current.position.y = Math.sin(t * 0.8) * 0.08;
    }
    if (shadowRef.current) {
      const t = clock.getElapsedTime();
      const scale = 1 - Math.sin(t * 0.8) * 0.08 * 0.5;
      shadowRef.current.scale.set(scale, scale, 1);
      shadowRef.current.material.opacity = 0.25 + Math.sin(t * 0.8) * 0.03;
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
          geometry={faceGeometry}
          material={frontMaterial}
          position={[0, 0.061, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />

        <mesh
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

export default function ThreeCoin() {
  return (
    <div
      style={{
        width: 200,
        height: 200,
        position: "relative",
        marginBottom: "1rem",
      }}
      data-testid="three-coin-container"
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
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
