import React, { useEffect, useState } from 'react';
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
