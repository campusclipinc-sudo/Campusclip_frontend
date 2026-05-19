import { useMutation, useQuery } from "@tanstack/react-query";
import { BookingService } from "../api/bookingService";

const onDefaultError = () => {};

/**
 * Custom hook for adding a Booking entry.
 * It utilizes the `useMutation` hook to send the Booking request and handle the response.
 *
 * @param {function} onSuccess - Callback to execute when the Booking request is successful.
 * @param {function} [onError=onDefaultError] - Callback to execute when the Booking request fails.
 *
 * @returns {object} Mutation object from `useMutation`.
 */

const useAddBooking = (onSuccess, onError = onDefaultError) => {
  return useMutation({
    mutationFn: (data) => {
      return BookingService.addBooking(data);
    },
    onSuccess,
    onError,
  });
};

const useGetBooking = (params, onSuccess, onError = onDefaultError) => {
  return useQuery({
    queryKey: ["Booking", params],
    queryFn: () => BookingService.getBooking(params),
    onSuccess, // Success callback
    onError, // Error callback
  });
};

const useGetSlots = (params, onSuccess, onError = onDefaultError) => {
  return useQuery({
    queryKey: ["slots", params],
    queryFn: () => BookingService.getSlots(params),
    onSuccess, // Success callback
    onError, // Error callback
  });
};

const useUpdateBooking = (onSuccess, onError = onDefaultError) => {
  return useMutation({
    mutationFn: (data) => {
      return BookingService.editBooking(data);
    },
    onSuccess,
    onError,
  });
};

const useListBooking = (params, onSuccess, onError = onDefaultError) => {
  return useQuery({
    queryKey: ["Booking-list", params],
    queryFn: () => BookingService.listBooking(params),
    onSuccess, // Success callback
    onError, // Error callback
  });
};

const useBookingDelete = (onSuccess, onError = onDefaultError) => {
  return useMutation({
    mutationFn: (data) => {
      return BookingService.deleteBooking(data);
    },
    onSuccess,
    onError,
  });
};

export {
  useAddBooking,
  useGetBooking,
  useUpdateBooking,
  useListBooking,
  useBookingDelete,
  // useGetBookingData,
  useGetSlots,
};
