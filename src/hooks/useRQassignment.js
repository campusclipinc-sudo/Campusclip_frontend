import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AssignmentService from "../api/assignmentService";

const defaultOnError = () => {};

const useListAssignments = (params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["assignments", params],
    queryFn: () => AssignmentService.list(params),
    onSuccess,
    onError,
  });
};

const useGetAssignment = (id, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["assignment", id],
    queryFn: () => AssignmentService.get(id),
    enabled: Boolean(id),
    onSuccess,
    onError,
  });
};

const useCreateAssignment = (onSuccess, onError = defaultOnError) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => AssignmentService.create(payload),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      onSuccess?.(data, variables);
    },
    onError,
  });
};

const useUpdateAssignment = (onSuccess, onError = defaultOnError) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => AssignmentService.update(payload),
    onSuccess: (data, variables) => {
      if (variables?.id)
        qc.invalidateQueries({ queryKey: ["assignment", variables.id] });
      qc.invalidateQueries({ queryKey: ["assignments"] });
      onSuccess?.(data, variables);
    },
    onError,
  });
};

const useDeleteAssignment = (onSuccess, onError = defaultOnError) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AssignmentService.remove(id),
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: ["assignment", id] });
      qc.invalidateQueries({ queryKey: ["assignments"] });
      onSuccess?.(data, id);
    },
    onError,
  });
};

const useRestoreAssignment = (onSuccess, onError = defaultOnError) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AssignmentService.restore(id),
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: ["assignment", id] });
      qc.invalidateQueries({ queryKey: ["assignments"] });
      onSuccess?.(data, id);
    },
    onError,
  });
};

export {
  useListAssignments,
  useGetAssignment,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useRestoreAssignment,
};
