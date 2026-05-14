import React from "react";
import {
  Modal,
  Button,
  Image,
  Form as BootstrapForm,
  Spinner,
  Form,
  Alert,
} from "react-bootstrap";
import { FaImage, FaLock, FaGlobe } from "react-icons/fa";
import { useCreatePost } from "../hooks/useRQPost";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import TNInput from "../component/TNInput";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import ProfilePhotoCropper from "../pages/profile/ProfilePhotoCropper";

// Validation Schema
const postSchema = Yup.object().shape({
  content: Yup.string()
    .required("Content is required")
    .max(1000, "Content is too long (max 1000 characters)"),
  media: Yup.mixed()
    .nullable()
    .test("fileSize", "File size is too large (max 5MB)", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test("fileType", "Unsupported file type", (value) => {
      if (!value) return true;
      return ["image/jpeg", "image/png", "image/gif"].includes(value.type);
    }),
});

const CreatePersonalPostModal = ({ show, onHide, onSuccess }) => {
  const [preview, setPreview] = React.useState(null);
  const [cropperOpen, setCropperOpen] = React.useState(false);
  const [cropSrc, setCropSrc] = React.useState("");
  const fileInputRef = React.useRef(null);

  // Get user's account privacy from Redux store
  const user = useSelector((state) => state.user.user);
  const isUserPublic = user?.account_privacy === 0;

  const { mutate: createPost, isPending } = useCreatePost(
    (data) => {
      formik.resetForm();
      setPreview(null);
      setCropperOpen(false);
      setCropSrc("");
      onHide();
      if (onSuccess) onSuccess();
    },
    (error) => {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
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
    }
  };

  const onCropSave = (dataUrl) => {
    setCropperOpen(false);
    setCropSrc("");
    setPreview(dataUrl);
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    formik.setFieldValue("media", new Blob([u8arr], { type: mime }));
  };

  const onCropCancel = () => {
    setCropperOpen(false);
    setCropSrc("");
  };

  const initialValues = {
    content: "",
    media: null,
  };

  const handleFormSubmit = (values) => {
    const formData = new FormData();
    formData.append("content", values.content);

    if (values.media) {
      // Append the file with field name matching what backend expects
      formData.append("media", values.media);
    }

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    // Don't send club_id - this is a personal post
    // Backend will automatically set is_public based on user's account_privacy

    createPost(formData);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: postSchema,
    onSubmit: handleFormSubmit,
    enableReinitialize: true,
  });

  return (
    <>
    <ProfilePhotoCropper
      show={cropperOpen}
      src={cropSrc}
      onCancel={onCropCancel}
      onSave={onCropSave}
      circular={false}
      title="Adjust Post Image"
      exportSize={1200}
    />
    <Modal show={show} onHide={onHide} centered className="create-post-popup">
      <Modal.Header closeButton>
        <Modal.Title>Create Personal Post</Modal.Title>
      </Modal.Header>
      <Form onSubmit={formik.handleSubmit}>
        <Modal.Body>
          {/* Privacy Info Alert */}
          <Alert variant={isUserPublic ? "info" : "warning"} className="mb-3">
            <div className="d-flex align-items-center">
              {isUserPublic ? (
                <>
                  <FaGlobe className="me-2" />
                  <span>
                    Your account is <strong>Public</strong>. This post will be
                    visible to everyone.
                  </span>
                </>
              ) : (
                <>
                  <FaLock className="me-2" />
                  <span>
                    Your account is <strong>Private</strong>. This post will
                    only be visible to your followers.
                  </span>
                </>
              )}
            </div>
          </Alert>

          <BootstrapForm.Group className="mb-3">
            <TNInput
              as="textarea"
              name="content"
              rows={4}
              placeholder="What's on your mind?"
              className="border-0"
              style={{ resize: "none", fontSize: "1rem" }}
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.content && !!formik.errors.content}
            />
            {formik.touched.content && formik.errors.content ? (
              <div className="text-danger small mt-1">
                {formik.errors.content}
              </div>
            ) : null}
          </BootstrapForm.Group>

          {preview && (
            <div
              className="mb-3 position-relative"
              style={{ maxHeight: "400px", overflow: "hidden" }}
            >
              <Image src={preview} fluid className="rounded" />
              <Button
                variant="light"
                size="sm"
                className="position-absolute top-0 end-0 m-2 rounded-circle"
                onClick={() => {
                  formik.setFieldValue("media", null);
                  setPreview(null);
                }}
              >
                ×
              </Button>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e)}
                accept="image/*"
                className="d-none"
              />
              <Button
                variant="light"
                size="sm"
                className="rounded-pill"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaImage className="me-1" /> Add Photo
              </Button>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={
                formik.isSubmitting ||
                (!formik.values.content?.trim() && !formik.values.media)
              }
            >
              {formik.isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    size="sm"
                    animation="border"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Posting...</span>
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
    </>
  );
};

export default CreatePersonalPostModal;
