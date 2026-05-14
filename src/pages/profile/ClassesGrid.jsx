import React from "react";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ClassesGrid = ({ classes = [] }) => {
  const navigate = useNavigate();

  // Ensure classes is always an array
  const classesArray = Array.isArray(classes) 
    ? classes 
    : (classes?.classes && Array.isArray(classes.classes) 
        ? classes.classes 
        : (classes?.data && Array.isArray(classes.data) 
            ? classes.data 
            : []));

  if (!classesArray || classesArray.length === 0) {
    return (
      <div className="no-post-yet">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 7v14"></path>
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
        </svg>
        <h3>No classes to show</h3>
        <p>This user hasn't added any classes yet.</p>
      </div>
    );
  }

  return (
    <div className="myclub-card-main">
      <Row>
        {classesArray.map((classItem) => (
          <Col key={classItem.id} md={6} lg={6}>
            <div
              className="myclub-card"
              onClick={() => navigate(`/classes/${classItem.id}`)}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="myclub-avatar"
                  style={{
                    backgroundColor: classItem.color || "#6c757d",
                  }}
                >
                  {classItem.class_name?.[0]?.toUpperCase() || "C"}
                </div>
                <div className="myclub-name">
                  <h3>{classItem.class_name}</h3>
                  <div className="d-flex align-items-center myclub-tags">
                    {classItem.class_code && (
                      <span>{classItem.class_code}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ClassesGrid;
