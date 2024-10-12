import { rmSync } from 'fs';
import { ensure } from '../utils';

const step = () => {
  rmSync('src/demo.ts');
  rmSync('test', { recursive: true, force: true });
  rmSync('src/index.ts');
  ensure(
    'src/index.tsx',
    `import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';
import store from './store';

const root = createRoot(document.getElementById('root')!);
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

const App = auto((props: { store: Store }) => {
  const { store } = props;
  return (
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
});

export default App;
`,
  );
  ensure(
    'src/index.html',
    `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Untitled App</title>
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <div id="root"></div>
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
