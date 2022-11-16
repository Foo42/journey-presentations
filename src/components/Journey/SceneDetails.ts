import { ScenePosition } from '../Scene'
export interface StepDetails {
  id?: string
}
export type Frame = {
  position: ScenePosition,
  width: number,
  height: number,
  fitFactor?: number
}

export interface SceneDetails {
  frame: Frame
  steps: StepDetails[]
  id: string
}

export interface ProxySceneDetails {
  id: string,
  proxyFor: string
}
