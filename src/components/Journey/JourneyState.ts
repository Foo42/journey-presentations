import { ScenePosition } from '../Scene'
import { SceneDetails, StepDetails } from './SceneDetails'
export interface JourneyState {
  allScenes: SceneDetails[]
  currentScene?: SceneDetails
  pastScenes: SceneDetails[]
  futureScenes: SceneDetails[]
  currentPosition: ScenePosition
  currentStep?: StepDetails
  allPastSteps: StepDetails[]
  allFutureSteps: StepDetails[]
  currentSceneStepIndex?: number
  isInTransition: boolean
  isFuture: (id: string) => boolean
  isBlackout: boolean
  isOverview: boolean
}
