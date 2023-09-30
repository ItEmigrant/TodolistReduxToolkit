import { todolistsAPI, TodolistType } from "api/todolists-api";
import { Dispatch } from "redux";
import { appActions, RequestStatusType } from "app/app-reducer";
import { handleServerNetworkError } from "utils/error-utils";
import { AppThunk } from "app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    removeTodolist: (
      state,
      action: PayloadAction<{
        id: string;
      }>,
    ) => {
      // state.filter((tl) => tl.id !== action.payload.id);
      const index = state.findIndex((todolists) => todolists.id === action.payload.id);
      if (index !== -1) state.splice(index, 1);
    },
    addTodolist: (
      state,
      action: PayloadAction<{
        todolist: TodolistType;
      }>,
    ) => {
      //  return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state];
      const newTodolist: TodolistDomainType = { ...action.payload.todolist, filter: "all", entityStatus: "idle" };
      state.unshift(newTodolist);
      //state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
    },
    changeTodolistTitle: (
      state,
      action: PayloadAction<{
        id: string;
        title: string;
      }>,
    ) => {
      /* return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl))*/
      /* const index = state.findIndex((todolists) => todolists.id === action.payload.id);
       if (index !== -1) state[index].title = action.payload.title;*/
      const ourTodo = state.find((t) => t.id === action.payload.id);
      if (ourTodo) {
        ourTodo.title = action.payload.title;
      }
    },
    changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      /*return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
       */
      const index = state.findIndex((tl) => tl.id === action.payload.id);
     /* state[index].filter = action.payload.filter;*/
      const ourTodo = state.find((tl) => tl.id === action.payload.id);
      if (ourTodo) {
        ourTodo.filter = action.payload.filter;
      }
    },
  },
});

/*export const todolistsReducer = (
  state: Array<TodolistDomainType> = initialState,
  action: ActionsType,
): Array<TodolistDomainType> => {
  switch (action.type) {
    
    case "CHANGE-TODOLIST-FILTER":
      return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl));
    case "CHANGE-TODOLIST-ENTITY-STATUS":
      return state.map((tl) => (tl.id === action.id ? { ...tl, entityStatus: action.status } : tl));
    case "SET-TODOLISTS":
      return action.todolists.map((tl) => ({
        ...tl,
        filter: "all",
        entityStatus: "idle",
      }));
    default:
      return state;
  }
};*/

// actions

export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) =>
  ({
    type: "CHANGE-TODOLIST-FILTER",
    id,
    filter,
  }) as const;
export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) =>
  ({
    type: "CHANGE-TODOLIST-ENTITY-STATUS",
    id,
    status,
  }) as const;
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({ type: "SET-TODOLISTS", todolists }) as const;

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));

    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(setTodolistsAC(res.data));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};

export const removeTodolistTC = (todolistId: string) => {
  return (dispatch: ThunkDispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({ status: "loading" }));
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(changeTodolistEntityStatusAC(todolistId, "loading"));
    todolistsAPI.deleteTodolist(todolistId).then(() => {
      dispatch(removeTodolistAC(todolistId));
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const addTodolistTC = (title: string) => {
  return (dispatch: ThunkDispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(addTodolistAC(res.data.data.item));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const changeTodolistTitleTC = (id: string, title: string) => {
  return (dispatch: Dispatch<ActionsType>) => {
    todolistsAPI.updateTodolist(id, title).then(() => {
      dispatch(changeTodolistTitleAC(id, title));
    });
  };
};

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
type ActionsType =
  | RemoveTodolistActionType
  | AddTodolistActionType
  | ReturnType<typeof changeTodolistTitleAC>
  | ReturnType<typeof changeTodolistFilterAC>
  | SetTodolistsActionType
  | ReturnType<typeof changeTodolistEntityStatusAC>;
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};
type ThunkDispatch = any;

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
