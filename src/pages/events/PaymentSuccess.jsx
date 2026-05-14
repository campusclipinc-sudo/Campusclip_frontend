import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import DashboardLayout from "../../component/DashboardLayout";
import { useQueryClient } from "@tanstack/react-query";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const queryClient = useQueryClient();

  useEffect(() => {
    // The webhook will handle marking attendance as completed
    // Wait a moment for webhook to process, then invalidate queries
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["event-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }, 2000); // Wait 2 seconds for webhook to process

    return () => clearTimeout(timer);
  }, [queryClient]);

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
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="8 12 11 15 16 10"></polyline>
              </svg>
            </div>

            <h2 className="mb-3">Payment Successful!</h2>
            <p className="text-muted mb-4">
              Your payment has been processed successfully. You are now registered for the event!
            </p>

            {sessionId && (
              <p className="text-muted small mb-4">
                Session ID: <code>{sessionId}</code>
              </p>
            )}

            <div className="d-flex gap-2 justify-content-center">
              <Button variant="btns" onClick={() => navigate("/feed")}>
                Go to Feed
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentSuccess;
