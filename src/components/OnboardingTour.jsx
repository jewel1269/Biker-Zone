import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";

const OnboardingTour = () => {
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: ".welcome-section",
      content:
        "Welcome! This is the main part of our platform. You will find all updates here.",
      disableBeacon: true,
    },
    {
      target: ".search-bar",
      content: "From here you can search for anything you need.",
    },
    {
      target: ".action-button",
      content: "Click this button to start a new project!",
    },
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");

    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const handleTourCallback = (data) => {
    const { status } = data;

    if (status === "finished" || status === "skipped") {
      localStorage.setItem("hasSeenTour", "true");
      setRunTour(false);
    }
  };

  return (
    <div>
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleTourCallback}
        styles={{
          options: {
            primaryColor: "var(--primary)",
          },
        }}
      />
    </div>
  );
};

export default OnboardingTour;
