import React, { useState } from 'react';

export interface Props {
  'for': string,
  'data-scene-id'?: string,
}
export const SceneProxy: React.SFC<Props> = (props) => {
  const id = props['data-scene-id'] || `proxy-for-${props.for}`

  return (
    <div id={id} className="scene-proxy" data-proxy-for={props.for}/>
  )
};
