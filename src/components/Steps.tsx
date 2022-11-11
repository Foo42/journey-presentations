import React, { CSSProperties, PropsWithChildren } from 'react';
import { useId } from "react"
import { useJourneyState } from '../library';

// const hideWhileFuture = (id: string): React.CSSProperties => props.journeyState.isFuture(id) ? {transition: 'opacity ease 1s', opacity: 0} : {transition: 'opacity easy 1s'}
type HiddenStepProps = {
  id?: string,
  style?: CSSProperties
  styleWhileFuture?: CSSProperties
}

export const HiddenStep: React.FunctionComponent<PropsWithChildren<HiddenStepProps>> = (props) => {
  const journeyState = useJourneyState()
  const id = props.id ?? `step-${useId()}`
  const isFuture = journeyState.isFuture(id)
  const hiddenStyle = {opacity: 0, ...(props.styleWhileFuture ?? {})}
  const conditionalStyle: CSSProperties = isFuture ? hiddenStyle : {}
  const style: CSSProperties = {transition: 'opacity ease 1s', ...(props.style ?? {}), ...conditionalStyle}

  return (
    <div id={id} style={style} className='journey-step'>
      {props.children}
    </div>
  )
}