import React, { useEffect, useState } from 'react';
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
