import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import './RetroMessageConsole.css';
import DisplayMessageStore from '../DisplayMessageStore';
import { DisplayMessage } from '../DisplayMessageStore/model/DisplayMessage';
import { DisplayMessageGroupConfig } from '../DisplayMessageStore/model/DisplayMessageGroupConfig';
import { RetroMessageConsoleProps } from './model/RetroMessageConsoleProps';
import { get } from 'lodash';

// @ts-ignore
// TODO: Add type definition
import Typewriter from 'typewriter-effect';

const DISPLAY_GROUP_ID = 'RetroMessageConsole';

const displayMessageStore = DisplayMessageStore.getInstance();

const RetroMessageConsole = observer(({ 
  width, top, left, fontSize, typeDelay, typeCursor, messageCategories, maxDisplayedMessages
}: RetroMessageConsoleProps) => {

  useEffect(() => {
    // update display group when props change
    const displayGroupConfig: DisplayMessageGroupConfig = {
      messageCategories,
      maxDisplayedMessages
    };
    displayMessageStore.addDisplayMessageGroup(DISPLAY_GROUP_ID, displayGroupConfig);

  }, [messageCategories, maxDisplayedMessages]);

  const style = {
    width: `${width}px`,
    top: `${top}px`,
    left: `${left}px`,
    fontSize: `${fontSize}px`,
    lineHeight: `${(fontSize + (Math.round(fontSize * .15)))}px`,
    height: `${ window.innerHeight - top }px`,
  }

  const messages = get(displayMessageStore, `messages2.${DISPLAY_GROUP_ID}.messages`, []);
  
  return (
    <div className="RetroMessageConsole" style={style}>
      { messages.length > 0 && (
        <div className='messages'>
          { messages.map((message: DisplayMessage) => {
              return <div key={`message-${message.id}`}>
                <Typewriter
                  options={{
                    delay: typeDelay || 15,
                    cursor: typeCursor || '▋'
                  }}
                  onInit={(typewriter: any) => {
                    typewriter.typeString(message.message).start();
                  }}
                />
              </div>
            })
          }
        </div>
      )}
    </div>
  );
});

export default RetroMessageConsole;
