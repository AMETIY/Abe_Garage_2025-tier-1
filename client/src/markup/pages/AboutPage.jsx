import React from 'react'
import BannerService from '../components/BannerService/BannerService'
import banner1 from "../../assets/images/custom/banner/banner1.jpg"
import AboutTwo from '../components/aboutTwo/AboutTwo'
import About from '../components/about/About'
import WhyChooseUs from '../components/whychooseus/WhyChooseUs'
import BottomBanner from '../components/BottomBanner/BottomBanner'
import Schedule from '../components/features/Schedule'
const AboutPage = () => {
  return (
    <>
    <BannerService page="About Us" bg={banner1}/>
    <AboutTwo />
    <About />
    <WhyChooseUs />
    <BottomBanner />
    <Schedule />
    </>
  )
}

export default AboutPage