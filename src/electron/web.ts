import { renameSync, rmSync } from 'fs';

import { ensure, overwrite } from '../utils';

const step = () => {
  rmSync('src/index.css');
  rmSync('src/index.html');
  rmSync('src/app.tsx');
  rmSync('src/icon.svg');

  ensure(
    'src/web/settings/index.css',
    `@import '../../../node_modules/antd/dist/reset.css';

body {
  padding: 1rem;
}
  `,
  );

  ensure(
    'src/web/settings/index.tsx',
    `import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { auto } from 'manate/react';
import { ConfigProvider, Form, Radio, theme } from 'antd';
import { autoRun, manage } from 'manate';
import type { Managed } from 'manate/models';
import { debounce } from 'lodash';
import hyperid from 'hyperid';

import CONSTS from '../../constants';

const uuid = hyperid();

class Store {
  public appearance: 'auto' | 'dark' | 'light' = 'auto';
  public formKey = uuid();
  public refreshForm() {
    this.formKey = uuid();
  }
}
const store = manage(new Store());

const App = (props: { store: Store }) => {
  const { store } = props;
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    return global.ipc.on(CONSTS.IS_DARK_MODE, (event, payload) => {
      document.body.style.backgroundColor = (payload ? theme.darkAlgorithm : theme.defaultAlgorithm)(
        theme.defaultSeed,
      ).colorBgContainer;
      setIsDark(payload);
    });
  }, []);
  useEffect(() => {
    const { start, stop } = autoRun(
      store as Managed<Store>,
      () => {
        global.ipc.invoke(CONSTS.SAVE_SETTINGS, { appearance: store.appearance });
      },
      (func: () => void) => debounce(func, 100, { leading: true, trailing: true }),
    );
    const init = async () => {
      const settings = await global.ipc.invoke(CONSTS.LOAD_SETTINGS);
      store.appearance = settings.appearance;
      store.refreshForm();
      start();
    };
    init();
    return stop;
  }, []);
  const render = () => {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#00b96b',
          },
        }}
      >
        <Form initialValues={{ appearance: store.appearance }} key={store.formKey}>
          <Form.Item label="Appearance" name="appearance">
            <Radio.Group
              buttonStyle="solid"
              onChange={(event) => {
                store.appearance = event.target.value;
              }}
            >
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="dark">Dark</Radio.Button>
              <Radio.Button value="auto">Auto</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </ConfigProvider>
    );
  };
  return auto(render, props);
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App store={store} />);
  `,
  );

  ensure(
    'src/web/settings/settings.html',
    `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; img-src data:;" />
    <title>Settings - Untitled App</title>
    <link rel="stylesheet" href="index.css" />
    <script type="module" src="index.tsx"></script>
  </head>
  <body></body>
</html>
  `,
  );

  overwrite(
    'src/web/index.html',
    `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' data:;" />
    <title>Untitled App</title>
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <script type="module" src="index.tsx"></script>
  </body>
</html>  
  `,
  );

  overwrite(
    'src/web/index.css',
    `@import '../../node_modules/antd/dist/reset.css';

body {
  padding: 1rem;
}
  `,
  );

  overwrite(
    'src/web/app.tsx',
    `import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, Space, Typography, theme } from 'antd';
import { auto } from 'manate/react';

import type { Store } from './store';
import CONSTS from '../constants';

const { Text, Title } = Typography;

const App = (props: { store: Store }) => {
  const { store } = props;
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const disposer = global.ipc.on(CONSTS.IS_DARK_MODE, (event, isDarkMode) => {
      document.body.style.backgroundColor = (isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm)(
        theme.defaultSeed,
      ).colorBgContainer;
      setIsDark(isDarkMode);
    });
    global.ipc.invoke(CONSTS.IS_DARK_MODE);
    return disposer;
  }, []);
  const render = () => {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#00b96b',
          },
        }}
      >
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
      </ConfigProvider>
    );
  };
  return auto(render, props);
};

export default App;
  `,
  );

  ensure(
    'src/web/Globals.d.ts',
    `declare namespace ipc {
  function invoke(channel: string, ...args: any[]): Promise<any>;
  function on(channel: string, listener: (...args: any[]) => void): () => void;
}
  `,
  );

  renameSync('src/store.ts', 'src/web/store.ts');
  renameSync('src/index.tsx', 'src/web/index.tsx');
};

export default step;
