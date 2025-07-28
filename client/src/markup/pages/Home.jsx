import React from "react";
import About from "../components/about/About";
import Service from "../components/services/Service";
import WhyChooseUs from "../components/whychooseus/WhyChooseUs";
import BottomBanner from "../components/BottomBanner/BottomBanner";
import Features from "../components/features/Features";
import Schedule from "../components/features/Schedule";
import Banner from "../components/Banner/Banner";

function Home() {
  return (
    <div>
      <div className="page-wrapper">
        <Banner />

        <About />

        <Service />

        <Features />
        
        <WhyChooseUs />

        <BottomBanner />

        <Schedule />
      </div>
    </div>
  );
}

export default Home;
