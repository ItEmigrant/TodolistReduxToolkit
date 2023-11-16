import { handleServerNetworkError } from "Common/utils/NetworkError";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appActions } from "app/app-reducer";
import { clearTasksTodos } from "Common/Actions/commonActions";
import { serverAppError } from "Common/utils/ServerAppError";
import { authAPI, LoginParamsType } from "features/Login/LoginApi";
import { createAppAsyncThunk } from "Common/utils/createAppAsyncThunk";
import { ResultCodeEnum } from "features/TodolistsList/tasks-reducer";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedInAC: (
      state,
      action: PayloadAction<{
        isLoggedIn: boolean;
      }>,
    ) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn;
        // return { ...state, isLoggedIn: action.value };
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn;
      });
  },
});

//thunks
const login = createAppAsyncThunk<
  {
    isLoggedIn: boolean;
  },
  LoginParamsType
>(`${slice.name}/login`, async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    const res = await authAPI.login(arg);

    if (res.data.resultCode === ResultCodeEnum.success) {
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      return { isLoggedIn: true };
      /*    dispatch(appActions.setAppStatus({ status: "succeeded" }));*/
    } else {
      serverAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  } catch (err) {
    handleServerNetworkError(err, dispatch);
    return rejectWithValue(null);
  }
});

const logout = createAppAsyncThunk<
  {
    isLoggedIn: boolean;
  },
  undefined
>(`${slice.name}/logout`, async (_, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    const res = await authAPI.logout();
    if (res.data.resultCode === ResultCodeEnum.success) {
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      dispatch(clearTasksTodos());
      return { isLoggedIn: false };
    } else {
      serverAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  } catch (err) {
    handleServerNetworkError(err, dispatch);
    return rejectWithValue(null);
  }
});

export const authReducer = slice.reducer;
export const authActions = slice.actions;
export const authThunks = { login, logout };
