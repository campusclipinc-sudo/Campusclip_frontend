import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../scss/JoinClassSuccessModal.scss';

/**
 * Success modal displayed after successfully joining a class
 * @param {boolean} show - Whether to show the modal
 * @param {function} onHide - Function to close the modal
 * @param {object} classData - Class information (class_name, students_count, assignments_count)
 */
const JoinClassSuccessModal = ({ show, onHide, classData }) => {
  // Ensure classData is an object, even if null/undefined is passed
  const safeClassData = classData || {};

  const {
    class_name = 'the class',
    students_count = 0,
    assignments_count = 0,
  } = safeClassData;

  // Calculate other students (total - 1 for current user)
  const otherStudents = students_count > 0 ? students_count - 1 : 0;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="join-success-modal"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="join-success-modal-body">
        {/* Success Icon */}
        <div className="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>

        {/* Title */}
        <h3 className="success-title">Successfully Joined!</h3>

        {/* Message */}
        <p className="success-message">
          Welcome to <strong>{class_name}</strong>! You've joined{' '}
          {otherStudents === 0
            ? 'this class'
            : otherStudents === 1
            ? '1 other student'
            : `${otherStudents} other students`}{' '}
          in this class.
        </p>

        {/* Assignment Sync Info */}
        {assignments_count > 0 && (
          <div className="assignment-sync-box">
            <div className="sync-header">
              <span className="sync-icon">📊</span>
              <strong>Assignment Sync Complete</strong>
            </div>
            <div className="sync-details">
              <div className="sync-item">
                <span className="sync-emoji">🎯</span>
                <span>
                  {assignments_count} assignment{assignments_count !== 1 ? 's' : ''} have been
                  added to your dashboard!
                </span>
              </div>
              <p className="sync-note">
                Check your Dashboard to see all assignments with due dates!
              </p>
            </div>
          </div>
        )}

        {/* Got It Button */}
        <Button variant="success" className="got-it-btn" onClick={onHide}>
          Got It!
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default JoinClassSuccessModal;
