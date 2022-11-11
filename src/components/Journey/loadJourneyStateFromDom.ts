import { NormalisedJourneyState } from './NormalisedJourneyState'
import { ProxySceneDetails, SceneDetails } from './SceneDetails'

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
  console.log('Loading state from the Dom')
  const viewPosition = getElementPositionVector(document.querySelector('.scene-view')!)
  const allSceneElements = Array.from(document.querySelectorAll('.scene,.scene-proxy,.frame-scene')).filter(isHtmlElement)

  const proxyElements = allSceneElements.filter(element => element.hasAttribute('data-proxy-for'))
  const frameElements = allSceneElements.filter(element => element.hasAttribute('data-frame-around'))
  console.log(`found ${proxyElements.length} proxies`)
  console.log(`found ${frameElements.length} frames`)
  console.log(`found ${allSceneElements.length} scene elements`)

  const sceneAndProxyDetails: (SceneDetails | ProxySceneDetails)[] = allSceneElements.map(sceneElement => {
    const id = sceneElement.id
    if (proxyElements.includes(sceneElement)) {
      return { id, proxyFor: sceneElement.getAttribute('data-proxy-for') || 'BAD' }
    }
    if(frameElements.includes(sceneElement)){
      const frameSelectors = (sceneElement.getAttribute('data-frame-around') ?? '').split(',').map(id => id.trim())

      const framedElements = frameSelectors.flatMap(sel => [...document.querySelectorAll(sel)])
      const boundingRects = framedElements.map(el => el.getBoundingClientRect()).map(({height, width, x, y}) => ({top: y, left: x, bottom: y + height, right: x + width}))
      if(boundingRects.length === 0){
        throw new Error(`No elements match data-frame-around = "${frameSelectors}" for frame-scene: ${id}`)
      }
      const maxBound = boundingRects.reduce((agg, current) => ({
        top: Math.min(agg.top, current.top),
        left: Math.min(agg.left, current.left),
        right: Math.max(agg.right, current.right),
        bottom: Math.max(agg.bottom, current.bottom)
      }))
      const centre = {
        x: (maxBound.left + maxBound.right) / 2,
        y: (maxBound.top + maxBound.bottom) / 2
      }
      const deltaVector = vectorSubtract(centre, viewPosition)
      const position = deltaVector
      const width = maxBound.right - maxBound.left
      const height = maxBound.bottom - maxBound.top
      const fitFactor = Number(sceneElement.getAttribute('data-fit-factor')) || undefined
      return { position, id, width, height, steps: [], fitFactor }
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

  const [sceneIdFromHash, stepIdFromHash] = window.location.hash.substring(1).split('/')
  const currentSceneIndexFromHash = sceneDetails.findIndex(scene => scene.id === sceneIdFromHash)
  const currentStepIndexFromHash = (sceneDetails[currentSceneIndexFromHash] || { steps: [] }).steps.findIndex(step => step.id === stepIdFromHash)

  const currentSceneIndex = currentSceneIndexFromHash === -1 ? 0 : currentSceneIndexFromHash
  const currentSceneStepIndex = currentStepIndexFromHash === -1 ? 0 : currentStepIndexFromHash
  console.log({
    sceneIdFromHash,
    stepIdFromHash,
    currentSceneIndexFromHash,
    currentStepIndexFromHash
  })
  console.log(sceneDetails)
  return { sceneDetails, currentSceneIndex, currentSceneStepIndex, isInTransition: false, isBlackout: false }
}

function loadStepsForScene (sceneElement: HTMLElement) {
  const subSceneSteps = Array.from(sceneElement.querySelectorAll('.scene')).flatMap(subScene => Array.from(subScene.querySelectorAll('.journey-step')))
  const stepsInScene = Array.from(sceneElement.querySelectorAll('.journey-step')).filter(stepEl => !subSceneSteps.includes(stepEl)).map(el => ({ id: el.id }))
  console.log('loaded steps', stepsInScene)
  return stepsInScene
}
