import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getApiMessage,
  getPrescription,
  listPrescriptions,
  updatePrescriptionStatus
} from '../../api/pimsApi';

export const fetchPrescriptions = createAsyncThunk(
  'prescriptions/fetchPrescriptions',
  async (params = {}, thunkApi) => {
    try {
      const data = await listPrescriptions(params);
      return {
        items: data?.prescriptions || [],
        pagination: data?.pagination || {
          page: Number(params.page || 1),
          limit: Number(params.limit || 20),
          total: 0,
          totalPages: 1
        }
      };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiMessage(error, 'Failed to load prescriptions'));
    }
  }
);

export const fetchPrescriptionDetail = createAsyncThunk(
  'prescriptions/fetchPrescriptionDetail',
  async (id, thunkApi) => {
    try {
      const data = await getPrescription(id);
      return data?.prescription || null;
    } catch (error) {
      return thunkApi.rejectWithValue(getApiMessage(error, 'Failed to load prescription detail'));
    }
  }
);

export const updatePrescriptionStatusById = createAsyncThunk(
  'prescriptions/updatePrescriptionStatusById',
  async ({ id, status }, thunkApi) => {
    try {
      const data = await updatePrescriptionStatus(id, { status });
      return data?.prescription;
    } catch (error) {
      return thunkApi.rejectWithValue(getApiMessage(error, 'Failed to update prescription status'));
    }
  }
);

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    },
    selected: null,
    isLoading: false,
    isDetailLoading: false,
    isUpdating: false,
    errorMessage: ''
  },
  reducers: {
    clearPrescriptionsError(state) {
      state.errorMessage = '';
    },
    setSelectedPrescriptionFallback(state, action) {
      state.selected = action.payload || null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = '';
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.items || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || 'Failed to load prescriptions';
      })
      .addCase(fetchPrescriptionDetail.pending, (state) => {
        state.isDetailLoading = true;
      })
      .addCase(fetchPrescriptionDetail.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.selected = action.payload || null;
      })
      .addCase(fetchPrescriptionDetail.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.errorMessage = action.payload || state.errorMessage;
      })
      .addCase(updatePrescriptionStatusById.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updatePrescriptionStatusById.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.errorMessage = '';
        state.items = state.items.map((record) => (
          record._id === action.payload?._id ? action.payload : record
        ));
        state.selected = action.payload || state.selected;
      })
      .addCase(updatePrescriptionStatusById.rejected, (state, action) => {
        state.isUpdating = false;
        state.errorMessage = action.payload || 'Failed to update prescription status';
      });
  }
});

export const { clearPrescriptionsError, setSelectedPrescriptionFallback } = prescriptionsSlice.actions;
export default prescriptionsSlice.reducer;