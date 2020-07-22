import React from 'react'
import { ScenePosition, generatePositionStyle } from './Scene'

export type Props = {
  style?: React.CSSProperties
  position?: Partial<ScenePosition>,
  scale?: number
}
export const SceneGroup: React.FC<Props> = (props) => {
  const scalePrefix = props.scale ? `scale(${props.scale}, ${props.scale}) ` : ''
  const transform = {transform: scalePrefix + 'translate(-50%, -50%) translateZ(0)'}
  // const transform = {transform: 'translate(-50%, -50%) translateZ(0)'}
  const style: React.CSSProperties = {position: 'relative', overflow: 'visible', ...transform, ...generatePositionStyle(props), ...props.style}
  return (
    <div className='scene-group' style={style}>
      {props.children}
    </div>
  )
}