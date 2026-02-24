import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import shikshaCoin from "@assets/image_1771927817215.png";
import udyogCoin from "@assets/image_1771927824621.png";
import ushaCoin from "@assets/image_1771927836393.png";

function CoinMesh() {
  const coinRef = useRef<THREE.Group>(null!);
  const shadowRef = useRef<THREE.Mesh>(null!);
  const frontMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const backMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const spinBoost = useRef(0);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const currentPair = useRef(0);

  const [shikshaTex, ushaTex, udyogTex] = useLoader(THREE.TextureLoader, [
    shikshaCoin,
    ushaCoin,
    udyogCoin,
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

  const pairs = useMemo(
    () => [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
    []
  );

  const edgeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c0c0c0"),
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.2,
    });
  }, []);

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

  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseOffset.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.15;
      mouseOffset.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.1;
    };

    const onClick = () => {
      spinBoost.current = 8;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("click", onClick);
    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("click", onClick);
    };
  }, [gl]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    if (spinBoost.current > 0) {
      spinBoost.current = Math.max(0, spinBoost.current - delta * 4);
    }

    if (coinRef.current) {
      const baseSpeed = 0.4;
      const speed = baseSpeed + spinBoost.current;
      coinRef.current.rotation.y += speed * delta;
      coinRef.current.position.y = Math.sin(t * 0.8) * 0.08;

      coinRef.current.rotation.x =
        Math.PI * 0.08 + mouseOffset.current.y;
      coinRef.current.rotation.z = mouseOffset.current.x * 0.3;
    }

    if (shadowRef.current) {
      const scale = 1 - Math.sin(t * 0.8) * 0.08 * 0.5;
      shadowRef.current.scale.set(scale, scale, 1);
      const mat = shadowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 0.8) * 0.03;
    }

    if (coinRef.current && frontMatRef.current && backMatRef.current) {
      const rotY = coinRef.current.rotation.y % (Math.PI * 2);
      const isEdgeView =
        (rotY > Math.PI * 0.4 && rotY < Math.PI * 0.6) ||
        (rotY > Math.PI * 1.4 && rotY < Math.PI * 1.6);

      if (isEdgeView) {
        const newPair = (currentPair.current + 1) % pairs.length;
        if (newPair !== currentPair.current) {
          currentPair.current = newPair;
          const [fi, bi] = pairs[newPair];
          frontMatRef.current.map = textures[fi];
          frontMatRef.current.needsUpdate = true;
          backMatRef.current.map = textures[bi];
          backMatRef.current.needsUpdate = true;
        }
      }
    }
  });

  return (
    <>
      <group ref={coinRef} rotation={[Math.PI * 0.08, 0, 0]}>
        <mesh geometry={coinGeometry} material={edgeMaterial} castShadow />

        {ribGeometries.map((ribGeo, i) => (
          <mesh key={i} geometry={ribGeo} material={edgeMaterial} />
        ))}

        <mesh
          geometry={faceGeometry}
          position={[0, 0.061, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            ref={frontMatRef}
            map={textures[0]}
            metalness={0.5}
            roughness={0.25}
            envMapIntensity={0.8}
          />
        </mesh>

        <mesh
          geometry={faceGeometry}
          position={[0, -0.061, 0]}
          rotation={[Math.PI / 2, 0, Math.PI]}
        >
          <meshStandardMaterial
            ref={backMatRef}
            map={textures[1]}
            metalness={0.5}
            roughness={0.25}
            envMapIntensity={0.8}
          />
        </mesh>
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
      <ambientLight intensity={0.7} color="#e8f0ff" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-3, 4, -2]}
        intensity={0.6}
        color="#b8d4ff"
      />
      <pointLight position={[0, 3, 4]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, -2, -3]} intensity={0.3} color="#8ab4f8" />
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
