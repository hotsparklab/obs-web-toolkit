import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import { config } from '../../config';
import { AppSocketEmit } from './model/app-socket-emit';
import { AppSocketEvent } from './model/app-socket-event';
import './App.css';
import EpicPlayer from '../EpicPlayer';
import { get } from 'lodash';
import { ClientConfigEvent } from './model/ClientConfigEvent';

// app socket connection
const socket = io(config.SOCKET_URL);

function App() {
  const [epicPlayerEnabled, setEpicPlayerEnabled] = useState(false);

  /**
   * Cleanup socket.io connection to prevent memory leaks.
   */
  const cleanup = () => {
    socket.removeAllListeners();
    socket.close();
  }

  useEffect(() => {
    // let server know ready for config
    socket.emit(AppSocketEmit.READY);

    // on config received
    socket.on(AppSocketEvent.CLIENT_CONFIG, (config: ClientConfigEvent) => {
      const epicPlayerEnabled = get(config, 'epicPlayerEnabled', false);
      setEpicPlayerEnabled(epicPlayerEnabled);
    });

    return cleanup;
  }, []);

  return (
    <React.Fragment>
      { epicPlayerEnabled ? (
        <EpicPlayer></EpicPlayer>
      ) : (
        <div>Connecting OBS Web Toolkit...</div>
      ) }
    </React.Fragment>
  );
}

export default App;
