import React from 'react';
import EpicPlayerStore from './EpicPlayerStore';
import { observer } from 'mobx-react';

// TODO: If showing errors in the overlay, consider showing all app errors in a single list.

const EpicPlayer = observer(() => {
  const epicPlayerStore = EpicPlayerStore.getInstance();
  
  return (
    <React.Fragment>
      { epicPlayerStore.errors.length > 0 ? (
        <div className="EpicPlayer-errors">
          { epicPlayerStore.errors.map((error: string) => {
            return <div className="EpicPlayer-error"></div>
          }) }
        </div>
      ) : (null) }
    </React.Fragment>
  );
});

export default EpicPlayer;
