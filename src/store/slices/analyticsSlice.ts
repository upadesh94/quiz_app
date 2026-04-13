import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AnalyticsState = {
  averageScore: number;
  attemptsCount: number;
};

const initialState: AnalyticsState = {
  averageScore: 0,
  attemptsCount: 0,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalytics: (state, action: PayloadAction<AnalyticsState>) => {
      state.averageScore = action.payload.averageScore;
      state.attemptsCount = action.payload.attemptsCount;
    },
  },
});

export const { setAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
