import React from 'react';

export interface Props {
  'for': string,
  'data-scene-id'?: string,
}
export const SceneProxy: React.FunctionComponent<Props> = (props) => {
  const id = props['data-scene-id'] || `proxy-for-${props.for}`

  return (
    <div id={id} className="scene-proxy" data-proxy-for={props.for}/>
  )
};
