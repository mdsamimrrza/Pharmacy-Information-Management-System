import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  acknowledgeAlert,
  dismissAlert,
  getApiMessage,
  listAlerts
} from '../../api/pimsApi';

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (params = {}, thunkApi) => {
    try {
      const data = await listAlerts(params);
      const limit = Number(params?.limit) || 20;
      return {
        items: data?.alerts || [],
        pagination: data?.pagination || {
          page: Number(params?.page) || 1,
          limit,
          total: 0,
          totalPages: 1
        }
      };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiMessage(error, 'Failed to load alerts'));
    }
  }
);

export const acknowledgeAlertById = createAsyncThunk(
  'alerts/acknowledgeAlertById',
  async (id, thunkApi) => {
    try {
      const data = await acknowledgeAlert(id);
      return data?.alert;
    } catch (error) {
      return thunkApi.rejectWithValue(getApiMessage(error, 'Failed to acknowledge alert'));
    }
  }
);

export const dismissAlertById = createAsyncThunk(
  'alerts/dismissAlertById',
  async (id, thunkApi) => {
    try {
      const data = await dismissAlert(id);
      return data?.alert;
    } catch (error) {
      return thunkApi.rejectWithValue(getApiMessage(error, 'Failed to dismiss alert'));
    }
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    },
    isLoading: false,
    isUpdating: false,
    errorMessage: ''
  },
  reducers: {
    clearAlertsError(state) {
      state.errorMessage = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = '';
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.items || [];
        state.pagination = action.payload?.pagination || state.pagination;
        state.errorMessage = '';
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || 'Failed to load alerts';
      })
      .addCase(acknowledgeAlertById.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(acknowledgeAlertById.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.errorMessage = '';
        state.items = state.items.map((alert) => (
          alert._id === action.payload?._id ? action.payload : alert
        ));
      })
      .addCase(acknowledgeAlertById.rejected, (state, action) => {
        state.isUpdating = false;
        state.errorMessage = action.payload || 'Failed to acknowledge alert';
      })
      .addCase(dismissAlertById.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(dismissAlertById.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.errorMessage = '';
        state.items = state.items.map((alert) => (
          alert._id === action.payload?._id ? action.payload : alert
        ));
      })
      .addCase(dismissAlertById.rejected, (state, action) => {
        state.isUpdating = false;
        state.errorMessage = action.payload || 'Failed to dismiss alert';
      });
  }
});

export const { clearAlertsError } = alertsSlice.actions;
export default alertsSlice.reducer;