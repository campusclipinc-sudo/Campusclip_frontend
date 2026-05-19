import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArchiveService } from "../api/archiveService";

/**
 * Default error handler to display error messages using react-toastify.
 * @param {object} err - The error object from the mutation.
 */
const defaultError = () => {};

/**
 * Hook to get all archives for the user
 */
const useGetUserArchives = (onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["archives"],
    queryFn: () => ArchiveService.getUserArchives(),
    onSuccess,
    onError,
  });
};

/**
 * Hook to get a specific archive by ID
 */
const useGetArchiveById = (archiveId, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["archive", archiveId],
    queryFn: () => ArchiveService.getArchiveById(archiveId),
    enabled: Boolean(archiveId),
    onSuccess,
    onError,
  });
};

/**
 * Hook to create a new archive
 */
const useCreateArchive = (onSuccess, onError = defaultError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archiveData) => ArchiveService.createArchive(archiveData),
    onSuccess: (data) => {
      // Invalidate archives query to refetch the list
      queryClient.invalidateQueries(["archives"]);
      queryClient.invalidateQueries(["classes"]); // Classes may now be archived

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

/**
 * Hook to add classes to an archive
 */
const useAddClassesToArchive = (onSuccess, onError = defaultError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ archiveId, classIds }) =>
      ArchiveService.addClassesToArchive(archiveId, classIds),
    onSuccess: (data, variables) => {
      // Invalidate the specific archive and archives list
      queryClient.invalidateQueries(["archive", variables.archiveId]);
      queryClient.invalidateQueries(["archives"]);
      queryClient.invalidateQueries(["classes"]);

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

/**
 * Hook to remove classes from an archive
 */
const useRemoveClassesFromArchive = (onSuccess, onError = defaultError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ archiveId, classIds }) =>
      ArchiveService.removeClassesFromArchive(archiveId, classIds),
    onSuccess: (data, variables) => {
      // Invalidate the specific archive and archives list
      queryClient.invalidateQueries(["archive", variables.archiveId]);
      queryClient.invalidateQueries(["archives"]);
      queryClient.invalidateQueries(["classes"]);

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

/**
 * Hook to update archive details
 */
const useUpdateArchive = (onSuccess, onError = defaultError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ archiveId, updates }) =>
      ArchiveService.updateArchive(archiveId, updates),
    onSuccess: (data, variables) => {
      // Invalidate the specific archive and archives list
      queryClient.invalidateQueries(["archive", variables.archiveId]);
      queryClient.invalidateQueries(["archives"]);

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

/**
 * Hook to delete an archive
 */
const useDeleteArchive = (onSuccess, onError = defaultError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archiveId) => ArchiveService.deleteArchive(archiveId),
    onSuccess: (data) => {
      // Invalidate archives list
      queryClient.invalidateQueries(["archives"]);
      queryClient.invalidateQueries(["classes"]);

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

export {
  useGetUserArchives,
  useGetArchiveById,
  useCreateArchive,
  useAddClassesToArchive,
  useRemoveClassesFromArchive,
  useUpdateArchive,
  useDeleteArchive,
};
