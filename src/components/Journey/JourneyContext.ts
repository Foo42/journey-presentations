import React, { useContext } from "react";
import { denormaliseJourneyState } from "./denormaliseJourneyState";
import { JourneyState } from "./JourneyState";
import { defaultNormalisedJourneyState } from "./NormalisedJourneyState";

export const JourneyStateContext = React.createContext<JourneyState>(denormaliseJourneyState(defaultNormalisedJourneyState()))

export function useJourneyState(): JourneyState {
  return useContext(JourneyStateContext)
}