import React from "react";
import { Modal, Button, Badge, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
    useListMembers,
    usePromoteMember,
    useRemoveMember,
    useLeaveClub,
} from "../../hooks/useRQClub";

const ManageMembersModal = ({ show, onHide, clubId, onSuccess }) => {
    const currentUser = useSelector((s) => s.user?.user) || null;

    const { data, isLoading, refetch } = useListMembers(
        show && clubId ? { club_id: clubId } : null
    );
    const promoteMut = usePromoteMember(
        () => {
            refetch();
            onSuccess?.();
        },
    );
    const removeMut = useRemoveMember(
        () => {
            refetch();
            onSuccess?.();
        },
    );
    const leaveMut = useLeaveClub(() => {
        onSuccess?.();
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {},
        onSubmit: () => { },
    });

    const payload = data?.data || {};
    const owner = payload?.owner || null;
    const members = Array.isArray(payload?.members) ? payload.members : [];
    const canManage = Boolean(
        payload?.can_manage || (owner && currentUser?.id && owner.id === currentUser.id)
    );
    const adminIdSet = new Set();
    if (owner?.id) adminIdSet.add(owner.id);
    members.forEach((m) => {
        if (m?.is_admin && m?.id) adminIdSet.add(m.id);
    });
    const adminCount = adminIdSet.size;
    const isCurrentAdmin =
        !!currentUser?.id &&
        (owner?.id === currentUser.id ||
            members.some((m) => m.id === currentUser.id && m.is_admin));
    const canLeave = !isCurrentAdmin || adminCount > 1;

    const handlePromote = (userId) => {
        if (!clubId || !userId) return;
        promoteMut.mutate({ club_id: clubId, user_id: userId });
    };

    const handleRemove = (userId) => {
        if (!clubId || !userId) return;
        removeMut.mutate({ club_id: clubId, user_id: userId });
    };

    const handleLeave = () => {
        if (!clubId) return;
        leaveMut.mutate(
            { club_id: clubId },
            {
                onSuccess: () => onHide?.(),
            }
        );
    };

    return (
        <Modal show={show} onHide={onHide} className="manage-club" centered backdrop="static">
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body as="form" onSubmit={formik.handleSubmit}>
                <h3><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown w-5 h-5 text-yellow-600" data-filename="components/clubs/ManageMembersModal" data-linenumber="179" data-visual-selector-id="components/clubs/ManageMembersModal179" data-source-location="components/clubs/ManageMembersModal:179:14" data-dynamic-content="false"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path><path d="M5 21h14"></path></svg> Manage Club Members</h3>
                <p>Promote a new admin, remove members, or leave the club.</p>

                {isLoading ? (
                    <div className="d-flex align-items-center gap-2 py-3">
                        <Spinner size="sm" /> <span>Loading members...</span>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {/* Owner Row */}
                        {owner ? (
                            <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="club-avatar">
                                        {owner.profile_image ? (
                                            <img
                                                src={owner.profile_image}
                                                alt={owner.full_name}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    borderRadius: "inherit",
                                                }}
                                            />
                                        ) : (
                                            (owner.full_name || "Owner").charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="fw-semibold">{owner.full_name || "Owner"}</div>
                                </div>
                                <Badge bg="primary">Admin</Badge>
                            </div>
                        ) : null}

                        {/* Members */}
                        {members.length === 0 ? (
                            <div className="text-center">No members yet</div>
                        ) : (
                            members.map((m) => (
                                <div
                                    key={m.id}
                                    className="d-flex align-items-center justify-content-between p-2 border rounded"
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="club-avatar bg-light">
                                            {m.profile_image ? (
                                                <img
                                                    src={m.profile_image}
                                                    alt={m.full_name}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        borderRadius: "inherit",
                                                    }}
                                                />
                                            ) : (
                                                String(m.full_name || m.email || "").charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="fw-semibold">{m.full_name || "Member"}</div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        {m.is_admin ? (
                                            <Badge bg="primary">Admin</Badge>
                                        ) : canManage ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="warning"
                                                    className="icon-btn"
                                                    onClick={() => handlePromote(m.id)}
                                                    disabled={promoteMut.isLoading}
                                                    title={promoteMut.isLoading ? "Promoting..." : "Promote to Admin"}
                                                >
                                                    {promoteMut.isLoading ? (
                                                        <Spinner size="sm" animation="border" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCrown} />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="icon-btn"
                                                    onClick={() => handleRemove(m.id)}
                                                    disabled={removeMut.isLoading}
                                                    title={removeMut.isLoading ? "Removing..." : "Remove Member"}
                                                >
                                                    {removeMut.isLoading ? (
                                                        <Spinner size="sm" animation="border" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    )}
                                                </Button>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Leave club */}
                        {(canManage || !isCurrentAdmin) ? (
                            <div className="pt-2">
                                <Button
                                    variant="danger"
                                    className="w-100"
                                    onClick={handleLeave}
                                    disabled={leaveMut.isLoading || !canLeave}
                                >
                                    {leaveMut.isLoading ? "Leaving..." : "Leave Club"}
                                </Button>
                                {isCurrentAdmin && !canLeave ? (
                                    <div className="small mt-2">
                                        You are the only admin. Promote another member to leave.
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="light"
                    onClick={onHide}
                    disabled={
                        promoteMut.isLoading || removeMut.isLoading || leaveMut.isLoading
                    }
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ManageMembersModal;
