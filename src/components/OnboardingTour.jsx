import React, { useEffect, useMemo, useState } from "react";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import {
  ONBOARDING_STORAGE_KEY,
  TOUR_TARGETS,
} from "../constants/onboardingTargets";

const OnboardingTour = ({ forceRun = false }) => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(
    () => [
      {
        target: `.${TOUR_TARGETS.WELCOME_SECTION}`,
        content:
          "Welcome! This is the main part of our platform. You will find all updates here.",
        disableBeacon: true,
        placement: "bottom",
      },
      {
        target: `.${TOUR_TARGETS.SEARCH_BAR}`,
        content: "From here you can search for anything you need.",
        placement: "bottom",
      },
      {
        target: `.${TOUR_TARGETS.ACTION_BUTTON}`,
        content: "Click this button to start a new project.",
        placement: "bottom",
      },
    ],
    []
  );

  useEffect(() => {
    const hasSeenTour =
      localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";

    if (forceRun || !hasSeenTour) {
      setStepIndex(0);
      setRunTour(true);
    }
  }, [forceRun]);

  const handleTourCallback = ({ action, index, status, type }) => {
    if (type === EVENTS.TARGET_NOT_FOUND) {
      const direction = action === ACTIONS.PREV ? -1 : 1;
      setStepIndex((current) => Math.max(0, current + direction));
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      const direction = action === ACTIONS.PREV ? -1 : 1;
      setStepIndex(index + direction);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
      setRunTour(false);
      setStepIndex(0);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      scrollToFirstStep={true}
      disableOverlayClose={false}
      spotlightClicks={true}
      callback={handleTourCallback}
      styles={{
        options: {
          primaryColor: "var(--primary)",
          textColor: "var(--text-default)",
          backgroundColor: "var(--secondary)",
          arrowColor: "var(--secondary)",
          overlayColor: "rgba(0, 0, 0, 0.35)",
          zIndex: 10000,
        },
        buttonBack: {
          color: "var(--text-muted)",
        },
        buttonSkip: {
          color: "var(--text-muted)",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip",
      }}
    />
  );
};

export default OnboardingTour;
