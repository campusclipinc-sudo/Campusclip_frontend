import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import TNInput from "../../component/TNInput";
import { useCreateClub, useListCategories } from "../../hooks/index";
import { useGetProfile } from "../../hooks/useRQauth";

const schema = Yup.object().shape({
  name: Yup.string().required("Club name is required"),
  category_id: Yup.number().required("Please select a category"),
  description: Yup.string().max(1000, "Description too long"),
  is_public: Yup.boolean(),
});

const CreateClubModal = ({ show, onHide, onSuccess }) => {
  const { data: catRes } = useListCategories();
  const { data: profileData } = useGetProfile();
  const { mutate: doCreateClub, isLoading } = useCreateClub(() => {
    onHide?.();
    onSuccess?.();
  });

  const categories = Array.isArray(catRes?.data) ? catRes.data : [];
  const instituteName = profileData?.educational_institution?.name || "";

  return (
    <Modal
      className="create-club-popup"
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton></Modal.Header>
      <Formik
        validationSchema={schema}
        initialValues={{
          name: "",
          category_id: "",
          description: "",
          is_public: true,
        }}
        onSubmit={(values) => {
          const payload = {
            name: values.name,
            category_id: Number(values.category_id),
            description: values.description || null,
            is_public: !!values.is_public,
            allow_member_to_post: false,
          };
          doCreateClub(payload);
        }}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <FormikForm>
            <Modal.Body>
              <h4>Create New Club</h4>
              <p>Start a new club or organization on campus</p>
              <Form>
                {instituteName && (
                  <Form.Group className="mb-3">
                    <Form.Label>Institute</Form.Label>
                    <Form.Control
                      type="text"
                      value={instituteName}
                      readOnly
                      disabled
                    />
                  </Form.Group>
                )}
                <TNInput
                  label="Club Name"
                  name="name"
                  placeholder="e.g., Photography Club"
                  value={values.name}
                  onChange={(e) => setFieldValue("name", e.target.value)}
                  onBlur={() => {}}
                  error={errors}
                  touched={touched}
                />
                <TNInput
                  label="Category"
                  name="category_id"
                  type="select"
                  options={categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  placeholder="Select a category"
                  value={values.category_id}
                  onChange={(e) => setFieldValue("category_id", e.target.value)}
                  onBlur={() => {}}
                  error={errors}
                  touched={touched}
                />
                <TNInput
                  label="Description"
                  name="description"
                  type="textarea"
                  placeholder="Tell others about your club..."
                  value={values.description}
                  onChange={(e) => setFieldValue("description", e.target.value)}
                  onBlur={() => {}}
                  error={errors}
                  touched={touched}
                />
                <Form.Check
                  type="switch"
                  id="club-public-switch"
                  name="is_public"
                  label="Public club (anyone can join)"
                  checked={values.is_public}
                  onChange={(e) => setFieldValue("is_public", e.target.checked)}
                />
              </Form>
              <div className="cancel-add-btn d-flex justify-content-end">
                <Button variant="light" onClick={onHide} disabled={isLoading}>
                  Cancel
                </Button>
                <Button variant="btns" type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Club"}
                </Button>
              </div>
            </Modal.Body>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateClubModal;
