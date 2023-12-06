import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "app",
  initialState: {
    status: "idle" as RequestStatusType,
    error: null as string | null,
    isInitialized: false,
  },
  reducers: {
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      /* return { ...state, error: action.error };*/
      state.error = action.payload.error;
    },
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      //return { ...state, status: action.status };
      state.status = action.payload.status;
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      // return { ...state, isInitialized: action.value };
      state.isInitialized = action.payload.isInitialized;
    },
  },
/*  extraReducers: (builder) => {
    builder.addMatcher(()=>{}, (state, action)=>{})
  }*/
});

export const appReducer = slice.reducer;
export const appActions = slice.actions;

//types
export type InitialStateType = ReturnType<typeof slice.getInitialState>;
export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";
