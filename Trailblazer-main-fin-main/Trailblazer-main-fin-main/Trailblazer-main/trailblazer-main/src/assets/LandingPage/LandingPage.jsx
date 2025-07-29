import React from "react";
import Hero from "../../components/Hero";
import Services from "../../components/Services";
import HowItWorks from "../../components/HowItWorks";
import AboutUs from "../../components/AboutUs";

function LandingPage() {
  return (
    <div>
      <Hero />
      <Services />
      <HowItWorks />
      <div id="about-us-section"></div>
      <AboutUs />
      <div id="about-us-section"></div>
    </div>
  );
}

export default LandingPage;
