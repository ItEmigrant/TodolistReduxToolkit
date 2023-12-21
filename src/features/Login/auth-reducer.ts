import { AnyAction, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { serverAppError } from "Common/utils/ServerAppError";
import { authAPI, LoginParamsType, securityAPI } from "features/Login/LoginApi";
import { createAppAsyncThunk } from "Common/utils/createAppAsyncThunk";
import { ResultCodeEnum } from "features/TodolistsList/model/tasks/tasks-reducer";
import { clearTasksTodos } from "Common/Actions/commonActions";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    captchaUrl: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCaptchaUrl.fulfilled, (state, action) => {
      state.captchaUrl = action.payload.captchaUrl;
    });
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
>(`${slice.name}/initializeApp`, async (_, { rejectWithValue }) => {
  const res = await authAPI.me();
  if (res.data.resultCode === ResultCodeEnum.success) {
    return { isLoggedIn: true };
  } else {
    return rejectWithValue(res.data);
  }
});

const login = createAppAsyncThunk<
  {
    isLoggedIn: boolean;
  },
  LoginParamsType
>(`${slice.name}/login`, async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  const res = await authAPI.login(arg);
  if (res.data.resultCode === ResultCodeEnum.success) {
    return { isLoggedIn: true };
  } else {
    if (res.data.resultCode === ResultCodeEnum.captcha) {
      dispatch(getCaptchaUrl());
    }
    return rejectWithValue(res.data);
  }
});

const logout = createAppAsyncThunk<
  {
    isLoggedIn: boolean;
  },
  undefined
>(`${slice.name}/logout`, async (_, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;

  const res = await authAPI.logout();
  if (res.data.resultCode === ResultCodeEnum.success) {
    dispatch(clearTasksTodos());
    return { isLoggedIn: false };
  } else {
    serverAppError(res.data, dispatch);
    return rejectWithValue(res.data);
  }
});

const getCaptchaUrl = createAppAsyncThunk<
  {
    captchaUrl: string;
  },
  undefined
>(`${slice.name}/getCaptchaUrl`, async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  const res = await securityAPI.getCaptchaUrl();
  if (res.data) {
    return { captchaUrl: res.data.url };
  } else {
    return rejectWithValue(res.data);
  }
});

export const authReducer = slice.reducer;

export const authThunks = { login, logout, initializeApp, getCaptchaUrl };
