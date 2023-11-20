import { readFileSync, rmSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { join } from 'path';
import { run } from 'shell-commands';

import { adjust, ensure } from '../utils';

export const web = async () => {
  adjust(
    '.gitignore',
    '',
    `
.parcel-cache/
docs/
  `,
  );
  adjust('.eslintignore', '', 'docs/');
  adjust('.prettierignore', '', 'docs/');
  adjust('.ackrc', '', '--ignore-dir=docs');

  await run(`
    yarn add --dev antd react react-dom manate @types/react-dom parcel 
  `);

  const pkgJson = {
    scripts: {
      serve: 'rm -rf .parcel-cache && parcel src/index.html --dist-dir docs',
    },
  };
  let originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  delete originalPkg.scripts.test;
  writeFileSync('package.json', JSON.stringify(merge(pkgJson, originalPkg), null, 2));

  rmSync(join('src', 'index.ts'));
  ensure(
    join('src', 'index.tsx'),
    `
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';
import store from './store';

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
  `,
  );
  ensure(
    join('src', 'app.tsx'),
    `
import React from 'react';
import { Button, Space, Typography } from 'antd';
import { auto } from 'manate/react';

import { Store } from './store';

const { Text, Title } = Typography;

const App = (props: { store: Store }) => {
  const { store } = props;
  const render = () => (
    <>
      <Title>Untitled App</Title>
      <Space>
        <Button
          onClick={() => {
            store.count -= 1;
          }}
        >
          -
        </Button>
        <Text>{store.count}</Text>
        <Button
          onClick={() => {
            store.count += 1;
          }}
        >
          +
        </Button>
      </Space>
    </>
  );
  return auto(render, props);
};

export default App;
`,
  );
  ensure(
    join('src', 'index.html'),
    `
<!DOCTYPE html>
<html>
  <head>
    <title>Untitled App</title>
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <script type="module" src="index.tsx"></script>
  </body>
</html>
  `,
  );
  ensure(
    join('src', 'index.css'),
    `
@import '../node_modules/antd/dist/reset.css';

body {
  padding: 1rem;
}
  `,
  );
  ensure(
    join('src', 'store.ts'),
    `
import { manage } from 'manate';

export class Store {
  public count = 0;
}

const store = manage(new Store());

export default store;  
  `,
  );
  ensure(
    'tsconfig.json',
    `
{
  "compilerOptions": {
    "esModuleInterop": true,
    "jsx": "react"
  }
}
  `,
  );
};
