import { NormalisedJourneyState } from './NormalisedJourneyState'
import { SceneDetails } from './SceneDetails'

export function isHtmlElement (el: unknown): el is HTMLElement {
  return el instanceof HTMLElement
}

type Vector2 = {x: number, y: number}
export function vectorSubtract (a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  }
}

export function elementCenter (el: Element): Vector2 {
  const box = el.getBoundingClientRect()
  return {
    x: box.left + box.width / 2,
    y: box.top + box.height / 2
  }
}
export function getElementPositionVector (el: Element): Vector2 {
  const box = el.getBoundingClientRect()
  return {
    x: box.left,
    y: box.top
  }
}

export function loadJourneyStateFromDom (): NormalisedJourneyState {
  const viewPosition = getElementPositionVector(document.querySelector('.scene-view')!)
  const sceneElements = Array.from(document.querySelectorAll('.scene,.scene-proxy')).filter(isHtmlElement)

  const proxyElements = sceneElements.filter(element => element.hasAttribute('data-proxy-for'))
  console.log(`found ${proxyElements.length} proxies`)
  console.log(`found ${sceneElements.length} scene elements`)
  const sceneAndProxyDetails: (SceneDetails | {id: string, proxyFor: string})[] = sceneElements.map(sceneElement => {
    const id = sceneElement.id
    if (proxyElements.includes(sceneElement)) {
      return { id, proxyFor: sceneElement.getAttribute('data-proxy-for') || 'BAD' }
    }
    const deltaVector = vectorSubtract(elementCenter(sceneElement), viewPosition)
    const position = deltaVector
    const boundingRect = sceneElement.getBoundingClientRect()
    const width = boundingRect.width
    const height = boundingRect.height
    const fitFactor = Number(sceneElement.getAttribute('data-fit-factor')) || undefined
    const stepsInScene = loadStepsForScene(sceneElement)
    return { position, id, width, height, steps: stepsInScene, fitFactor }
  })

  const sceneDetails: SceneDetails[] = sceneAndProxyDetails.map(item => {
    if ('proxyFor' in item) {
      const target = sceneAndProxyDetails.find(scene => scene.id === item.proxyFor)
      if (!target) {
        throw new Error(`SceneProxy ${item.id} target scene ${item.proxyFor} which could not be found`)
      }
      return { ...target, id: item.id, steps: [] } as SceneDetails
    } else {
      return item
    }
  })

  const [sceneIdFromHash, stepIdFromHash] = window.location.hash.substr(1).split('/')
  const currentSceneIndexFromHash = sceneDetails.findIndex(scene => scene.id === sceneIdFromHash)
  const currentStepIndexFromHash = (sceneDetails[currentSceneIndexFromHash] || { steps: [] }).steps.findIndex(step => step.id === stepIdFromHash)

  const currentSceneIndex = currentSceneIndexFromHash === -1 ? 0 : currentSceneIndexFromHash
  const currentSceneStepIndex = currentStepIndexFromHash === -1 ? 0 : currentStepIndexFromHash
  console.log(sceneDetails)
  return { sceneDetails, currentSceneIndex, currentSceneStepIndex, isInTransition: false }
}

function loadStepsForScene (sceneElement: HTMLElement) {
  const subSceneSteps = Array.from(sceneElement.querySelectorAll('.scene')).flatMap(subScene => Array.from(subScene.querySelectorAll('.journey-step')))
  const stepsInScene = Array.from(sceneElement.querySelectorAll('.journey-step')).filter(stepEl => !subSceneSteps.includes(stepEl)).map(el => ({ id: el.id }))
  console.log('loaded steps', stepsInScene)
  return stepsInScene
}
