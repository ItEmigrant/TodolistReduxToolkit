import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { AppDispatch, AppRootStateType } from "app/store";
import { BaseResponseType } from "Common/types";
import { appActions } from "app/app-reducer";
import { handleServerNetworkError } from "Common/utils/NetworkError";

/**
 * A utility function to handle common thunk operations such as loading state, error handling, and idle state.
 *
 * @async
 * @function thunkTryCatch
 * @template T The type of the returned promise from the logic function.
 * @param {BaseThunkAPI<AppRootStateType, unknown, AppDispatch, null | BaseResponseType>} thunkAPI - The thunk API object.
 * @param {() => Promise<T>} logic - The logic function that returns a promise.
 * @returns {Promise<T | ReturnType<typeof //thunkAPI.rejectWithValue>>} - Returns the result of the logic function or rejects with value if an error occurs.
 * @throws Will throw an error if the logic function fails.
 */
export const thunkTryCatch = async <T>(
  thunkAPI: BaseThunkAPI<AppRootStateType, unknown, AppDispatch, null | BaseResponseType>,
  logic: () => Promise<T>,
): Promise<T | ReturnType<typeof thunkAPI.rejectWithValue>> => {
  const { dispatch, rejectWithValue } = thunkAPI;
  dispatch(appActions.setAppStatus({ status: "loading" }));
  try {
    return await logic();
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  } finally {
    dispatch(appActions.setAppStatus({ status: "idle" }));
  }
};
