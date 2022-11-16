import React, { Fragment, ReactElement, useEffect, useLayoutEffect, useReducer } from 'react';
import { GradientBackground } from '../Backgrounds/GradientBackground';
import { neg, px } from '../Scene';
import { denormaliseJourneyState } from './denormaliseJourneyState';
import { grayGradientBackgroundRenderer } from './grayGradientBackgroundRenderer';
import { JourneyStateContext } from './JourneyContext';
import { JourneyState } from './JourneyState';
import { loadJourneyStateFromDom, vectorSubtract } from './loadJourneyStateFromDom';
import { NormalisedJourneyState } from './NormalisedJourneyState';
import { reducer } from './reducer';
import { SceneDetails } from './SceneDetails';

function getDefaultJourneyState(): NormalisedJourneyState {
  return {
    sceneDetails: [],
    currentSceneIndex: -1,
    currentSceneStepIndex: -1,
    isInTransition: false,
    isBlackout: false,
    isOverview: false
  }
}

const defaultFitFactor = Number(new URLSearchParams(window.location.search).get('fitFactor')) || 0.85
function getRequiredScaleAdjustment(currentScene?: SceneDetails): number | undefined {
  if (!currentScene) {
    console.log('no scene no scale')
    return undefined
  }
  const {frame} = currentScene
  const fitFactor = frame.fitFactor || defaultFitFactor
  const actualWidth = frame.width
  const clientWidth = window.innerWidth
  const targetWidth = fitFactor * clientWidth
  const widthBasedScalingFactor = targetWidth / actualWidth

  const actualHeight = frame.height
  const clientHeight = window.innerHeight
  const targetHeight = fitFactor * clientHeight
  const heightBasedScalingFactor = targetHeight / actualHeight

  const requiredScalingFactor = Math.min(widthBasedScalingFactor, heightBasedScalingFactor)
  console.log(`${currentScene.id} bounding width: ${actualWidth}, clientWidth: ${clientWidth}, scaling: ${requiredScalingFactor}`)
  return requiredScalingFactor
}

export type WithJourneyState = { journeyState: JourneyState }
type JourneyStateRecipient<CustomPropsT> = React.FC<CustomPropsT & WithJourneyState>
type ReturnedJourney<CustomPropsT> = React.FC<CustomPropsT>

export const MakeJourney = function MakeJourney<CustomPropsT>(innerJourney: JourneyStateRecipient<CustomPropsT>, backGroundRenderer: JourneyStateRecipient<CustomPropsT> | ReactElement<any, any> = <GradientBackground/>): ReturnedJourney<CustomPropsT> {
  return function YourJourney(customProps: CustomPropsT) {
    const [normalisedJourneyState, dispatch] = useReducer(reducer, getDefaultJourneyState())

    useLayoutEffect(() => dispatch({ type: 'replace', newState: loadJourneyStateFromDom() }), [])

    useEffect(() => {
      const handler = (ev: KeyboardEvent) => {
        ev.preventDefault()
        switch (ev.key) {
          case 'ArrowLeft':
          case 'PageUp':
          case 'ArrowUp':
            dispatch({type: 'retard'} as const)
            break;
          case 'b':
            dispatch({type: 'toggle-blackout'} as const)
            break;
          case 'o':
            dispatch({type: 'toggle-overview'} as const)
            break;
        
          default:
            dispatch({type: 'advance'})
        }
      }
      document.addEventListener('keydown', handler, false)
      return () => {
        document.removeEventListener('keydown', handler, false)
      }
    }, [])

    const journeyState = denormaliseJourneyState(normalisedJourneyState)

    // Represent progress in the url
    useEffect(() => {
      if(journeyState.allScenes.length === 0){
        return
      }
      const scene = journeyState.currentScene
      const hash = `${scene && scene.id}${journeyState.currentStep ? '/' + journeyState.currentStep.id : ''}`
      console.log('setting window hash to', hash)
      window.location.hash = hash
    }, [journeyState.currentScene, journeyState.currentStep])

    // todo: Find a better way to support totalOverview mode. Currently the position is being conditionally set inside denormalise, where as scale is done here in an ugly ternary
    const currentPosition = journeyState.currentPosition
    const scaleAdjustment = getRequiredScaleAdjustment((journeyState.isOverview && normalisedJourneyState.totalOverview) ? ({frame: normalisedJourneyState.totalOverview!, steps: [], id: '(total-overview)'}) : journeyState.currentScene)
    const scaleTransform = scaleAdjustment ? ` scale(${scaleAdjustment}, ${scaleAdjustment})` : ''
    const translationTransform = `translate(${px(neg(currentPosition.x))}, ${px(neg(currentPosition.y))})`
    const transform = scaleTransform + translationTransform
    console.log('transform:', transform)
    const sceneViewStyle: React.CSSProperties = { transformOrigin: '0 0', position: 'fixed', top: '50%', left: '50%', transform, transition: 'transform ease 1s', willChange: 'transform' }

    const onTransitionEnd = () => {
      dispatch({ type: 'slideTransitionComplete' })
    }

    const combinedState = { ...customProps, journeyState }

    return (<Fragment>
      <JourneyStateContext.Provider value={journeyState}>
        <div className='background-holder' style={{ position: 'absolute', transform: 'translateZ(0)', top: '0', left: '0', bottom: '0', right: '0', overflow: 'hidden' }}>
          {'type' in backGroundRenderer ? backGroundRenderer : backGroundRenderer(combinedState)}
        </div>
        <div className='journey' style={{ overflow: 'hidden', width: '100vw', height: '100vh' }} onClick={describePosition(scaleAdjustment)}>
          <div className='scene-view' style={sceneViewStyle} onTransitionEnd={onTransitionEnd}>
              {innerJourney(combinedState)}
          </div>
        </div>
        {
          journeyState.isBlackout ? (<div className='black-out' style={{ position: 'absolute', top: '0', left: '0', bottom: '0', right: '0', overflow: 'hidden', backgroundColor: 'black'}}></div>) : null
        }
        </JourneyStateContext.Provider>
    </Fragment>)
  }
}

function describePosition(scaleAdjustment: number = 1) {
  return (ev: React.MouseEvent) => {
    const clickPosition = { x: ev.clientX, y: ev.clientY }

    const allScenes = Array.from(document.querySelectorAll('.scene, .journey'))
    const scenesContainingClick = allScenes.filter(scene => {
      const bounding = scene.getBoundingClientRect()
      return clickPosition.x >= bounding.left &&
        clickPosition.x <= bounding.right &&
        clickPosition.y >= bounding.top &&
        clickPosition.y <= bounding.bottom
    })

    const relativePositions = scenesContainingClick.map(scene => {
      const scenePosition = scene.getBoundingClientRect()
      const relativePositionToScene = vectorSubtract(clickPosition, scenePosition)
      return { id: scene.id, position: relativePositionToScene }
    })

    console.log('scale adjustment:', scaleAdjustment)
    console.log('scenes containing click:', relativePositions.map(pos => `${pos.id}: (${pos.position.x / scaleAdjustment}, ${pos.position.y / scaleAdjustment})`))
  }
}

type Vec = { x: number, y: number }