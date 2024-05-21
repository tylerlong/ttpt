import { run } from 'shell-commands';

import { overwrite, replace } from '../utils';

export const r3f = async () => {
  await run(`
  yarn add --dev three @types/three @react-three/fiber @react-three/eslint-plugin
`);

  replace(
    '.eslintrc.js',
    "extends: ['alloy', 'alloy/react', 'alloy/typescript', 'prettier']",
    "extends: ['alloy', 'alloy/react', 'alloy/typescript', 'plugin:@react-three/recommended', 'prettier']",
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

import { Store } from './store';

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

export default App;`,
  );
};
