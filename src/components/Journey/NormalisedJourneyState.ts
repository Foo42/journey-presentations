import { ScenePosition } from '../Scene'
import { SceneDetails } from './SceneDetails'
export interface NormalisedJourneyState {
  sceneDetails: SceneDetails[]
  currentSceneIndex: number
  currentSceneStepIndex: number
  isInTransition: boolean
  isBlackout: boolean,
  isOverview: boolean,
  totalOverview?: {
    position: ScenePosition
    width: number
    height: number
  }
}

export function defaultNormalisedJourneyState(): NormalisedJourneyState {
  return {
    sceneDetails: [],
    currentSceneIndex: -1,
    currentSceneStepIndex: -1,
    isInTransition: false,
    isBlackout: false,
    isOverview: false
  }
}