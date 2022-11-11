import React, { ReactElement } from "react";
import { useJourneyState } from "../Journey/JourneyContext";


export const PerSceneBackgrounds: React.FunctionComponent<{ default: ReactElement<any, any>; sceneOverrides: Record<string, ReactElement<any, any>>; }> = (props) => {
  const journeyState = useJourneyState();
  const current = journeyState.currentScene?.id;
  if (current !== undefined) {
    const matchingBackground = props.sceneOverrides[current];
    if (matchingBackground !== undefined) {
      return matchingBackground;
    }
  }
  return props.default;
};
