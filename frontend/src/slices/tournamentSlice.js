import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchTournaments = createAsyncThunk('tournament/fetchAll', async () => {
  const response = await axios.get(`${API_URL}/tournaments`);
  return response.data.tournaments;
});

export const fetchTournamentById = createAsyncThunk('tournament/fetchById', async (id) => {
  const response = await axios.get(`${API_URL}/tournaments/${id}`);
  return response.data;
});

export const fetchTournamentBracket = createAsyncThunk('tournament/fetchBracket', async (id) => {
  const response = await axios.get(`${API_URL}/tournaments/${id}/bracket`);
  return response.data.bracket;
});

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState: {
    tournaments: [],
    currentTournament: null,
    bracket: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTournamentById.fulfilled, (state, action) => {
        state.currentTournament = action.payload;
      })
      .addCase(fetchTournamentBracket.fulfilled, (state, action) => {
        state.bracket = action.payload;
      });
  }
});

export default tournamentSlice.reducer;
