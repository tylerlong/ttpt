import { run } from 'shell-commands';

import { overwrite, replace } from '../utils';

export const r3f = async () => {
  await run(`
  yarn add --dev three @types/three @react-three/fiber @react-three/eslint-plugin @react-three/drei leva
`);

  replace(
    '.eslintrc.js',
    "extends: ['alloy', 'alloy/react', 'alloy/typescript', 'prettier']",
    "extends: ['alloy', 'alloy/react', 'alloy/typescript', 'plugin:@react-three/recommended', 'prettier']",
  );
  replace(
    '.eslintrc.js',
    "'prefer-const': ['error'],",
    "'prefer-const': ['error'],\n    'react/no-unknown-property': ['off'], // https://github.com/jsx-eslint/eslint-plugin-react/issues/3423",
  );

  overwrite(
    'src/index.css',
    `@import '../node_modules/antd/dist/reset.css';

body {
  margin: 0;
};

body > div {
  width: 100vw;
  height: 100vh;
}`,
  );

  overwrite(
    'src/app.tsx',
    `import React from 'react';
import { Canvas } from "@react-three/fiber";
import { auto } from 'manate/react';
import { useControls } from "leva";

import { Store } from './store';

const App = (props: { store: Store }) => {
  const { position } = useControls({
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
  });
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
  };
  return auto(render, props);
};

export default App;`,
  );
};
