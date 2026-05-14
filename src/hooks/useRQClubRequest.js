import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ClubRequestService from "../api/clubRequestService";

const defaultOnError = (err) => {
  const message =
    err?.response?.data?.message || err?.message || "Request failed";
  toast.error(message);
};

const useRequestClub = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (payload) => ClubRequestService.request(payload),
    onSuccess,
    onError,
  });
};

const useFollowClub = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (payload) => ClubRequestService.follow(payload),
    onSuccess,
    onError,
  });
};

const useListClubRequests = (
  params,
  onSuccess,
  onError = defaultOnError
) => {
  return useQuery({
    queryKey: ["club-requests", params],
    queryFn: () => ClubRequestService.list(params),
    onSuccess,
    onError,
  });
};

const useActionClubRequest = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (payload) => ClubRequestService.action(payload),
    onSuccess,
    onError,
  });
};

const useGetClubRequests = (
  params,
  onSuccess,
  onError = defaultOnError
) => {
  return useQuery({
    queryKey: ["club-requests", params],
    queryFn: () => ClubRequestService.getClubRequests(params),
    onSuccess,
    onError,
  });
};

export { useRequestClub, useListClubRequests, useActionClubRequest, useGetClubRequests, useFollowClub };