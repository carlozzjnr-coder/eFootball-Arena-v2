import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchRankings = createAsyncThunk('ranking/fetchAll', async (page = 1) => {
  const response = await axios.get(`${API_URL}/rankings?page=${page}`);
  return response.data.rankings;
});

const rankingSlice = createSlice({
  name: 'ranking',
  initialState: {
    rankings: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRankings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRankings.fulfilled, (state, action) => {
        state.loading = false;
        state.rankings = action.payload;
      })
      .addCase(fetchRankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default rankingSlice.reducer;
