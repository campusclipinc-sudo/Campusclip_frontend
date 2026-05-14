import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import DashboardLayout from "../../component/DashboardLayout";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event_id");

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Card className="shadow-sm text-center" style={{ maxWidth: "500px" }}>
          <Card.Body className="p-5">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" x2="9" y1="9" y2="15"></line>
                <line x1="9" x2="15" y1="9" y2="15"></line>
              </svg>
            </div>

            <h2 className="mb-3">Payment Cancelled</h2>
            <p className="text-muted mb-4">
              Your payment was cancelled. You have not been charged and your registration was not completed.
            </p>

            <p className="text-muted mb-4">
              You can try again anytime to register for this event.
            </p>

            <div className="d-flex gap-2 justify-content-center">
              <Button variant="btns" onClick={() => navigate("/feed")}>
                Go to Feed
              </Button>
              {eventId && (
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  Return to Event
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCancel;
