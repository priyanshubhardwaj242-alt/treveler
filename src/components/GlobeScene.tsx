"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GLOBE_RADIUS = 2.4;

/** Random point on the globe's surface, in spherical coordinates. */
function randomSurfacePoint(radius: number): THREE.Vector3 {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[GLOBE_RADIUS, 3]} />
      <meshBasicMaterial color="#E8734A" wireframe transparent opacity={0.28} />
    </mesh>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 900;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const p = randomSurfacePoint(GLOBE_RADIUS + 1.4 + Math.random() * 4.5);
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#D9A441" size={0.035} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** A single animated great-circle "flight path" between two random points on the globe. */
function RouteArc({ seed }: { seed: number }) {
  const material = useRef<THREE.LineDashedMaterial>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(seed);
    const a = randomSurfacePoint(GLOBE_RADIUS).applyAxisAngle(new THREE.Vector3(rand(), rand(), rand()).normalize(), rand() * Math.PI);
    const b = randomSurfacePoint(GLOBE_RADIUS).applyAxisAngle(new THREE.Vector3(rand(), rand(), rand()).normalize(), rand() * Math.PI);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS * (1.35 + rand() * 0.5));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const points = curve.getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    // computeLineDistances is a Line-instance method that writes the
    // lineDistance attribute onto the shared geometry — a throwaway Line
    // is only needed to call it, the geometry itself is what we keep.
    new THREE.Line(geo).computeLineDistances();
    return geo;
  }, [seed]);

  useFrame((_, delta) => {
       if (material.current) (material.current as unknown as { dashOffset: number }).dashOffset -= delta * 0.6;
  });

  return (
    <line geometry={geometry}>
      <lineDashedMaterial
        ref={material}
        color="#3E6259"
        transparent
        opacity={0.5}
        dashSize={0.12}
        gapSize={0.1}
      />
    </line>
  );
}

// Small deterministic PRNG so each arc's shape is stable across re-renders.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.15;
    }
  });

  return (
    <>
      <group ref={groupRef} position={[2.6, -0.4, -1]}>
        <Globe />
        {Array.from({ length: 7 }).map((_, i) => (
          <RouteArc key={i} seed={i * 1337 + 7} />
        ))}
      </group>
      <ParticleField />
    </>
  );
}

export default function GlobeBackground() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 9], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
    </Canvas>
  );
}
