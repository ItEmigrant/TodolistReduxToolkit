import { AnyAction, createSlice, isAnyOf, isFulfilled, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit";
import { authThunks } from "features/Login/auth-reducer";

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
  extraReducers: (builder) => {
    builder
      .addMatcher(isPending, (state) => {
        state.status = "loading";
      })
      .addMatcher(isRejected, (state, action: AnyAction) => {
        state.status = "failed";
        if (action.payload) {
          if (
            action.type.includes("addTodolist") ||
            action.type.includes("addTask") ||
            action.type.includes("initializeApp")
          )
            return;

          state.error = action.payload.messages[0];
        } else {
          state.error = action.error.message ? action.error.message : "Some Error!";
        }
      })
      .addMatcher(isFulfilled, (state) => {
        state.status = "succeeded";
      })
      .addMatcher(isAnyOf(authThunks.initializeApp.fulfilled, authThunks.initializeApp.rejected), (state) => {
        state.isInitialized = true;
      });
  },
});

export const appReducer = slice.reducer;
export const appActions = slice.actions;

//types
export type InitialStateType = ReturnType<typeof slice.getInitialState>;
export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";
