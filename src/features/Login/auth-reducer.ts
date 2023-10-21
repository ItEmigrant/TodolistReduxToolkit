import {handleServerNetworkError } from "Common/utils/NetworkError";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "app/store";
import { appActions } from "app/app-reducer";
import { clearTasksTodos } from "Common/Actions/commonActions";
import { serverAppError } from "Common/utils/ServerAppError";
import { authAPI, LoginParamsType } from "features/Login/LoginApi";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedInAC: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      // return { ...state, isLoggedIn: action.value };
      state.isLoggedIn = action.payload.isLoggedIn;
    },
  },
});

// actions

// thunks
export const loginTC =
  (data: LoginParamsType): AppThunk =>
  (dispatch) => {
    authAPI
      .login(data)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(authActions.setIsLoggedInAC({ isLoggedIn: true }));
          dispatch(appActions.setAppStatus({ status: "succeeded" }));
          /*    dispatch(appActions.setAppStatus({ status: "succeeded" }));*/
        } else {
          serverAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
export const logoutTC = (): AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({ status: "loading" }));
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(authActions.setIsLoggedInAC({ isLoggedIn: false }));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        dispatch(clearTasksTodos());
      } else {
        serverAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};
export const authReducer = slice.reducer;
export const authActions = slice.actions;
