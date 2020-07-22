import React from 'react';
import { WithJourneyState } from './index';
export const grayGradientBackgroundRenderer = (props: WithJourneyState) => {
  return <div className='background' style={{ height: '100%', width: '100%', background: 'radial-gradient(white, gray)', position: 'absolute' }}>
    <div style={{position: 'absolute'}}>{props.journeyState.pastScenes.length + 1}/{props.journeyState.allScenes.length}</div>
  </div>;
};
