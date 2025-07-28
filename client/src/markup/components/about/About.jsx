import React from "react";
import im2 from "../../../assets/images/custom/misc/vban1.jpg";
import im3 from "../../../assets/images/custom/misc/vban2.jpg";

function About() {
  return (
    <section className="modern-about-section">
      <div className="auto-container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="modern-image-collage">
              <div className="image-grid">
                <div className="main-image">
                  <img
                    src={im2}
                    alt="Automotive Service"
                    className="primary-img"
                  />
                </div>
                <div className="secondary-images">
                  <div className="top-image">
                    <img
                      src={im3}
                      alt="Engine Parts"
                      className="secondary-img"
                    />
                  </div>
                  <div className="bottom-image">
                    <img
                      src={im2}
                      alt="Car Maintenance"
                      className="secondary-img"
                    />
                  </div>
                </div>
              </div>
              <div className="experience-badge">
                <div className="badge-number">33</div>
                <div className="badge-text">
                  <span className="years">YEARS</span>
                  <span className="experience">EXPERIENCE</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="modern-about-content">
              <div className="section-intro">
                <span className="intro-text">Welcome to our workshop</span>
              </div>
              <h2 className="about-title">We have 33 years experience</h2>
              <div className="about-description">
                <p>
                  At Abe Garage, we pride ourselves on offering a comprehensive
                  range of automotive services designed to keep your vehicle
                  running smoothly and safely. From routine auto repair and
                  maintenance to more complex diagnostic work and part
                  replacement, our experienced technicians are equipped to
                  handle all your vehicle's needs. We understand the importance
                  of keeping your car in peak condition, which is why we offer
                  state emissions inspections, tire repair and replacement,
                  brake services, and wheel alignments. Our commitment to
                  quality and safety ensures that every service we provide meets
                  the highest standards, giving you peace of mind on the road.
                </p>

                <p>
                  Our expertise extends beyond standard repair services. We
                  specialize in electrical diagnostics, fuel system repairs, and
                  starting and charging repairs, ensuring that every aspect of
                  your vehicle is thoroughly checked and maintained. At Abe
                  Garage, we also offer steering and suspension work, emission
                  repairs, and computer diagnostic testing, making us your
                  one-stop shop for all automotive needs. Our state-of-the-art
                  facility and skilled team are dedicated to providing
                  exceptional service, making sure your vehicle receives the
                  best care possible. Whether you're in for a routine check-up
                  or a more involved repair, you can trust Abe Garage to deliver
                  reliable and efficient service every time.
                </p>
              </div>
              <div className="about-button">
                <a href="/about" className="modern-about-btn">
                  <span>ABOUT US</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
