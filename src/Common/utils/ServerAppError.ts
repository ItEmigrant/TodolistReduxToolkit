import { Dispatch } from "redux";
import { appActions } from "app/app-reducer";
import { BaseResponseType } from "Common/types/commonTypes";

/**
 * Function to handle server errors.
 *
 * @template D - The type of data returned by the server.
 * @param {BaseResponseType<D>} data - The data returned by the server.
 * @param {Dispatch} dispatch - The function to dispatch actions to the Redux store.
 * @param {boolean} [showError=true] - Determines whether the function should display an error.
 *
 * @returns {void} Returns nothing.
 */
export const serverAppError = <D>(data: BaseResponseType<D>, dispatch: Dispatch, showError: boolean = true): void => {
  if (showError) {
    dispatch(appActions.setAppError({ error: data.messages.length ? data.messages[0] : '"Some error occurred"' }));
  }
  dispatch(appActions.setAppStatus({ status: "failed" }));
};
