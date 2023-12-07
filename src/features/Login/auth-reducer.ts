import { handleServerNetworkError } from "Common/utils/NetworkError";
import { AnyAction, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { appActions } from "app/app-reducer";
import { clearTasksTodos } from "Common/Actions/commonActions";
import { serverAppError } from "Common/utils/ServerAppError";
import { authAPI, LoginParamsType } from "features/Login/LoginApi";
import { createAppAsyncThunk } from "Common/utils/createAppAsyncThunk";
import { ResultCodeEnum } from "features/TodolistsList/model/tasks/tasks-reducer";
import { thunkTryCatch } from "Common/utils/ThunkTryCatch";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action: AnyAction) => {
        return isAnyOf(
          authThunks.login.fulfilled,
          authThunks.logout.fulfilled,
          authThunks.initializeApp.fulfilled,
        )(action);
      },
      (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn;
      },
    );
  },
});

//thunks
const initializeApp = createAppAsyncThunk<
  {
    isLoggedIn: boolean;
  },
  undefined
>(`${slice.name}/initializeApp`, async (_, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  return thunkTryCatch(thunkAPI, async () => {
    const res = await authAPI.me();
    if (res.data.resultCode === ResultCodeEnum.success) {
      return { isLoggedIn: true };
    } else {
      //serverAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  }).finally(() => {
    dispatch(appActions.setAppInitialized({ isInitialized: true }));
  });
});

/*
const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
  `${slice.name}/initializeApp`,
  async (_, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      const res = await authAPI.me();
      if (res.data.resultCode === ResultCodeEnum.success) {
        return { isLoggedIn: true };
      } else {
        // serverAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (err) {
      handleServerNetworkError(err, dispatch);
      return rejectWithValue(null);
    } finally {
      dispatch(appActions.setAppInitialized({ isInitialized: true }));
    }
  },
);
*/

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
      const isShowAppError = !res.data.fieldsErrors.length;

      serverAppError(res.data, dispatch, isShowAppError);
      return rejectWithValue(res.data);
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

export const authThunks = { login, logout, initializeApp };
