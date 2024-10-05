import { run } from 'shell-commands';

import { overwrite } from '../utils';

export const r3f = async () => {
  await run(`
  yarn add --dev three @types/three @react-three/fiber @react-three/eslint-plugin @react-three/drei leva
`);

  overwrite(
    'eslint.config.mjs',
    `import config from 'eslint-config-tyler/eslint.config.mjs';
import { rules } from '@react-three/eslint-plugin';

config[0].ignores = ['docs/'];

// last element must be prettier, we insert our rules before it
config.splice(config.length - 1, 0, {
  plugins: {
    '@react-three': {
      rules,
    },
  },
  rules: {
    // ref: https://github.com/pmndrs/react-three-fiber/blob/master/packages/eslint-plugin/src/configs/recommended.ts
    '@react-three/no-clone-in-loop': 'error',
    '@react-three/no-new-in-loop': 'error',

    // https://github.com/jsx-eslint/eslint-plugin-react/issues/3423"
    'react/no-unknown-property': ['off'],
  },
});

export default config;`,
  );

  overwrite(
    'src/index.css',
    `@import '../node_modules/antd/dist/reset.css';

body {
  margin: 0;
}

body > div {
  width: 100vw;
  height: 100vh;
}`,
  );

  overwrite(
    'src/app.tsx',
    `
import React from 'react';
import { Canvas } from "@react-three/fiber";
import { auto } from 'manate/react';
import { useControls } from "leva";

import { Store } from './store';

const App = auto((props: { store: Store }) => {
  console.log(props.store.count);
  const { position } = useControls({
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
  });
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
      <mesh position={[position.x, position.y, position.z]}>
        <boxGeometry />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[3, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="green" />
      </mesh>
    </Canvas>
  );
});

export default App;`,
  );
};
