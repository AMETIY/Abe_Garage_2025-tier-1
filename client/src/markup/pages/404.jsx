import React from 'react'

function FourO4() {
  return (
    <section className="services-section">
    <div className="auto-container text-center py-5">
      <div className="sec-title style-two">
        <h2 className="text-danger">Page Not Found</h2>
        <p className="text-muted">
          We couldn’t find your page 
        </p>
      </div>
      <div className="mt-4">
        {/* <img
          src="/images/not-found-illustration.svg" // Replace with your image path
          alt="Order Not Found"
          style={{ maxWidth: '300px', marginBottom: '20px' }}
        /> */}
        <div>
          <a href="/" className="btn btn-primary">
            Back to home
          </a>
        </div>
      </div>
    </div>
  </section>
  )
}

export default FourO4