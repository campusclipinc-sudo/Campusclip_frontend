import { useMutation, useQuery } from "@tanstack/react-query";
import ClubService from "../api/clubService";

const defaultOnError = () => {};

const useListClubs = (params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["clubs", params],
    queryFn: () => ClubService.list(params),
    onSuccess,
    onError,
  });
};

const useGetClub = (id, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["club", id],
    queryFn: () => ClubService.get(id),
    enabled: Boolean(id),
    onSuccess,
    onError,
  });
};

const useListCategories = (onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["club-categories"],
    queryFn: () => ClubService.listCategories(),
    onSuccess,
    onError,
  });
};

const useCreateClub = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (payload) => ClubService.create(payload),
    onSuccess,
    onError,
  });
};

// Member-related hooks
const useListMembers = (params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["club-members", params],
    queryFn: () => ClubService.listMembers(params),
    enabled: Boolean(params?.club_id),
    onSuccess,
    onError,
  });
};

const usePromoteMember = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (payload) => ClubService.promote(payload),
    onSuccess,
    onError,
  });
};

const useRemoveMember = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (payload) => ClubService.removeMember(payload),
    onSuccess,
    onError,
  });
};

const useLeaveClub = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (payload) => ClubService.leave(payload),
    onSuccess,
    onError,
  });
};

const useEditClub = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (data) => {
      // Support both object and FormData
      if (data.formData) {
        return ClubService.edit(data.id, data.formData);
      }
      const { id, ...payload } = data;
      return ClubService.edit(id, payload);
    },
    onSuccess,
    onError,
  });
};

const useDeleteClub = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (id) => ClubService.delete(id),
    onSuccess,
    onError,
  });
};

export {
  useListClubs,
  useGetClub,
  useListCategories,
  useCreateClub,
  useListMembers,
  usePromoteMember,
  useRemoveMember,
  useLeaveClub,
  useEditClub,
  useDeleteClub,
};
