import React, { useState } from 'react';
import { uniqueId, isString } from 'lodash';
export const px = (n: number) => n + 'px';

export function neg(n: string): string;
export function neg(n: number): number;
export function neg(n: number|string): number|string {
  if(isString(n)){
    return n.startsWith('-') ? n.substr(1) : '-' + n
  }
  return -1 * n
}


export interface ScenePosition {
  x: number; //accept strings too?
  y: number; //accept strings too?
}

function useUniqueId(){
  const [id] = useState(uniqueId('generate-scene-'))
  return id
}

export type SceneProps = {
  position?: Partial<ScenePosition>,
  style?: React.CSSProperties 
  scale?: number
  fitFactor?: number
} & ({id?: string} | {'data-scene-id'?: string})

const showBorders = new URLSearchParams(window.location.search).get('borders') === 'true'
export const Scene: React.SFC<SceneProps> = (props) => {
  const randomId = useUniqueId()
  const id = (('data-scene-id' in props) ? props["data-scene-id"] : (('id' in props) ? props.id : undefined)) || randomId
  // const id = props['data-scene-id'] || randomId

  const scalePrefix = props.scale ? `scale(${props.scale}, ${props.scale}) ` : ''
  const transform = {transform: scalePrefix + 'translate(-50%, -50%) translateZ(0)'}
  // const transform = {}
  const borders = showBorders ? {border: '1px solid gray'} : {}
  const fitFactorAttribute = props.fitFactor !== undefined ? {'data-fit-factor': props.fitFactor} : {}
  const style: React.CSSProperties = { ...borders, position: 'absolute', ...generatePositionStyle(props), ...transform, ...props.style};
  return (
    <div id={id} className="scene" style={style} {...fitFactorAttribute}>
      {props.children}
    </div>
  )
};
export function generatePositionStyle (props: {position?: Partial<ScenePosition>}) {
  const { x = 0, y = 0 } = { x: 0, y: 0, ...props.position };
  const pixelPositions = { top: px(y), left: px(x) };
  return pixelPositions;
}

