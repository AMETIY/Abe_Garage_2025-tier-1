import React, { useState } from "react";
import carImage from "../../../assets/images/custom/why.jpg";

function WhyChooseUs() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      id: 1,
      icon: "🔧",
      title: "Certified Expert Mechanics",
      description:
        "Professional certified technicians with years of experience",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#667eea",
    },
    {
      id: 2,
      icon: "⚡",
      title: "Fast And Quality Service",
      description: "Quick turnaround without compromising on quality",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "#f093fb",
    },
    {
      id: 3,
      icon: "💰",
      title: "Best Prices in Town",
      description: "Competitive pricing with transparent cost breakdown",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      color: "#4facfe",
    },
    {
      id: 4,
      icon: "🏆",
      title: "Awarded Workshop",
      description: "Industry recognized excellence in automotive service",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      color: "#43e97b",
    },
  ];

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "100px 0",
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "200px",
          height: "200px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          animation: "float 6s ease-in-out infinite",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "150px",
          height: "150px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "50%",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      ></div>

      <div className="auto-container">
        <div className="row">
          <div className="col-lg-6">
            <div style={{ padding: "20px" }}>
              {/* Modern Badge */}
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "50px",
                  padding: "8px 20px",
                  marginBottom: "20px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "300",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                ✨ Why Choose Us
              </div>

              {/* Enhanced Title */}
              <h2
                style={{
                  fontSize: "48px",
                  fontWeight: "200",
                  color: "white",
                  marginBottom: "20px",
                  lineHeight: "1.2",
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                Your Trusted <br />
                <span
                  style={{
                    background: "linear-gradient(45deg, #E74C3C, #F39C12)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Auto Service Partner
                </span>
              </h2>

              {/* Enhanced Description */}
              <div
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "18px",
                  lineHeight: "1.6",
                  marginBottom: "40px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                Bring to the table win-win survival strategies to ensure
                proactive domination. At the end of the day, going forward, a
                new normal that has evolved from generation heading towards
                excellence.
              </div>

              {/* Modern Features Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    onMouseEnter={() => setHoveredCard(feature.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background:
                        hoveredCard === feature.id
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(15px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "20px",
                      padding: "25px",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform:
                        hoveredCard === feature.id
                          ? "translateY(-5px) scale(1.02)"
                          : "translateY(0) scale(1)",
                      boxShadow:
                        hoveredCard === feature.id
                          ? "0 20px 40px rgba(0,0,0,0.3)"
                          : "0 10px 30px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* Animated Icon */}
                    <div
                      style={{
                        fontSize: "40px",
                        marginBottom: "15px",
                        transform:
                          hoveredCard === feature.id
                            ? "scale(1.2) rotate(10deg)"
                            : "scale(1) rotate(0deg)",
                        transition: "all 0.3s ease",
                        filter:
                          hoveredCard === feature.id
                            ? "drop-shadow(0 5px 15px rgba(0,0,0,0.3))"
                            : "none",
                      }}
                    >
                      {feature.icon}
                    </div>

                    {/* Content */}
                    <h4
                      style={{
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "300",
                        marginBottom: "10px",
                        textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        margin: "0",
                      }}
                    >
                      {feature.description}
                    </p>

                    {/* Hover Effect Border */}
                    {hoveredCard === feature.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0",
                          left: "0",
                          right: "0",
                          bottom: "0",
                          background: feature.gradient,
                          borderRadius: "20px",
                          opacity: "0.1",
                          zIndex: "-1",
                        }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div style={{ padding: "20px" }}>
              {/* Modern Services Badge */}
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "50px",
                  padding: "8px 20px",
                  marginBottom: "20px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "300",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                🔧 Our Services
              </div>

              {/* Enhanced Services Title */}
              <h2
                style={{
                  fontSize: "42px",
                  fontWeight: "200",
                  color: "white",
                  marginBottom: "30px",
                  lineHeight: "1.2",
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(45deg, #E74C3C, #F39C12)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Additional Services
                </span>
              </h2>

              {/* Modern Services Layout */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "30px",
                }}
              >
                {/* Enhanced Image Section */}
                <div
                  style={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  }}
                >
                  <img
                    src={carImage}
                    alt="Professional Auto Service"
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                      filter: "brightness(0.8)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      right: "0",
                      bottom: "0",
                      background:
                        "linear-gradient(45deg, rgba(44, 62, 80, 0.9), rgba(52, 73, 94, 0.9))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "60px",
                        marginBottom: "10px",
                        animation: "bounce 2s infinite",
                      }}
                    >
                      🚗
                    </div>
                    <span
                      style={{
                        color: "white",
                        fontSize: "24px",
                        fontWeight: "300",
                        textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                      }}
                    >
                      Professional Service
                    </span>
                  </div>
                </div>

                {/* Modern Services Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  {[
                    "General Auto Repair & Maintenance",
                    "Transmission Repair & Replacement",
                    "Tire Repair and Replacement",
                    "State Emissions Inspection",
                    "Brake Job / Brake Services",
                    "Electrical Diagnostics",
                    "Fuel System Repairs",
                    "Starting and Charging Repair",
                    "Steering and Suspension Work",
                    "Emission Repair Facility",
                    "Wheel Alignment",
                    "Computer Diagnostic Testing",
                  ].map((service, index) => (
                    <div
                      key={index}
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "15px",
                        padding: "15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateX(5px)";
                        e.target.style.background = "rgba(255,255,255,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateX(0)";
                        e.target.style.background = "rgba(255,255,255,0.15)";
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(45deg, #43e97b, #38f9d7)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                      >
                        ✓
                      </div>
                      <span
                        style={{
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "300",
                        }}
                      >
                        {service}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .services-grid {
            grid-template-columns: 1fr !important;
          }
          h2 {
            font-size: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default WhyChooseUs;
