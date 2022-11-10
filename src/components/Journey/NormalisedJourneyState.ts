import { SceneDetails } from './SceneDetails'
export interface NormalisedJourneyState {
  sceneDetails: SceneDetails[]
  currentSceneIndex: number
  currentSceneStepIndex: number
  isInTransition: boolean
}

export function defaultNormalisedJourneyState(): NormalisedJourneyState {
  return {
    sceneDetails: [],
    currentSceneIndex: -1,
    currentSceneStepIndex: -1,
    isInTransition: false
  }
}