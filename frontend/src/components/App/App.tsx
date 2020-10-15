import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import { config } from '../../config';
import { AppSocketEmit } from './model/AppSocketEmit';
import { AppSocketEvent } from './model/AppSocketEvent';
import './App.css';
import EpicPlayer from '../EpicPlayer';
import { get } from 'lodash';
import { ClientConfigEvent } from './model/ClientConfigEvent';
import RetroMessageConsole from '../RetroMessageConsole';
import { RetroMessageConsoleProps } from '../RetroMessageConsole/model/RetroMessageConsoleProps';
import DisplayMessageStore from '../DisplayMessageStore';
import { DataSource } from '../DisplayMessageStore/model/DataSource';
import { DisplayMessageCategory } from '../DisplayMessageStore/model/DisplayMessageCategory';

// app socket connection
const socket = io(config.SOCKET_URL);

function App() {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [epicPlayerEnabled, setEpicPlayerEnabled] = useState(false);
  const [retroMessageConsoleEnabled, setRetroMessageConsoleEnabled] = useState(false);
  const [retroMessageConsoleProps, setRetroMessageConsoleProps] = useState<RetroMessageConsoleProps>({
    width: 500,
    top: 100,
    left: 50,
    fontSize: 32,
    typeDelay: 15,
    typeCursor: '▋',
    messageCategories: [
      DisplayMessageCategory.ERROR,
      DisplayMessageCategory.INFO,
      DisplayMessageCategory.LOG,
      DisplayMessageCategory.WARN
    ],
    maxDisplayedMessages: 5
  });

  /**
   * Cleanup socket.io connection to prevent memory leaks.
   */
  const cleanup = () => {
    socket.removeAllListeners();
    socket.close();
  }

  useEffect(() => {
    const displayMessageStore = DisplayMessageStore.getInstance();

    // let server know ready for config
    socket.emit(AppSocketEmit.READY);

    // on config received
    socket.on(AppSocketEvent.CLIENT_CONFIG, (config: ClientConfigEvent) => {
      setEpicPlayerEnabled(get(config, 'epicPlayerEnabled', false));
      setRetroMessageConsoleEnabled(get(config, 'retroMessageConsole.enabled', false));
      setRetroMessageConsoleProps(get(config, 'retroMessageConsole.props', {}));
      setLoadingConfig(false);
      displayMessageStore.addMessage({
        message: 'App config received from socket.',
        source: DataSource.LOCAL,
        category: DisplayMessageCategory.INFO
      });
    });

    return cleanup;
  }, []);

  return (
    <React.Fragment>
      { epicPlayerEnabled && (
        <EpicPlayer />
      ) }

      { retroMessageConsoleEnabled && (
        <RetroMessageConsole {...retroMessageConsoleProps} />
      ) }

      { loadingConfig && (
        <div>Connecting to OBS Web Toolkit server...</div>
      ) }
    </React.Fragment>
  );
}

export default App;
