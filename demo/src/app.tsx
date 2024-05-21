import React from 'react';
import { Canvas } from '@react-three/fiber';
import { auto } from 'manate/react';

import type { Store } from './store';

const App = (props: { store: Store }) => {
  const render = () => {
    return (
      <Canvas camera={{ position: [3, 3, 3] }}>
        <mesh>
          <boxGeometry />
          <meshNormalMaterial />
        </mesh>
      </Canvas>
    );
  };
  return auto(render, props);
};

export default App;
