import { useMutation } from '@tanstack/react-query';
import client from '../libs/HttpClients';

const useUpdateThemeColor = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async ({ clubId, themeColor }) => {
      const response = await client.put(`/club/theme/${clubId}`, {
        theme_color: themeColor,
      });
      return response.data;
    },
    onSuccess,
    onError,
  });
};

export default useUpdateThemeColor;
