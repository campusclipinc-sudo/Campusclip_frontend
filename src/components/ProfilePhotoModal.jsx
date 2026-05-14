import React from "react";
import { Modal } from "react-bootstrap";
import "../scss/profile-photo-modal.scss";

const ProfilePhotoModal = ({ show, onHide, imageUrl, userName }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="profile-photo-modal"
      keyboard={true}
      backdrop={true}
    >
      <Modal.Body className="p-0 position-relative" onClick={onHide}>
        <div className="profile-photo-container" onClick={(e) => e.stopPropagation()}>
          {imageUrl ? (
            <img src={imageUrl} alt={userName} className="profile-photo" />
          ) : (
            <div className="profile-photo-placeholder">
              {(userName || "U").charAt(0)}
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProfilePhotoModal;
