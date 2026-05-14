import React from "react";
import {
    Modal,
    Button,
    Image,
    Form as BootstrapForm,
    Spinner,
    Form,
} from "react-bootstrap";
import { FaImage } from "react-icons/fa";
import { useCreatePost } from "../../hooks/useRQPost";
import { toast } from "react-toastify";
import { Form as FormikForm, useFormik } from "formik";
import TNInput from "../../component/TNInput";
import * as Yup from "yup";
import ProfilePhotoCropper from "../profile/ProfilePhotoCropper";

// Validation Schema
const postSchema = Yup.object().shape({
    content: Yup.string()
        .required("Content is required")
        .max(1000, "Content is too long (max 1000 characters)"),
    isPublic: Yup.boolean().default(true),
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

const CreatePostModal = ({ show, onHide, clubId, clubName, clubImage, isAdmin, onSuccess }) => {
    const [preview, setPreview] = React.useState(null);
    const [cropperOpen, setCropperOpen] = React.useState(false);
    const [cropSrc, setCropSrc] = React.useState("");
    const fileInputRef = React.useRef(null);

    const { mutate: createPost, isPending } = useCreatePost(
        (data) => {
            formik.resetForm();
            setPreview(null);
            setCropperOpen(false);
            setCropSrc("");
            onHide();
            if (onSuccess) onSuccess();
            // Notifications to club members are sent automatically by the backend
            // No need for frontend notification handling
        },
        (error) => {
            console.error("Error creating post:", error);
            toast.error(error.response?.data?.message || "Failed to create post");
        }
    );

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("content", values.content);
        formData.append("isPublic", values.isPublic ? "true" : "false");

        if (values.media) {
            formData.append("media", values.media);
        }

        if (clubId) {
            formData.append("club_id", clubId);
        }

        createPost(formData);
    };

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

    const canPostPublic = Boolean(isAdmin);
    const initialValues = {
        content: "",
        isPublic: canPostPublic,
        media: null,
    };

    const formik = useFormik({
        initialValues,
        validationSchema: postSchema,
        onSubmit: handleSubmit,
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
        <Modal className="create-club-post modern-modal" show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="modern-header">
                <Modal.Title className="w-100">
                    <div className="modal-title-content">
                        <div className="club-avatar-small">
                            {clubImage ? (
                                <img src={clubImage} alt={clubName} />
                            ) : (
                                clubName?.charAt(0)?.toUpperCase() || "C"
                            )}
                        </div>
                        <div className="title-text">
                            <h5>Create a Post</h5>
                            <p className="club-name">{clubName}</p>
                        </div>
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={formik.handleSubmit}>
                <Modal.Body className="modern-body">
                    <div className="post-input-section">
                        <div className="post-input-container">
                            <TNInput
                                as="textarea"
                                name="content"
                                placeholder="What's on your mind?"
                                className="modern-textarea"
                                style={{ resize: "none" }}
                                value={formik.values.content}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.content && !!formik.errors.content}
                            />
                            {formik.touched.content && formik.errors.content ? (
                                <div className="text-danger small mt-2">
                                    {formik.errors.content}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {preview && (
                        <div
                            className="post-img-preview"
                        >
                            <Image src={preview} fluid className="rounded" />
                            <Button
                                className=""
                                onClick={() => {
                                    formik.setFieldValue("media", null);
                                    setPreview(null);
                                }}
                            >
                                ×
                            </Button>
                        </div>
                    )}


                    <div className="post-values d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            {/* Icon */}
                            <div className={`icon-box ${formik.values.isPublic ? "icon-success" : "icon-purple"
                                }`}>
                                {formik.values.isPublic ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  data-filename="components/clubs/CreateClubPostModal" data-linenumber="185" data-visual-selector-id="components/clubs/CreateClubPostModal185" data-source-location="components/clubs/CreateClubPostModal:185:18" data-dynamic-content="false"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  data-filename="components/clubs/CreateClubPostModal" data-linenumber="187" data-visual-selector-id="components/clubs/CreateClubPostModal187" data-source-location="components/clubs/CreateClubPostModal:187:18" data-dynamic-content="false"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                )}
                            </div>

                            {/* Text */}
                            <div>
                                <h6>{formik.values.isPublic ? "Public Post" : "Members Only"}</h6>
                                <p>
                                    {formik.values.isPublic
                                        ? "Non-members can see this post"
                                        : "Only club members can see this post"}
                                </p>
                            </div>
                        </div>

                        <BootstrapForm.Check
                            type="switch"
                            id="post-visibility"
                            checked={formik.values.isPublic}
                            onChange={(e) =>
                                canPostPublic &&
                                formik.setFieldValue("isPublic", e.target.checked)
                            }
                            className="d-inline-block"
                            disabled={!canPostPublic}
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center file-upload-submit">
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleFileChange(e, formik.setFieldValue)}
                                accept="image/*"
                                className="d-none"
                            />
                            <Button
                                variant="light"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-filename="components/clubs/CreateClubPostModal" data-linenumber="221" data-visual-selector-id="components/clubs/CreateClubPostModal221" data-source-location="components/clubs/CreateClubPostModal:221:14" data-dynamic-content="false"><path d="M16 5h6"></path><path d="M19 2v6"></path><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"></path><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path><circle cx="9" cy="9" r="2"></circle></svg>
                            </Button>

                        </div>

                        <Button
                            type="submit"
                            variant="btns"
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
                                "Post to Club"
                            )}
                        </Button>
                    </div>

                </Modal.Body>
            </Form>
        </Modal>
        </>
    );
};

export default CreatePostModal;
