import React from "react";
import { Modal, Button, Spinner, ListGroup, Badge } from "react-bootstrap";
import {
  useListClubRequests,
  useActionClubRequest,
} from "../../hooks/useRQClubRequest";
import { useQueryClient } from "@tanstack/react-query";

const ClubRequestsModal = ({ show, onHide, clubId, clubName }) => {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useListClubRequests({
    club_id: clubId,
    status: "pending",
  });
  const { mutate: act, isPending } = useActionClubRequest(() => {
    qc.invalidateQueries({ queryKey: ["club-requests"] });
    refetch();
  });

  const requests = Array.isArray(data?.data) ? data.data : [];

  return (
    <Modal
      show={show}
      onHide={onHide}
      className="manage-club"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <h3>
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
            className="lucide lucide-user-plus w-5 h-5"
            data-filename="components/clubs/JoinRequestsModal"
            data-linenumber="87"
            data-visual-selector-id="components/clubs/JoinRequestsModal87"
            data-source-location="components/clubs/JoinRequestsModal:87:12"
            data-dynamic-content="false"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" x2="19" y1="8" y2="14"></line>
            <line x1="22" x2="16" y1="11" y2="11"></line>
          </svg>{" "}
          Club Join Requests
        </h3>
        <div className="mb-3">
          Accept or decline requests to join {clubName}.
        </div>
        {isLoading ? (
          <div className="d-flex align-items-center gap-2">
            <Spinner size="sm" /> Loading...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-3">No pending join requests.</div>
        ) : (
          <ListGroup variant="flush">
            {requests.map((r) => (
              <ListGroup.Item
                key={r.id}
                className="d-flex align-items-center justify-content-between"
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="club-avatar">
                    {r?.requester?.profile_image ? (
                      <img
                        src={r.requester.profile_image}
                        alt={r.requester.full_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "inherit",
                        }}
                      />
                    ) : (
                      String(r?.requester?.full_name || r?.requester?.email || "U")
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {r?.requester?.full_name || r?.requester?.email || "User"}
                    </div>
                    <div className="small">{r?.requester?.email}</div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={isPending}
                    onClick={() =>
                      act({ request_id: r.id, status: "rejected" })
                    }
                  >
                    {isPending ? "..." : "Reject"}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isPending}
                    onClick={() =>
                      act({ request_id: r.id, status: "approved" })
                    }
                  >
                    {isPending ? "..." : "Approve"}
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClubRequestsModal;
