import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TrackOrderModal({ modalId }) {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      // Close the modal manually using Bootstrap's modal API
    //   const modalEl = document.getElementById(modalId);
    //   const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
    //   modalInstance?.hide();
  
      // Then navigate
    //   navigate(`/admin/order/${orderId}`);
    window.location.href = `/admin/order/${orderId}`;
    }
  };
  

  const handleClose = () => {
    setOrderId('');
  };

  return (
    <div className="modal fade" id={modalId} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
  <div
    className="modal-header"
    style={{ color: 'white', borderBottom: 'none' }}
  >
    <h5 className="modal-title">Track Your Order</h5>
    <button
      type="button"
      className="btn-close btn-close-white"
      data-bs-dismiss="modal"
      aria-label="Close"
      onClick={handleClose}
    ></button>
  </div>

  <div className="modal-body">
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Enter your Order hash"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        required
        style={{ borderColor: '#08194a' }}
      />
      <button
        type="submit"
        className="btn w-100"
        style={{ backgroundColor: '#08194a', color: 'white' }}
      >
        Track Order
      </button>
    </form>
  </div>
</div>

      </div>
    </div>
  );
}

export default TrackOrderModal;
