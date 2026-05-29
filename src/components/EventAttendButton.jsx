import React from "react";
import { useCheckAttendance, useAttendEvent } from "../hooks";

/**
 * EventAttendButton Component
 * Displays attend button with dynamic text based on attendance status
 * Handles both free and paid events
 */
const EventAttendButton = ({
  eventId,
  paymentRequired,
  price,
  onAttend,
  creatorId,
  currentUserId,
  isCompleted = false,
}) => {
  const { data: attendanceData, isLoading: checkingAttendance } =
    useCheckAttendance(eventId);
  const attendEventMutation = useAttendEvent((responseData) => {
    const data = responseData?.data;
    if (data?.requiresPayment && data?.checkoutUrl) {
      // Redirect to Stripe Checkout for paid events
      window.location.href = data.checkoutUrl;
    }
    // Call parent callback if provided
    if (onAttend) onAttend(responseData);
  });

  const isAttending = attendanceData?.data?.isAttending || false;
  const paymentStatus = attendanceData?.data?.paymentStatus || null;

  // Allow unattending only if payment status is 'free' (free events or creators attending paid events)
  // Users who paid (paymentStatus === 'completed') cannot unattend
  const canUnattend = isAttending && paymentStatus === 'free';

  const handleAttendClick = () => {
    // If event is completed, don't allow attendance
    if (isCompleted) return;
    
    // If attending and can unattend, clicking will unattend (handled by backend)
    // If not attending, clicking will attend
      attendEventMutation.mutate(eventId);
  };

  // Show "Attending" status if already attending
  if (isAttending) {
    return (
      <button 
        className="btn-attend attending"
        onClick={canUnattend && !isCompleted ? handleAttendClick : undefined}
        disabled={isCompleted || (!canUnattend && (attendEventMutation.isPending || checkingAttendance))}
        style={canUnattend && !isCompleted ? { cursor: 'pointer' } : { cursor: 'default', opacity: isCompleted ? 0.6 : 1 }}
        title={isCompleted ? 'Event completed' : (canUnattend ? 'Click to remove from event' : 'Attending')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
        {attendEventMutation.isPending ? "Processing..." : "Attending"}
      </button>
    );
  }

  return (
    <button
      className="btn-attend"
      onClick={handleAttendClick}
      disabled={isCompleted || attendEventMutation.isPending || checkingAttendance}
      style={isCompleted ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      title={isCompleted ? 'Event completed - Cannot attend' : undefined}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <line x1="19" x2="19" y1="8" y2="14"></line>
        <line x1="22" x2="16" y1="11" y2="11"></line>
      </svg>
      {attendEventMutation.isPending ? "Processing..." : "Attend"}
      {paymentRequired && price && <span className="ms-1">${price}</span>}
    </button>
  );
};

export default React.memo(EventAttendButton, (prevProps, nextProps) => {
  return (
    prevProps.eventId === nextProps.eventId &&
    prevProps.paymentRequired === nextProps.paymentRequired &&
    prevProps.price === nextProps.price &&
    prevProps.creatorId === nextProps.creatorId &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.isCompleted === nextProps.isCompleted
  );
});
