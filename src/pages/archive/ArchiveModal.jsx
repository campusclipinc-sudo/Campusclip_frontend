import React, { useEffect, useMemo } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import TNInput from "../../component/TNInput";
import { toast } from "react-toastify";
import {
  useCreateArchive,
  useAddClassesToArchive,
  useGetUserArchives,
} from "../../hooks/index";

const ArchiveModal = ({ show, onHide, classes = [] }) => {
  const { data: archivesData } = useGetUserArchives();
  const archives = (archivesData && (archivesData.data || archivesData)) || [];
  // Get all archived class IDs
  const archivedClassIds = useMemo(() => {
    const ids = new Set();
    if (!Array.isArray(archives)) return ids;
    archives.forEach((archive) => {
      if (archive.classes && Array.isArray(archive.classes)) {
        archive.classes.forEach((cls) => {
          ids.add(cls.id);
        });
      }
    });
    return ids;
  }, [archives]);

  // Filter out already archived classes
  const availableClasses = useMemo(() => {
    try {
      if (!Array.isArray(classes)) {
        console.error(
          "ArchiveModal - classes is not an array:",
          typeof classes,
          classes,
        );
        return [];
      }
      return classes.filter((cls) => !archivedClassIds.has(cls.id));
    } catch (error) {
      console.error("ArchiveModal - Error filtering classes:", error);
      return [];
    }
  }, [classes, archivedClassIds]);

  // Map existing archives to select options (must be before formik hook)
  const existingArchives = archives.map((archive) => ({
    value: archive.id,
    label: archive.name,
  }));

  // Create mutation hooks
  const { mutate: createArchive, isLoading: isCreating } = useCreateArchive(
    (res) => {
      onHide();
    },
    (error) => {
      toast.error(error?.response?.data?.message || "Failed to create archive");
    },
  );

  const { mutate: addToArchive, isLoading: isAdding } = useAddClassesToArchive(
    (res) => {
      onHide();
    },
    (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to add classes to archive",
      );
    },
  );

  const formik = useFormik({
    initialValues: {
      selectedClasses: [],
      archiveOption: existingArchives.length > 0 ? "existing" : "new", // Default to "new" if no archives exist
      existingArchive: "",
      newArchiveName: "",
    },
    validationSchema: Yup.object({
      selectedClasses: Yup.array()
        .min(1, "Please select at least one class to archive")
        .required("Please select classes to archive"),
      archiveOption: Yup.string()
        .oneOf(["existing", "new"], "Invalid archive option")
        .required("Please choose an archive option"),
      existingArchive: Yup.string().when("archiveOption", {
        is: "existing",
        then: (schema) => schema.required("Please select an archive"),
        otherwise: (schema) => schema.notRequired(),
      }),
      newArchiveName: Yup.string().when("archiveOption", {
        is: "new",
        then: (schema) =>
          schema
            .required("Archive name is required")
            .min(3, "Archive name must be at least 3 characters"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: (values) => {
      const {
        selectedClasses,
        archiveOption,
        existingArchive,
        newArchiveName,
        newArchiveDescription,
      } = values;

      console.log("Archiving classes:", {
        selectedClasses,
        archiveOption,
        existingArchive,
        newArchiveName,
        newArchiveDescription,
      });

      if (archiveOption === "new") {
        // Create new archive
        console.log("Creating new archive with data:", {
          name: newArchiveName,
          description: newArchiveDescription || "",
          classIds: selectedClasses,
        });
        createArchive({
          name: newArchiveName,
          description: newArchiveDescription || "",
          classIds: selectedClasses,
        });
      } else {
        // Add to existing archive
        console.log("Adding to existing archive:", {
          archiveId: existingArchive,
          classIds: selectedClasses,
        });
        addToArchive({
          archiveId: existingArchive,
          classIds: selectedClasses,
        });
      }
    },
  });

  useEffect(() => {
    if (!show) {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleClassToggle = (classId) => {
    const currentSelection = formik.values.selectedClasses;
    const isSelected = currentSelection.includes(classId);

    if (isSelected) {
      formik.setFieldValue(
        "selectedClasses",
        currentSelection.filter((id) => id !== classId),
      );
    } else {
      formik.setFieldValue("selectedClasses", [...currentSelection, classId]);
    }
  };

  const handleSelectAll = () => {
    if (formik.values.selectedClasses.length === availableClasses.length) {
      formik.setFieldValue("selectedClasses", []);
    } else {
      formik.setFieldValue(
        "selectedClasses",
        availableClasses.map((cls) => cls.id),
      );
    }
  };

  const selectedCount = formik.values.selectedClasses.length;
  const allSelected =
    availableClasses.length > 0 && selectedCount === availableClasses.length;

  const isSubmitting = isCreating || isAdding;

  const getClassDisplayInfo = (cls) => {
    const code = cls.class_code || "N/A";
    const instructor = cls.instructor_name || "Not specified";
    // Display current grade instead of target grade
    const grade = cls.current_grade || cls.grade || "No Grade";
    const semester = cls.semester || "N/A";

    return {
      code,
      instructor,
      grade,
      semester,
    };
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="archive-modal"
      backdrop="static"
    >
      <Modal.Header closeButton className="archive-modal-header">
        <Modal.Title></Modal.Title>
      </Modal.Header>
      <Modal.Body className="archive-modal-body">
        <h2>
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
            data-filename="components/classes/ArchiveClassModal"
            data-linenumber="133"
            data-visual-selector-id="components/classes/ArchiveClassModal133"
            data-source-location="components/classes/ArchiveClassModal:133:12"
            data-dynamic-content="false"
          >
            <rect width="20" height="5" x="2" y="3" rx="1"></rect>
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
            <path d="M10 12h4"></path>
          </svg>{" "}
          Archive Classes
        </h2>
        <p className="archive-description">
          Move completed classes to an archive to keep your dashboard organized.
        </p>

        <Form onSubmit={formik.handleSubmit}>
          {/* Display validation errors */}
          {Object.keys(formik.errors).length > 0 && formik.submitCount > 0 && (
            <div
              className="alert alert-danger"
              style={{
                fontSize: "0.875rem",
                padding: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <strong>Please fix the following errors:</strong>
              <ul
                style={{
                  marginBottom: 0,
                  marginTop: "0.5rem",
                  paddingLeft: "1.25rem",
                }}
              >
                {Object.values(formik.errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Select Classes Section */}
          <div className="archive-section">
            <h3 className="section-title">Select Classes to Archive</h3>
            <div className="classes-list-container">
              {availableClasses.length === 0 ? (
                <div className="no-classes-message">
                  <p>No classes available to archive.</p>
                </div>
              ) : (
                <>
                  {/* <div className="select-all-container">
                                        <Form.Check
                                            type="checkbox"
                                            id="select-all"
                                            label="Select All"
                                            checked={allSelected}
                                            onChange={handleSelectAll}
                                            className="select-all-checkbox"
                                        />
                                    </div> */}
                  <div className="classes-list">
                    {availableClasses.map((cls) => {
                      const isSelected = formik.values.selectedClasses.includes(
                        cls.id,
                      );
                      const { code, instructor, grade, semester } =
                        getClassDisplayInfo(cls);

                      return (
                        <div
                          key={cls.id}
                          className={`class-item ${
                            isSelected ? "selected" : ""
                          }`}
                        >
                          <Form.Check
                            type="checkbox"
                            id={`class-${cls.id}`}
                            checked={isSelected}
                            onChange={() => handleClassToggle(cls.id)}
                            className="class-checkbox"
                          />
                          <div className="d-flex justify-content-between class-info-details">
                            <div className="class-info">
                              <div className="class-name">
                                {cls.class_name || "Untitled Class"}
                              </div>
                              <div className="class-details">
                                {code} • {instructor}
                              </div>
                            </div>
                            <div className="class-meta">
                              <div className="class-grade">{grade}</div>
                              <div className="class-term">{semester}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Choose Archive Section */}
          <div className="choose-archive-section">
            <h3 className="section-title">Choose Archive</h3>
            <div className="archive-options">
              {existingArchives.length > 0 && (
                <>
                  <Form.Check
                    type="radio"
                    id="existing-archive"
                    name="archiveOption"
                    label="Add to existing archive"
                    value="existing"
                    checked={formik.values.archiveOption === "existing"}
                    onChange={formik.handleChange}
                    className="archive-radio"
                  />
                  {formik.values.archiveOption === "existing" && (
                    <div className="archive-select-wrapper">
                      <TNInput
                        name="existingArchive"
                        type="select"
                        placeholder="Select an archive"
                        value={formik.values.existingArchive}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors}
                        touched={formik.touched}
                        options={existingArchives}
                      />
                    </div>
                  )}
                </>
              )}

              <Form.Check
                type="radio"
                id="new-archive"
                name="archiveOption"
                label="Create new archive"
                value="new"
                checked={formik.values.archiveOption === "new"}
                onChange={formik.handleChange}
                className="archive-radio mb-0"
              />
              {formik.values.archiveOption === "new" && (
                <div className="archive-input-wrapper">
                  <TNInput
                    label="Archive Name *"
                    name="newArchiveName"
                    type="text"
                    placeholder="e.g., Fall 2025"
                    value={formik.values.newArchiveName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors}
                    touched={formik.touched}
                  />
                  <TNInput
                    label="Description (optional)"
                    name="newArchiveDescription"
                    type="textarea"
                    rows={3}
                    placeholder="e.g., This is a description of the archive"
                    value={formik.values.newArchiveDescription}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors}
                    touched={formik.touched}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="archive-modal-footer d-flex justify-content-end">
            <Button
              variant="light"
              onClick={onHide}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={selectedCount === 0 || isSubmitting}
              className="archive-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Archiving...
                </>
              ) : (
                <>
                  Archive {selectedCount}{" "}
                  {selectedCount === 1 ? "Class" : "Classes"}
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ArchiveModal;
