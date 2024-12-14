import React from "react";
import LocationPage from "../components/LocationPage";
import { MapPin, Clock, Compass } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    color: ["#42a5f5", "#478ed1"],
    title: "Curated SF Attractions",
    description:
      "Visit the city's most iconic locations like Chinatown, Pier 39, and more.",
  },
  {
    icon: Compass,
    color: ["#66bb6a", "#43a047"],
    title: "Smart Route Planning",
    description: "Our algorithm finds the most efficient route for your time.",
  },
  {
    icon: Clock,
    color: ["#ab47bc", "#8e24aa"],
    title: "Flexible Travel Options",
    description:
      "Choose driving, walking, or public transit based on preferences.",
  },
];

const SanFranciscoPage = () => (
  <LocationPage
    city="san_francisco"
    transportModes={["driving", "walking", "transit"]}
    title="San Francisco Tour Planner"
    subtitle="Let us plan your perfect day touring San Francisco's top attractions"
    features={FEATURES}
    navigationLink="/explore/seoul"
    navigationButtonText="Visit Seoul Instead"
  />
);

export default SanFranciscoPage;
