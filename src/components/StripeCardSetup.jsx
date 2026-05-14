import React, { useState, useImperativeHandle, forwardRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Form, Spinner } from "react-bootstrap";
import PaymentService from "../api/paymentService";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

const StripeCardSetup = forwardRef(({ onSuccess, onError }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  // Expose setupCard method to parent via ref
  useImperativeHandle(ref, () => ({
    setupCard: async () => {
      if (!stripe || !elements) {
        return { success: false, error: "Stripe not loaded" };
      }

      setIsProcessing(true);
      setCardError(null);

      try {
        // Get setup intent from backend
        const setupResponse = await PaymentService.setupPaymentMethod();
        const { clientSecret } = setupResponse.data;

        // Confirm card setup
        const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (error) {
          setCardError(error.message);
          setIsProcessing(false);
          onError?.(error.message);
          return { success: false, error: error.message };
        }

        // Save payment method to backend
        await PaymentService.savePaymentMethod(setupIntent.payment_method);

        setIsProcessing(false);
        onSuccess?.();
        return { success: true, paymentMethodId: setupIntent.payment_method };
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to setup card";
        setCardError(errorMessage);
        setIsProcessing(false);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
  }));

  const handleCardChange = (event) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  return (
    <div className="stripe-card-setup">
      <Form.Group className="mb-3">
        <Form.Label>Card Details (for receiving payments)</Form.Label>
        <div className="card-element-container p-3 border rounded">
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
        </div>
        {cardError && <div className="text-danger small mt-2">{cardError}</div>}
        <Form.Text className="text-muted">
          Your card will be securely stored with Stripe to receive event payments.
        </Form.Text>
      </Form.Group>
      {isProcessing && (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Securing your card details...</span>
        </div>
      )}
    </div>
  );
});

// Export both the component and a way to trigger card setup
export default StripeCardSetup;
