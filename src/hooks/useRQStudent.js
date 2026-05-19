import { useQuery } from "@tanstack/react-query";
import StudentService from "../api/studentService";

const defaultOnError = () => {};

const useListAllStudents = (params = {}, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["all-students", params],
    queryFn: () => StudentService.listAll(params),
    onSuccess,
    onError,
  });
};

const useGetStudentProfile = (userId, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["student-profile", userId],
    queryFn: () => StudentService.getStudentProfile(userId),
    enabled: !!userId,
    onSuccess,
    onError,
  });
};

const useGetUserClasses = (userId, enabled = true, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["user-classes", userId],
    queryFn: () => StudentService.getUserClasses(userId),
    enabled: !!userId && enabled,
    onSuccess,
    onError,
  });
};

const useGetUserClubs = (userId, enabled = true, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["user-clubs", userId],
    queryFn: () => StudentService.getUserClubs(userId),
    enabled: !!userId && enabled,
    onSuccess,
    onError,
  });
};

export {
  useListAllStudents,
  useGetStudentProfile,
  useGetUserClasses,
  useGetUserClubs,
};

