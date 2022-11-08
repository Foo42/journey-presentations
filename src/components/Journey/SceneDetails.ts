import { ScenePosition } from '../Scene'
export interface StepDetails {
  id?: string
}
export interface SceneDetails {
  position: ScenePosition
  steps: StepDetails[]
  width: number
  height: number
  fitFactor?: number
  id: string
}

export interface ProxySceneDetails {
  id: string,
  proxyFor: string
}
