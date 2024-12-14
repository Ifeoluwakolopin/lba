import React from "react";
import LocationPage from "../components/LocationPage";
import { MapPin, Clock, Compass } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    color: ["#42a5f5", "#478ed1"],
    title: "Explore Seoul's Highlights",
    description:
      "Discover Seoul's top attractions like Namsan Tower, COEX, and more.",
  },
  {
    icon: Compass,
    color: ["#66bb6a", "#43a047"],
    title: "Efficient Public Transit Planning",
    description: "Navigate Seoul effortlessly with optimized transit routes.",
  },
  {
    icon: Clock,
    color: ["#ab47bc", "#8e24aa"],
    title: "Tailored for Transit",
    description: "Plan your day using Seoul's world-class transit system.",
  },
];

const SeoulPage = () => (
  <LocationPage
    city="seoul"
    transportModes={["transit"]}
    title="Seoul Tour Planner"
    subtitle="Let us plan your perfect day touring Seoul's top attractions"
    features={FEATURES}
    navigationLink="/explore/san_francisco"
    navigationButtonText="Visit San Francisco Instead"
  />
);

export default SeoulPage;
