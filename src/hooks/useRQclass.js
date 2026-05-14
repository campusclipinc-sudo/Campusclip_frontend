import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ClassService from "../api/classService";

const defaultError = (err) => {
  const message = err?.response?.data?.message;
  toast.error(message);
};

const useUploadClass = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (payload) => ClassService.uploadClass(payload),
    onSuccess,
    onError,
  });
};

const useListClasses = (onSuccess, onError = defaultError) => {
   return useQuery({
    queryKey: ["listClasses"],
    queryFn: () => ClassService.listClasses(),
    onSuccess,
    onError,
  });
};

const useListAllClasses = (onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["listAllClasses"],
    queryFn: () => ClassService.listAllClasses(),
    onSuccess,
    onError,
  });
};

const useDeleteClass = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (payload) => ClassService.deleteClass(payload),
    onSuccess,
    onError,
  });
};

const useUpdateTargetGrade = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (payload) => ClassService.updateTargetGrade(payload),
    onSuccess,
    onError,
  });
};

const useUpdateShowInCalendar = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (payload) => ClassService.updateShowInCalendar(payload),
    onSuccess,
    onError,
  });
};

const useGetClassSchedules = (class_id, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ['classSchedules', class_id],
    queryFn: () => ClassService.getClassSchedules(class_id),
    enabled: !!class_id,
    onSuccess,
    onError,
  });
};

const useUpdateScheduleShowInCalendar = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (payload) => ClassService.updateScheduleShowInCalendar(payload),
    onSuccess,
    onError,
  });
};

const useUpdateSchedulesShowInCalendar = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (payload) => ClassService.updateSchedulesShowInCalendar(payload),
    onSuccess,
    onError,
  });
};

const useJoinClass = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (class_id) => ClassService.joinClass(class_id),
    onSuccess,
    onError,
  });
};

const useLeaveClass = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (class_id) => ClassService.leaveClass(class_id),
    onSuccess,
    onError,
  });
};

const useGetClassMembers = (class_id, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["classMembers", class_id],
    queryFn: () => ClassService.getClassMembers(class_id),
    enabled: !!class_id,
    onSuccess,
    onError,
  });
};

export {
  useUploadClass,
  useListClasses,
  useListAllClasses,
  useDeleteClass,
  useUpdateTargetGrade,
  useUpdateShowInCalendar,
  useGetClassSchedules,
  useUpdateScheduleShowInCalendar,
  useUpdateSchedulesShowInCalendar,
  useJoinClass,
  useLeaveClass,
  useGetClassMembers
};
