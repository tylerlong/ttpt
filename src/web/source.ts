import { rmSync } from 'fs';
import { ensure } from '../utils';

const step = () => {
  rmSync('src/index.ts');
  ensure(
    'src/index.tsx',
    `import React, { StrictMode } from 'react';
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
    'src/app.tsx',
    `import React from 'react';
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
    'src/index.html',
    `<!DOCTYPE html>
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
    'src/index.css',
    `
@import '../node_modules/antd/dist/reset.css';

body {
  padding: 1rem;
}
  `,
  );
  ensure(
    'src/store.ts',
    `import { manage } from 'manate';

export class Store {
  public count = 0;
}

const store = manage(new Store());

export default store;  
  `,
  );
};

export default step;
