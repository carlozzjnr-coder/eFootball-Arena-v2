import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import playerReducer from './slices/playerSlice';
import tournamentReducer from './slices/tournamentSlice';
import matchReducer from './slices/matchSlice';
import rankingReducer from './slices/rankingSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    tournament: tournamentReducer,
    match: matchReducer,
    ranking: rankingReducer,
    ui: uiReducer
  }
});

export default store;
