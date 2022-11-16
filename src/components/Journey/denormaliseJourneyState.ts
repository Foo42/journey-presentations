import { flatMap } from 'lodash'
import { JourneyState } from './JourneyState'
import { NormalisedJourneyState } from './NormalisedJourneyState'
import { SceneDetails } from './SceneDetails'
export function getCurrentScene (normalised: NormalisedJourneyState): SceneDetails | undefined {
  const currentScene = normalised.sceneDetails[normalised.currentSceneIndex]
  return currentScene
}
export function denormaliseJourneyState (normalised: NormalisedJourneyState): JourneyState {
  const allScenes = normalised.sceneDetails
  const currentScene = getCurrentScene(normalised)
  if (!currentScene) {
    return {
      allScenes,
      currentScene,
      pastScenes: [],
      futureScenes: allScenes,
      currentPosition: { x: 0, y: 0 },
      allPastSteps: [],
      allFutureSteps: flatMap(allScenes, scene => scene.steps),
      isFuture: () => true,
      isInTransition: false,
      isBlackout: false,
      isOverview: false
    }
  }
  const pastScenes = allScenes.slice(0, normalised.currentSceneIndex)
  const futureScenes = allScenes.slice(normalised.currentSceneIndex + 1)
  const { currentSceneStepIndex } = normalised
  const position = normalised.isOverview && normalised.totalOverview ? normalised.totalOverview.position : currentScene.frame.position
  // TODO: Maybe change JourneyState type to expose the frame rather than just position
  const currentPosition = { ...position }
  const currentStep = currentScene.steps[normalised.currentSceneStepIndex]
  const stepsForCurrentScene = currentScene.steps
  const allPastSteps = [...flatMap(pastScenes, scene => scene.steps), ...stepsForCurrentScene.slice(0, currentSceneStepIndex + 1)]
  const allFutureSteps = [...stepsForCurrentScene.slice(currentSceneStepIndex + 1), ...flatMap(futureScenes, scene => scene.steps)]
  const isFutureScene = (id: string) => !!futureScenes.find(scene => scene.id === id)
  const isFutureStep = (id: string) => !!allFutureSteps.find(step => step.id === id)
  const isFuture = (id: string) => isFutureScene(id) || isFutureStep(id)
  return {
    allScenes,
    currentScene,
    pastScenes,
    futureScenes,
    currentPosition,
    currentStep,
    currentSceneStepIndex,
    allPastSteps: allPastSteps,
    allFutureSteps: allFutureSteps,
    isFuture,
    isInTransition: normalised.isInTransition,
    isBlackout: normalised.isBlackout,
    isOverview: normalised.isOverview
  }
}
