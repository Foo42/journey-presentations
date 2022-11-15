import React from 'react'
import { ScenePosition, generatePositionStyle } from './Scene'

export type Props = {
  children?: React.ReactNode,
  style?: React.CSSProperties
  position?: Partial<ScenePosition>,
  scale?: number
}
export const SceneGroup: React.FC<Props> = (props) => {
  const isAbsolutelyPositioned = props.position !== undefined

  const scalePrefix = props.scale ? `scale(${props.scale}, ${props.scale}) ` : ''
  const centreTransform = isAbsolutelyPositioned ? 'translate(-50%, -50%)' : ''
  const zTransform = 'translateZ(0)'
  const transform = {transform: [scalePrefix, centreTransform, zTransform].join(' ')}

  const positionMixin: React.CSSProperties = isAbsolutelyPositioned ? {position: 'absolute'} : {}

  const style: React.CSSProperties = {...positionMixin, overflow: 'visible', ...transform, ...generatePositionStyle(props), ...props.style}
  return (
    <div className='scene-group' style={style}>
      {props.children}
    </div>
  )
}