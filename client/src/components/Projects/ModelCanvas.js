import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';

/**
 * Everything in this module is code-split out of the main bundle: importing it
 * pulls in @react-three/fiber, @react-three/drei, three and DRACOLoader, which
 * together were almost all of the 389 KB gzipped initial chunk. Keeping them
 * here means the hero and About render from a small bundle and first paint no
 * longer waits on the 3D stack. Projects.js loads this lazily, and only once
 * the Projects section approaches the viewport.
 */

// Self-hosted copy of the environment map drei's environment="city" preset uses.
// The preset resolves to raw.githack.com (useEnvironment.js:8) — rate-limited
// third-party hosting on the critical path. Byte-identical file, our own origin.
const ENVIRONMENT = { files: process.env.PUBLIC_URL + '/hdri/potsdamer_platz_1k.hdr' };

// drei defaults the Draco decoder to https://www.gstatic.com/draco/... (Gltf.js:8).
// Passing a string as useGLTF's second argument is drei's own supported override
// (Gltf.js:18), so this points DRACOLoader at public/draco/ with no patching.
// Trailing slash required: DRACOLoader concatenates decoderPath + filename.
export const DRACO_DECODER_PATH = process.env.PUBLIC_URL + '/draco/';

const Model = ({ modelPath, scale = 1, position = [0, 0, 0] }) => {
  const { scene } = useGLTF(modelPath, DRACO_DECODER_PATH);
  return <primitive object={scene} scale={scale} position={position} />;
};

// A Suspense child, so it can only mount once the model's fetch has resolved.
// That is the signal used to retire the flat placeholder.
const ModelReady = ({ onReady }) => {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
};

// The three OrbitControls angle/target props were previously written as
// `project.title === 'HomePod Evolution' ? X : X` — both branches identical in
// all three cases. Collapsed to the single value; behaviour is unchanged.
const ModelCanvas = ({ project, onReady }) => (
  <Canvas camera={{ position: project.cameraPosition, fov: 45 }}>
    {/* No fallback element: the flat .model-placeholder behind the canvas
        already holds the box at every breakpoint. */}
    <Suspense fallback={null}>
      <Stage environment={ENVIRONMENT} intensity={0.8} adjustCamera={false}>
        <Model
          modelPath={project.model}
          scale={project.scale}
          position={project.position}
          rotation={project.rotation}
        />
      </Stage>
      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={2}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
        target={[0, 0, 0]}
      />
      <ModelReady onReady={onReady} />
    </Suspense>
  </Canvas>
);

export default ModelCanvas;
