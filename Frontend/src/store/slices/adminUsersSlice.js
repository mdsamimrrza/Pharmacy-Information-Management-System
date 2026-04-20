import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createUser, getApiMessage, listUsers } from '../../api/pimsApi';

export const fetchAdminUsers = createAsyncThunk(
  'adminUsers/fetchAdminUsers',
  async (params = {}, thunkApi) => {
    try {
      const data = await listUsers(params);
      const limit = Number(params?.limit) || 20;
      return {
        items: data?.users || [],
        pagination: data?.pagination || {
          page: Number(params?.page) || 1,
          limit,
          total: 0,
          totalPages: 1
        }
      };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiMessage(error, 'Failed to load users'));
    }
  }
);

export const createAdminUser = createAsyncThunk(
  'adminUsers/createAdminUser',
  async (payload, thunkApi) => {
    try {
      const data = await createUser(payload);
      return data?.user || null;
    } catch (error) {
      return thunkApi.rejectWithValue(getApiMessage(error, 'Failed to create user'));
    }
  }
);

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    },
    isLoading: false,
    isSubmitting: false,
    errorMessage: ''
  },
  reducers: {
    clearAdminUsersError(state) {
      state.errorMessage = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = '';
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.items || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || 'Failed to load users';
      })
      .addCase(createAdminUser.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.errorMessage = '';
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.isSubmitting = false;
        state.errorMessage = action.payload || 'Failed to create user';
      });
  }
});

export const { clearAdminUsersError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;