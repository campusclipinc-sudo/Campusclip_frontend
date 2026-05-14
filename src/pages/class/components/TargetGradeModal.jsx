import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import "../../../scss/targetGradeModal.scss";

const TargetGradeModal = ({ show, onHide, currentTargetGrade, onSave }) => {
    const [targetGrade, setTargetGrade] = useState("");

    useEffect(() => {
        if (show) {
            setTargetGrade(currentTargetGrade || "");
        }
    }, [show, currentTargetGrade]);

    const handleSave = () => {
        const grade = targetGrade.trim() === "" ? null : Number(targetGrade);

        // Validate grade if provided
        if (grade !== null && (isNaN(grade) || grade < 0 || grade > 100)) {
            return;
        }

        onSave(grade);
        onHide();
    };

    const handleCancel = () => {
        setTargetGrade(currentTargetGrade || "");
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={handleCancel}
            centered
            className="target-grade-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target w-5 h-5 text-blue-600" data-filename="components/classes/EditTargetGradeModal" data-linenumber="86" data-visual-selector-id="components/classes/EditTargetGradeModal86" data-source-location="components/classes/EditTargetGradeModal:86:12" data-dynamic-content="false"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    Set Your Target Grade
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-group">
                    <Form.Label>Target Grade (%)</Form.Label>
                    <input type="number"
                        min="0"
                        max="100"
                        value={targetGrade}
                        onChange={(e) => setTargetGrade(e.target.value)}
                        placeholder="95" />

                    <Form.Text className="">
                        Set your personal target grade for this class (0-100%). Leave blank to
                        remove target.
                    </Form.Text>
                </div>
                <div className="d-flex justify-content-end gap-3 mt-4">
                    <button
                        type="button"
                        className="btn btn-light"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                    >
                        Save Target
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default TargetGradeModal;
