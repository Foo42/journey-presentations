import React, { createElement, CSSProperties, PropsWithChildren } from 'react';
import { useId } from "react"
import { useJourneyState } from '../library';

// const hideWhileFuture = (id: string): React.CSSProperties => props.journeyState.isFuture(id) ? {transition: 'opacity ease 1s', opacity: 0} : {transition: 'opacity easy 1s'}
type HiddenStepProps = {
  id?: string,
  displayWith?: string,
  hideWhenPast?: boolean,
  style?: CSSProperties
  styleWhileFuture?: CSSProperties
  wrapper?: 'div' | 'li' | 'span'
}

export const HiddenStep: React.FunctionComponent<PropsWithChildren<HiddenStepProps>> = (props) => {
  const journeyState = useJourneyState()
  const id = props.id ?? `step-${useId()}`
  const isFuture = journeyState.isFuture(props.displayWith ?? id)
  const hiddenStyle = {opacity: 0, ...(props.styleWhileFuture ?? {})}
  const isHidden = isFuture || (props.hideWhenPast && journeyState.isPast(props.displayWith ?? id))
  const conditionalStyle: CSSProperties = isHidden ? hiddenStyle : {}
  const style: CSSProperties = {transition: 'opacity ease 1s', ...(props.style ?? {}), ...conditionalStyle}

  // We don't want to be a click-stop if we are piggybacking off another step being revealed
  const classNameMixin = props.displayWith === undefined ? {className: 'journey-step'} : {}

  return createElement(props.wrapper ?? 'div', {style, ...classNameMixin, id, children: props.children})
}
