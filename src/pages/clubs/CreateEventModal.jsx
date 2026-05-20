import React, { useState, useRef } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import TNInput from "../../component/TNInput";
import { useCreateEvent } from "../../hooks";
import StripeCardSetup from "../../components/StripeCardSetup";
import { toast } from "react-toastify";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const schema = Yup.object().shape({
  title: Yup.string().required("Event title is required"),
  description: Yup.string().max(1000, "Description too long").nullable(),
  location: Yup.string().max(255, "Location too long").nullable(),
  startAt: Yup.date()
    .typeError("Please select a valid date & time")
    .required("Date & time is required")
    .min(new Date(), "Start date cannot be in the past"),
  endAt: Yup.date()
    .typeError("Please select a valid date & time")
    .nullable()
    .min(Yup.ref("startAt"), "End date must be after start date"),
  minutesBeforeEvent: Yup.number().min(0, "Must be 0 or greater").default(0),
  paymentRequired: Yup.boolean().default(false),
  price: Yup.number()
    .nullable()
    .when("paymentRequired", {
      is: true,
      then: (schema) =>
        schema
          .required("Price is required when payment is required")
          .min(0.01, "Price must be greater than 0"),
      otherwise: (schema) => schema.nullable(),
    }),
  clubId: Yup.number().nullable(),
});

const CreateEventModalContent = ({ show, onHide, clubId, onSubmit }) => {
  const [cardSetupComplete, setCardSetupComplete] = useState(false);
  const cardSetupRef = useRef(null);

  // Get current datetime in the format required by datetime-local input (YYYY-MM-DDTHH:MM)
  const getMinDateTime = () => {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:MM
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const createEventMutation = useCreateEvent((data) => {
    onSubmit?.(data);
    onHide?.();
    setCardSetupComplete(false);
  });

  const handleSubmit = async (values, helpers) => {
    try {
      // If payment required and card not yet set up, set up card first
      if (
        values.paymentRequired &&
        !cardSetupComplete &&
        cardSetupRef.current
      ) {
        helpers.setSubmitting(true);
        toast.info("Saving your payment card...");

        const result = await cardSetupRef.current.setupCard();

        if (!result.success) {
          toast.error(
            result.error ||
              "Failed to setup payment card. Please check your card details."
          );
          helpers.setSubmitting(false);
          return;
        }

        setCardSetupComplete(true);
      }

      // Convert time from EST to UTC
      const convertESTToUTC = (localDateString) => {
        if (!localDateString) return null;

        // Create date from the input (treated as local)
        const date = new Date(localDateString);

        // EST offset is -5 hours from UTC
        const estOffset = -5;

        // Get the current browser offset
        const browserOffset = -date.getTimezoneOffset() / 60;

        // Calculate the difference and adjust
        const offsetDifference = estOffset - browserOffset;

        // Create new date adjusted for timezone difference
        const utcDate = new Date(date.getTime() - offsetDifference * 60 * 60 * 1000);

        return utcDate.toISOString();
      };

      // Create event
      const payload = {
        title: values.title.trim(),
        description: values.description?.trim() || null,
        location: values.location?.trim() || null,
        startAt: convertESTToUTC(values.startAt),
        endAt: convertESTToUTC(values.endAt) || null,
        minutesBeforeEvent: values.minutesBeforeEvent,
        paymentRequired: values.paymentRequired,
        price: values.paymentRequired ? parseFloat(values.price) : null,
        clubId: values.clubId,
      };

      createEventMutation.mutate(payload);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      helpers.setSubmitting(false);
    }
  };

  return (
    <Modal
      className="create-club-popup"
      show={show}
      onHide={() => {
        onHide?.();
        setCardSetupComplete(false);
      }}
      centered
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton></Modal.Header>
      <Formik
        validationSchema={schema}
        initialValues={{
          title: "",
          description: "",
          location: "",
          startAt: "",
          endAt: "",
          minutesBeforeEvent: 0,
          paymentRequired: false,
          price: null,
          clubId: clubId || null,
        }}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <FormikForm>
            <Modal.Body>
              <h4>Create New Event</h4>
              <p>Schedule a new event for your club.</p>

              <Form>
                <TNInput
                  label="Event Title"
                  name="title"
                  placeholder="e.g., Club Meeting, Social Event"
                  value={values.title}
                  onChange={(e) => setFieldValue("title", e.target.value)}
                  onBlur={() => {}}
                  error={errors}
                  touched={touched}
                />

                <TNInput
                  label="Description"
                  name="description"
                  type="textarea"
                  placeholder="Tell members what this event is about..."
                  value={values.description}
                  onChange={(e) => setFieldValue("description", e.target.value)}
                  onBlur={() => {}}
                  error={errors}
                  touched={touched}
                />

                <TNInput
                  label="Location"
                  name="location"
                  placeholder="e.g., Room 101, Zoom Link"
                  value={values.location}
                  onChange={(e) => setFieldValue("location", e.target.value)}
                  onBlur={() => {}}
                  error={errors}
                  touched={touched}
                />

                <div className="d-flex flex-wrap gap-3">
                  <div className="flex-grow-1" style={{ minWidth: 220 }}>
                    <TNInput
                      label="Start Date and Time"
                      name="startAt"
                      type="datetime-local"
                      min={getMinDateTime()}
                      value={values.startAt}
                      onChange={(e) => setFieldValue("startAt", e.target.value)}
                      onBlur={() => {}}
                      error={errors}
                      touched={touched}
                    />
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 220 }}>
                    <TNInput
                      label="End Date and Time"
                      name="endAt"
                      type="datetime-local"
                      min={values.startAt || getMinDateTime()}
                      value={values.endAt}
                      onChange={(e) => setFieldValue("endAt", e.target.value)}
                      onBlur={() => {}}
                      error={errors}
                      touched={touched}
                    />
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3">
                  <div className="flex-grow-1" style={{ minWidth: 220 }}>
                    <TNInput
                      label="When to post announcement"
                      type="select"
                      name="minutesBeforeEvent"
                      options={[
                        { value: "0", label: "Post Immediately" },
                        { value: "60", label: "1 Hour Before Event" },
                        { value: "120", label: "2 Hours Before Event" },
                        { value: "240", label: "4 Hours Before Event" },
                        { value: "480", label: "8 Hours Before Event" },
                        { value: "1440", label: "1 Day Before Event" },      // 24 × 60
                        { value: "2880", label: "2 Days Before Event" },     // 2 × 1440
                        { value: "10080", label: "1 Week Before Event" },    // 7 × 1440
                      ]}
                      value={values.minutesBeforeEvent}
                      onChange={(e) => setFieldValue("minutesBeforeEvent", e.target.value)}
                      onBlur={() => {}}
                      error={errors}
                      touched={touched}
                    />
                  </div>
                </div>

                {/* <div className="mt-3">
                  <Form.Check
                    type="switch"
                    id="paymentRequired"
                    label="Payment Required"
                    checked={values.paymentRequired}
                    onChange={(e) => {
                      setFieldValue("paymentRequired", e.target.checked);
                      if (!e.target.checked) {
                        setFieldValue("price", null);
                        setCardSetupComplete(false);
                      }
                    }}
                  />
                </div> */}

                {/* {values.paymentRequired && (
                  <>
                    <div className="mt-3">
                      <TNInput
                        label="Event Price (USD)"
                        name="price"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        value={values.price || ""}
                        onChange={(e) => setFieldValue("price", e.target.value)}
                        onBlur={() => {}}
                        error={errors}
                        touched={touched}
                      />
                    </div>

                    <div className="mt-4">
                      <Alert variant="info" className="mb-3">
                        <strong>Payment Setup Required</strong>
                        <p className="mb-0 mt-2">
                          To receive payments from attendees, please provide
                          your card details. This will be securely stored with
                          Stripe.
                        </p>
                      </Alert>

                      <StripeCardSetup
                        ref={cardSetupRef}
                        onSuccess={() => setCardSetupComplete(true)}
                        onError={(error) =>
                          toast.error(error?.message || "Card setup failed")
                        }
                      />

                      {cardSetupComplete && (
                        <Alert variant="success" className="mt-2">
                          ✓ Payment card saved successfully
                        </Alert>
                      )}
                    </div>
                  </>
                )} */}
              </Form>

              <div className="cancel-add-btn d-flex justify-content-end mt-4">
                <Button
                  variant="light"
                  onClick={() => {
                    onHide?.();
                    setCardSetupComplete(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button variant="btns" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? values.paymentRequired && !cardSetupComplete
                      ? "Saving Card..."
                      : "Creating..."
                    : "Create Event"}
                </Button>
              </div>
            </Modal.Body>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

// Wrapper with Stripe Elements provider
const CreateEventModal = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CreateEventModalContent {...props} />
    </Elements>
  );
};

export default CreateEventModal;
