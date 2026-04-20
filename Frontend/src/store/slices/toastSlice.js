import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    items: []
  },
  reducers: {
    pushToast(state, action) {
      const id = action.payload?.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      state.items.push({
        id,
        type: action.payload?.type || 'info',
        title: action.payload?.title || 'Notice',
        message: action.payload?.message || '',
        duration: Number(action.payload?.duration || 3600)
      });
    },
    removeToast(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearToasts(state) {
      state.items = [];
    }
  }
});

export const { pushToast, removeToast, clearToasts } = toastSlice.actions;
export default toastSlice.reducer;