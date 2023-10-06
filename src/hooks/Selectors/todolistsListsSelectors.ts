import { AppRootStateType } from "app/store";

export const selectTodosIsLoggedIn = (state: AppRootStateType) => state.auth.isLoggedIn;
export const selectTodosTasks = (state: AppRootStateType) => state.tasks;
export const selectTodoLists = (state: AppRootStateType) => state.todolists;