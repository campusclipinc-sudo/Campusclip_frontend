import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  club: { hasUnread: false, byClub: {} },
  class: { hasUnread: false, byClass: {} },
  privateChat: {},
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationSummary: (state, { payload }) => payload || initialState,
    resetNotificationSummary: () => initialState,
  },
});

export const { setNotificationSummary, resetNotificationSummary } = notificationSlice.actions;

export const selectNotificationSummary = (state) => state.notifications || initialState;
export const selectClubNotifications = (state) =>
  state.notifications?.club || initialState.club;
export const selectClassNotifications = (state) =>
  state.notifications?.class || initialState.class;
export const selectPrivateChatNotifications = (state) =>
  state.notifications?.privateChat || initialState.privateChat;
export const selectPrivateChatTotalCount = (state) =>
  Object.values(selectPrivateChatNotifications(state)).reduce(
    (sum, count) => sum + Number(count || 0),
    0
  );
export const selectPrivateChatCountByUser = (state, userId) =>
  Number(selectPrivateChatNotifications(state)[userId] || 0);

export default notificationSlice.reducer;
