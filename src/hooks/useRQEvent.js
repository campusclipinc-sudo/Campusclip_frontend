import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EventService from "../api/eventService";

const defaultOnError = () => {};

const useEvents = (params, onSuccess, onError = defaultOnError) => {
    return useQuery({
        queryKey: ["events", params],
        queryFn: () => EventService.list(params),
        enabled: params !== null, // Allow null to disable query
        onSuccess,
        onError,
    });
};

const useGetEvent = (id, onSuccess, onError = defaultOnError) => {
    return useQuery({
        queryKey: ["event", id],
        queryFn: () => EventService.get(id),
        enabled: Boolean(id),
        onSuccess,
        onError,
    });
};

const useCreateEvent = (onSuccess, onError = defaultOnError) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => EventService.create(payload),
        onSuccess: (data, variables) => {
            qc.invalidateQueries({ queryKey: ["events"] });
            onSuccess?.(data, variables);
        },
        onError,
    });
};

const useUpdateEvent = (onSuccess, onError = defaultOnError) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => EventService.update(payload),
        onSuccess: (data, variables) => {
            if (variables?.id)
                qc.invalidateQueries({ queryKey: ["event", variables.id] });
            qc.invalidateQueries({ queryKey: ["events"] });
            onSuccess?.(data, variables);
        },
        onError,
    });
};

const useDeleteEvent = (onSuccess, onError = defaultOnError) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => EventService.remove(id),
        onSuccess: (data, id) => {
            qc.invalidateQueries({ queryKey: ["event", id] });
            qc.invalidateQueries({ queryKey: ["events"] });
            onSuccess?.(data, id);
        },
        onError,
    });
};

// Attendance hooks
const useAttendEvent = (onSuccess, onError = defaultOnError) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (eventId) => EventService.attend(eventId),
        onSuccess: (data, eventId) => {
            // If requires payment, redirect will happen in the component
            if (!data?.data?.requiresPayment) {
                if (data?.data?.unattended) {
                } else {
                }
            }
            qc.invalidateQueries({ queryKey: ["event", eventId] });
            qc.invalidateQueries({ queryKey: ["events"] });
            qc.invalidateQueries({ queryKey: ["event-attendance", eventId] });
            qc.invalidateQueries({ queryKey: ["feed"] });
            onSuccess?.(data, eventId);
        },
        onError,
    });
};

const useEventAttendees = (eventId, onSuccess, onError = defaultOnError) => {
    return useQuery({
        queryKey: ["event-attendees", eventId],
        queryFn: () => EventService.getAttendees(eventId),
        enabled: Boolean(eventId),
        onSuccess,
        onError,
    });
};

const useCheckAttendance = (eventId, onSuccess, onError = defaultOnError) => {
    return useQuery({
        queryKey: ["event-attendance", eventId],
        queryFn: () => EventService.checkAttendance(eventId),
        enabled: Boolean(eventId),
        staleTime: 0, // Always fetch fresh data
        cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
        refetchOnMount: true, // Refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
        onSuccess,
        onError,
    });
};

export {
    useEvents,
    useGetEvent,
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent,
    useAttendEvent,
    useEventAttendees,
    useCheckAttendance,
};