import React from 'react';
import { useJourneyState } from '../Journey/JourneyContext';

export const GradientBackground = (props: {innerColor?: string, outerColor?: string, style?: React.CSSProperties}) => {
  const journeyState = useJourneyState()
  const innerColor = props.innerColor ?? 'white'
  const outerColor = props.outerColor ?? 'gray'

  const gradient = `radial-gradient(${innerColor}, ${outerColor})`
  const styleMixin = props.style ?? {}
  return <div className='background' style={{ height: '100%', width: '100%', background: gradient, position: 'absolute', ...styleMixin}}>
    <div style={{position: 'absolute'}}>{journeyState.pastScenes.length + 1}/{journeyState.allScenes.length}</div>
  </div>;
};