import { ResponseType } from "api/todolists-api";
import { Dispatch } from "redux";
import { appActions } from "app/app-reducer";

export const serverAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
  if (data.messages.length) {
    /*dispatch(setAppErrorAC(data.messages[0]));*/
    dispatch(appActions.setAppError({ error: data.messages[0] }));
  } else {
    dispatch(appActions.setAppError({ error: "Some error occurred" }));
  }

  dispatch(appActions.setAppStatus({ status: "failed" }));
};