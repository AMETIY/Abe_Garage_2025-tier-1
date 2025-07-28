import React from 'react'

const BannerService = ({page,bg}) => {
  return (
    <section className="page-title page-title2" data-parallax='{"y": 50}' style= {{backgroundImage:`url(${bg})`}}>
    <div className="auto-container">
        <h2>{page}</h2>
        <ul className="page-breadcrumb">
            <li><a href="index.html">home</a></li>
            <li>{page}</li>
        </ul>
    </div>
    <h1 data-parallax='{"x": 200}'>Car Repairing</h1>
</section>
  )
}


export default BannerService