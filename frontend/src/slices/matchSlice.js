import { createSlice } from '@reduxjs/toolkit';

const matchSlice = createSlice({
  name: 'match',
  initialState: {
    matches: [],
    currentMatch: null,
    loading: false,
    error: null
  }
});

export default matchSlice.reducer;
