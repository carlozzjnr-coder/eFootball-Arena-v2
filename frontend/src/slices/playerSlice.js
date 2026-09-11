import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    profile: null,
    stats: null,
    loading: false,
    error: null
  }
});

export default playerSlice.reducer;
