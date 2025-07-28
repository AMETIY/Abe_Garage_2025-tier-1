import React from 'react'
import banner1 from "../../assets/images/custom/banner/banner1.jpg"
import BannerService from '../components/BannerService/BannerService'
import Service from '../components/services/Service'
import WhyChooseUs from '../components/whychooseus/WhyChooseUs'
import BottomBanner from '../components/BottomBanner/BottomBanner'
import Features from '../components/features/Features'
import Schedule from '../components/features/Schedule'

const Services = () => {
  return (
<div className="page-wrapper">
        <BannerService page="Our Services" bg = {banner1} />
        <Service />
        <WhyChooseUs />
        <BottomBanner />
        <Schedule />
        </div>
  )
}

export default Services