import { getCurrentScene } from './denormaliseJourneyState'
import { NormalisedJourneyState } from './NormalisedJourneyState'

type Action = {
  type: 'advance';
} | {
  type: 'retard';
} | {
  type: 'replace';
  newState: NormalisedJourneyState;
} | {
  type: 'slideTransitionComplete';
} | {
  type: 'toggle-blackout'
}

export function reducer (state: NormalisedJourneyState, action: Action): NormalisedJourneyState {
  switch (action.type) {
    case 'advance':
      return advance(state)
    case 'retard':
      return retard(state)
    case 'replace':
      return action.newState
    case 'slideTransitionComplete':
      return { ...state, isInTransition: false }
    case 'toggle-blackout':
      return {...state, isBlackout: !state.isBlackout}
    default:
      return state
  }
}

function advance (normalised: NormalisedJourneyState): NormalisedJourneyState {
  const currentScene = getCurrentScene(normalised)
  if (!currentScene) {
    return normalised
  }
  console.log(`currentStepIndex: ${normalised.currentSceneStepIndex} out of ${currentScene && currentScene.steps.length}`)
  if ((normalised.currentSceneStepIndex + 1) < currentScene.steps.length) {
    // Advance step
    const newStepIndex = normalised.currentSceneStepIndex + 1
    console.log('advancing to step ', newStepIndex, 'from', normalised.currentSceneStepIndex)
    return { ...normalised, currentSceneStepIndex: newStepIndex }
  }
  // No step remaining so advance scene
  const maxIndex = normalised.sceneDetails.length - 1
  const oldIndex = normalised.currentSceneIndex
  if (oldIndex === maxIndex) {
    return normalised
  }
  const possibleNewIndex = oldIndex + 1
  const newIndex = Math.min(maxIndex, possibleNewIndex)
  console.log('advancing to', newIndex, 'from', normalised.currentSceneIndex, 'withMax', maxIndex)
  return { ...normalised, currentSceneIndex: newIndex, currentSceneStepIndex: -1, isInTransition: true }
}

function retard (normalised: NormalisedJourneyState): NormalisedJourneyState {
  const currentScene = getCurrentScene(normalised)
  if (!currentScene) {
    return normalised
  }

  if (normalised.currentSceneStepIndex >= 0) {
    // retard step
    const newStepIndex = normalised.currentSceneStepIndex - 1
    console.log('retarding to step ', newStepIndex, 'from', normalised.currentSceneStepIndex)
    return { ...normalised, currentSceneStepIndex: newStepIndex }
  }

  const minIndex = 0
  const newIndex = Math.max(minIndex, normalised.currentSceneIndex - 1)
  console.log('retarding to', newIndex)
  return { ...normalised, currentSceneIndex: newIndex, isInTransition: true }
}
