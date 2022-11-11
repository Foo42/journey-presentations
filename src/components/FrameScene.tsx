import React, { createElement, CSSProperties, PropsWithChildren } from 'react';
import { useId } from "react"

type FrameSceneProps = {
  id?: string
  selectors: string
  fitFactor?: number
}
export const FrameScene: React.FunctionComponent<PropsWithChildren<FrameSceneProps>> = (props) => {
  const id = props.id ?? `frame-${useId()}`
  const fitFactorMixin = props.fitFactor === undefined ? {} : {'data-fit-factor': props.fitFactor}
  return <div className="frame-scene" data-frame-around={props.selectors} id={id} {...fitFactorMixin}></div>
}

