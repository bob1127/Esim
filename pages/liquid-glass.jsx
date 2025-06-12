import * as THREE from "three";
import { useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  useFBO,
  useGLTF,
  Text,
  Scroll,
  ScrollControls,
  Preload,
  MeshTransmissionMaterial,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { easing } from "maath";
import "tailwindcss/tailwind.css";

export default function App() {
  return (
    <div className="w-full h-screen bg-[#f0f0f0] font-sans">
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} dpr={[1, 2]}>
        <ScrollControls damping={0.2} pages={1} distance={0.5}>
          <Lens>
            <Scroll>
              <Typography />
            </Scroll>
            <Scroll html>
              <div className="absolute top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2 z-50">
                <button
                  className="px-6 py-3 backdrop-blur-md bg-white/10 border border-white/30 text-black rounded-full shadow-lg hover:bg-white/20 transition-all duration-300"
                  onClick={() => alert("Enter clicked")}
                >
                  Enter
                </button>
              </div>
            </Scroll>
            <Preload />
          </Lens>
        </ScrollControls>
        <Environment preset="sunset" background />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <ContactShadows
          position={[0, -3, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
      </Canvas>
    </div>
  );
}

function Lens({ children, damping = 0.15, ...props }) {
  const ref = useRef();
  const [scale, setScale] = useState(0.25);
  const [hovered, setHovered] = useState(false);
  const { nodes } = useGLTF("/lens-transformed.glb");
  const buffer = useFBO();
  const viewport = useThree((state) => state.viewport);
  const [scene] = useState(() => new THREE.Scene());

  useFrame((state, delta) => {
    const viewport = state.viewport.getCurrentViewport(
      state.camera,
      [0, 0, 15]
    );
    easing.damp3(
      ref.current.position,
      [
        (state.pointer.x * viewport.width) / 2,
        (state.pointer.y * viewport.height) / 2,
        15,
      ],
      damping,
      delta
    );

    const ripple = hovered ? Math.sin(state.clock.elapsedTime * 10) * 0.05 : 0;
    const finalScale = scale + ripple;

    easing.damp(ref.current.scale, "x", finalScale, 0.15, delta);
    easing.damp(ref.current.scale, "y", finalScale, 0.15, delta);
    easing.damp(ref.current.scale, "z", finalScale, 0.15, delta);

    state.gl.setRenderTarget(buffer);
    state.gl.setClearColor("#f0f0f0");
    state.gl.render(scene, state.camera);
    state.gl.setRenderTarget(null);
  });

  const onClick = () => {
    setScale(0.5);
    setTimeout(() => setScale(0.25), 200);
  };

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
      <mesh
        ref={ref}
        rotation-x={Math.PI / 2}
        geometry={nodes.Cylinder.geometry}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={1.5}
          thickness={3}
          anisotropy={0.3}
          chromaticAberration={0.1}
          distortion={0.4}
          temporalDistortion={0.4}
        />
      </mesh>
    </>
  );
}

function Typography() {
  const state = useThree();
  const { width, height } = state.viewport.getCurrentViewport(
    state.camera,
    [0, 0, 12]
  );
  return (
    <Text
      children="e-SIM"
      anchorX="left"
      position={[-width / 2.5, -height / 10, 12]}
      font="/Inter-Regular.woff"
      letterSpacing={-0.1}
      color="#227eff"
    />
  );
}
