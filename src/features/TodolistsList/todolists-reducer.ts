import { todolistsAPI, TodolistType } from "api/todolists-api";
import { appActions, RequestStatusType } from "app/app-reducer";
import { handleServerNetworkError } from "utils/error-utils";
import { AppThunk } from "app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchTasksTC } from "features/TodolistsList/tasks-reducer";

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
      /*const index = state.findIndex((tl) => tl.id === action.payload.id);*/
      /* state[index].filter = action.payload.filter;*/
      const ourTodo = state.find((tl) => tl.id === action.payload.id);
      if (ourTodo) {
        ourTodo.filter = action.payload.filter;
      }
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>) => {
      /*return state.map((tl) => (tl.id === action.id ? { ...tl, entityStatus: action.status } : tl));*/
      const ourTodo = state.find((tl) => tl.id === action.payload.id);
      if (ourTodo) {
        ourTodo.entityStatus = action.payload.entityStatus;
      }
    },
    setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
      /*return action.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle",
      }))*/
      //optional 1
      /* return action.payload.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle",
      }));*/
      action.payload.todolists.forEach((tl) => {
        state.push({ ...tl, filter: "all", entityStatus: "idle" });
      });
    },
    clearTodosData: (state) => {
      return [];
    },
  },
});

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));

    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({ todolists: res.data }));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return res.data;
      })
      .then((todos) => {
        todos.forEach((tl) => {
          dispatch(fetchTasksTC(tl.id));
        });
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};

export const removeTodolistTC = (id: string): AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({ status: "loading" }));
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistsActions.changeTodolistEntityStatus({ id, entityStatus: "loading" }));

    todolistsAPI.deleteTodolist(id).then(() => {
      dispatch(todolistsActions.removeTodolist({ id }));
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then(() => {
      dispatch(todolistsActions.changeTodolistTitle({ id, title }));
    });
  };
};

// types
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
