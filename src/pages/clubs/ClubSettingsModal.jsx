import React, { useState, useRef } from "react";
import { Modal, Button, Card, Row, Col } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import TNInput from "../../component/TNInput";
import { useEditClub, useDeleteClub } from "../../hooks/useRQClub";
import { useNavigate } from "react-router-dom";
import ProfilePhotoCropper from "../profile/ProfilePhotoCropper";
import { confirmAlert } from "react-confirm-alert";

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Club name is required")
    .min(3, "Club name must be at least 3 characters")
    .max(50, "Club name must not exceed 50 characters"),
  description: Yup.string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .nullable(),
  is_public: Yup.boolean(),
  allow_member_to_post: Yup.boolean(),
});

const ClubSettingsModal = ({ show, onHide, club, onSuccess }) => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const fileInputRef = useRef(null);

  // Edit club mutation
  const { mutate: editClub, isPending: isEditing } = useEditClub(
    (data) => {
      setImagePreview(null);
      setSelectedFile(null);
      onSuccess?.(data);
      onHide();
    },
    (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update club";
      toast.error(message);
    }
  );

  // Delete club mutation
  const { mutate: deleteClub, isPending: isDeleting } = useDeleteClub(
    (data) => {
      onSuccess?.(data);
      onHide();
      navigate("/clubs");
    },
    (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete club";
      toast.error(message);
    }
  );

  // Handle file selection — open cropper instead of direct preview
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Please select a valid image (JPEG, PNG, or GIF)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Reset input so selecting the same file again fires the event
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(String(ev.target?.result || ""));
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropSave = (dataUrl) => {
    setCropperOpen(false);
    setCropSrc("");
    setImagePreview(dataUrl);

    // Convert base64 data URL to Blob
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    setSelectedFile(new Blob([u8arr], { type: mime }));
  };

  const onCropCancel = () => {
    setCropperOpen(false);
    setCropSrc("");
  };

  // Handle file input click
  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: club?.name || "",
      description: club?.description || "",
      is_public: club?.is_public ?? true,
      allow_member_to_post: club?.allow_member_to_post ?? false,
    },
    validationSchema,
    onSubmit: (values) => {
      if (!club?.id) {
        toast.error("Club ID is missing");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("description", values.description?.trim() || "");
      formData.append("is_public", Boolean(values.is_public));
      formData.append("allow_member_to_post", Boolean(values.allow_member_to_post));

      // Add image file if selected
      if (selectedFile) {
        formData.append("club_profile_image", selectedFile, "club-profile.png");
      }

      editClub({ id: club.id, formData });
    },
  });

  const handleDelete = () => {
    if (!club?.id) {
      toast.error("Club ID is missing");
      return;
    }

    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Delete Club</h5>
            <p className="mb-4">
              Are you sure you want to delete this club? This action cannot be
              undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  deleteClub(club.id);
                  onClose();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  const handleCancel = () => {
    formik.resetForm();
    setImagePreview(null);
    setSelectedFile(null);
    setCropperOpen(false);
    setCropSrc("");
    onHide();
  };

  return (
    <>
    <ProfilePhotoCropper
      show={cropperOpen}
      src={cropSrc}
      onCancel={onCropCancel}
      onSave={onCropSave}
      circular={true}
      title="Adjust Club Picture"
    />
    <Modal
      className="clubSetting"
      show={show}
      onHide={handleCancel}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <div className="club-settings-head">
          <h3>Club Settings</h3>
          <p>Manage your club's details and preferences.</p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          {/* Avatar Section */}
          <div className="d-flex flex-wrap align-items-center pro-setting-head">
            <div className="club-setting-profile">
              {imagePreview || club?.club_profile_image ? (
                <img
                  src={imagePreview || club?.club_profile_image}
                  alt={club?.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                club?.name?.[0]?.toUpperCase() || "C"
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <Button
              variant="light"
              className="border"
              onClick={handleChangeAvatar}
              disabled={isEditing || isDeleting}
            >
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
                className="lucide lucide-camera w-4 h-4 mr-2"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
              Change Avatar
            </Button>
          </div>

          {/* Club Name - Using TNInput */}
          <TNInput
            label="Club Name"
            name="name"
            type="text"
            placeholder="Enter club name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors}
            touched={formik.touched}
            disabled={isEditing || isDeleting}
          />

          {/* Club Description - Using TNInput */}
          <TNInput
            label="Club Description"
            name="description"
            type="textarea"
            placeholder="Describe your club"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors}
            touched={formik.touched}
            disabled={isEditing || isDeleting}
          />

          {/* Club Settings */}
          <div className="switch-card-main">
            <h3>Club Settings</h3>

            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="club-public-switch"
                  checked={formik.values.is_public}
                  onChange={(e) =>
                    formik.setFieldValue("is_public", e.target.checked)
                  }
                  disabled={isEditing || isDeleting}
                />
                <label
                  className="form-check-label"
                  htmlFor="club-public-switch"
                >
                  Public Club
                </label>
              </div>
              <div className="small mt-1">
                Anyone can find and join the club.
              </div>
            </div>

            <div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="allow-post-switch"
                  checked={formik.values.allow_member_to_post}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "allow_member_to_post",
                      e.target.checked
                    )
                  }
                  disabled={isEditing || isDeleting}
                />
                <label className="form-check-label" htmlFor="allow-post-switch">
                  Allow Member Posts
                </label>
              </div>
              <div className="small mt-1">
                Members can create posts in the discussion tab.
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <Card className="mb-3 border-danger-subtle mt-3">
            <div className="fw-semibold mb-2 text-danger">Danger Zone</div>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-medium">Delete this club</div>
                <div className="text-danger small">
                  This action is permanent and cannot be undone.
                </div>
              </div>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting || isEditing}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="light"
              onClick={handleCancel}
              disabled={isEditing || isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isEditing || isDeleting}
            >
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
    </>
  );
};

export default ClubSettingsModal;
