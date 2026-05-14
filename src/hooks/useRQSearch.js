import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import SearchService from "../api/searchService";

const defaultError = (err) => {
  const message = err?.response?.data?.message;
  toast.error(message);
};

/**
 * Universal search hook
 * @param {Object} params - { query, type } where type is optional (users|clubs|classes)
 */
export const useUniversalSearch = (params = {}, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["universalSearch", params],
    queryFn: () => SearchService.universalSearch(params),
    enabled: (!!params.query && params.query.trim().length > 0) || !!params.educational_institution_id,
    onSuccess,
    onError,
  });
};

/**
 * Get trending students
 */
export const useTrendingStudents = (params = {}, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["trendingStudents", params],
    queryFn: () => SearchService.getTrendingStudents(params),
    onSuccess,
    onError,
  });
};

/**
 * Get popular clubs
 */
export const usePopularClubs = (params = {}, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["popularClubs", params],
    queryFn: () => SearchService.getPopularClubs(params),
    onSuccess,
    onError,
  });
};

/**
 * Get popular classes
 */
export const usePopularClasses = (params = {}, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["popularClasses", params],
    queryFn: () => SearchService.getPopularClasses(params),
    onSuccess,
    onError,
  });
};
