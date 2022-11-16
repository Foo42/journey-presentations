import { NormalisedJourneyState } from './NormalisedJourneyState'
import { ProxySceneDetails, SceneDetails, Frame } from './SceneDetails'

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
  console.log(`found ${proxyElements.length} proxies`)
  console.log(`found ${allSceneElements.length} scene elements`)

  const sceneAndProxyDetails: (SceneDetails | ProxySceneDetails)[] = allSceneElements.map(sceneElement => {
    const id = sceneElement.id
    if (proxyElements.includes(sceneElement)) {
      return { id, proxyFor: sceneElement.getAttribute('data-proxy-for') || 'BAD' }
    }
    const frameAround = sceneElement.getAttribute('data-frame-around')
    const framedElements = frameAround === null ? [sceneElement] : frameAround.split(',').map(id => id.trim()).flatMap(sel => [...document.querySelectorAll(sel)])
    if(framedElements .length === 0){
      throw new Error(`No elements match data-frame-around = "${frameAround}" for frame-scene: ${id}`)
    }
    const fitFactor = Number(sceneElement.getAttribute('data-fit-factor')) || undefined
    const frame = {...frameAroundElements(framedElements, viewPosition), fitFactor}
    const stepsInScene = loadStepsForScene(sceneElement)
    return { id, steps: stepsInScene, frame }
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
  const totalOverview = frameAroundElements([...document.querySelectorAll('.scene')], viewPosition)
  return { sceneDetails, currentSceneIndex, currentSceneStepIndex, isInTransition: false, isBlackout: false, totalOverview, isOverview: false }
}

function frameAroundElements(framedElements: Element[], viewPosition: Vector2): Frame {
  const boundingRects = framedElements.map(el => el.getBoundingClientRect()).map(({ height, width, x, y }) => ({ top: y, left: x, bottom: y + height, right: x + width }))
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
  return { position, width, height }
}

function loadStepsForScene (sceneElement: HTMLElement) {
  const subSceneSteps = Array.from(sceneElement.querySelectorAll('.scene')).flatMap(subScene => Array.from(subScene.querySelectorAll('.journey-step')))
  const stepsInScene = Array.from(sceneElement.querySelectorAll('.journey-step')).filter(stepEl => !subSceneSteps.includes(stepEl)).map(el => ({ id: el.id }))
  console.log('loaded steps', stepsInScene)
  return stepsInScene
}
