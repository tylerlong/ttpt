import React from 'react';
import { Canvas } from '@react-three/fiber';
import { auto } from 'manate/react';

import type { Store } from './store';

const App = (props: { store: Store }) => {
  const render = () => {
    return (
      <Canvas camera={{ position: [0, 3, 8] }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 3, 5]} intensity={0.5} />

        {/* Objects */}
        <mesh position={[-3, 0, 0]}>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry />
          <meshStandardMaterial color="blue" />
        </mesh>
        <mesh position={[3, 0, 0]}>
          <boxGeometry />
          <meshStandardMaterial color="green" />
        </mesh>
      </Canvas>
    );
  };
  return auto(render, props);
};

export default App;
