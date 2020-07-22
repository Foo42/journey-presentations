import { SceneDetails } from './SceneDetails'
export interface NormalisedJourneyState {
  sceneDetails: SceneDetails[]
  currentSceneIndex: number
  currentSceneStepIndex: number
  isInTransition: boolean
}
