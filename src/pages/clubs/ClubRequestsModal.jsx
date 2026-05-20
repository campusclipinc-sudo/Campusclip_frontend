import React from "react";
import { Modal, Button, Spinner, ListGroup, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
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
                className="club-request-item d-flex align-items-center gap-3"
              >
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                  <div
                    className="club-avatar"
                    style={{
                      backgroundColor: r?.requester?.profile_image ? "transparent" : "#f4f4f5",
                      fontSize: r?.requester?.profile_image ? "0" : "1.125rem",
                      fontWeight: r?.requester?.profile_image ? "0" : "bold",
                      color: r?.requester?.profile_image ? "transparent" : "#212529",
                    }}
                  >
                    {r?.requester?.profile_image ? (
                      <img
                        src={r.requester.profile_image}
                        alt={r.requester.full_name}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = String(
                            r?.requester?.full_name || r?.requester?.email || "U"
                          )
                            .charAt(0)
                            .toUpperCase();
                          e.target.parentElement.style.backgroundColor = "#f4f4f5";
                          e.target.parentElement.style.fontSize = "1.125rem";
                          e.target.parentElement.style.fontWeight = "bold";
                          e.target.parentElement.style.color = "#212529";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                          display: "block",
                        }}
                      />
                    ) : (
                      String(r?.requester?.full_name || r?.requester?.email || "U")
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                      {r?.requester?.full_name || r?.requester?.email || "User"}
                    </div>
                  </div>
                  <div className="d-flex gap-2 ms-auto ms-md-0">
                    <Button
                      disabled={isPending}
                      onClick={() =>
                        act({ request_id: r.id, status: "rejected" })
                      }
                      className="club-reject-btn-icon"
                      title="Reject Request"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={() =>
                        act({ request_id: r.id, status: "approved" })
                      }
                      className="club-approve-btn-icon"
                      title="Approve Request"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </Button>
                  </div>
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
