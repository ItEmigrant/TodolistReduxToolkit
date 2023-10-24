import { appActions, RequestStatusType } from "app/app-reducer";
import { handleServerNetworkError } from "Common/utils/NetworkError";
import { AppThunk } from "app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { clearTasksTodos } from "Common/Actions/commonActions";
import { ResultCodeEnum, tasksThunks } from "features/TodolistsList/tasks-reducer";
import { todolistsAPI, TodolistType } from "features/TodolistsList/todolistApi";
import { createAppAsyncThunk } from "Common/utils/createAppAsyncThunk";
import { serverAppError } from "Common/utils/ServerAppError";

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
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
    changeTodolistFilter: (
      state,
      action: PayloadAction<{
        id: string;
        filter: FilterValuesType;
      }>,
    ) => {
      /*return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
       */
      /*const index = state.findIndex((tl) => tl.id === action.payload.id);*/
      /* state[index].filter = action.payload.filter;*/
      const ourTodo = state.find((tl) => tl.id === action.payload.id);
      if (ourTodo) {
        ourTodo.filter = action.payload.filter;
      }
    },
    changeTodolistEntityStatus: (
      state,
      action: PayloadAction<{
        id: string;
        entityStatus: RequestStatusType;
      }>,
    ) => {
      /*return state.map((tl) => (tl.id === action.id ? { ...tl, entityStatus: action.status } : tl));*/
      const ourTodo = state.find((tl) => tl.id === action.payload.id);
      if (ourTodo) {
        ourTodo.entityStatus = action.payload.entityStatus;
      }
    },
    setTodolists: (
      state,
      action: PayloadAction<{
        todolists: TodolistType[];
      }>,
    ) => {
      /*return action.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle",
      }))*/
      //optional 1
      /* return action.payload.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle",
      }));*/
      action.payload.todolists.forEach((tl) => {
        state.push({ ...tl, filter: "all", entityStatus: "idle" });
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearTasksTodos, () => {
        return [];
      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        // state.filter((tl) => tl.id !== action.payload.id);
        const index = state.findIndex((todolists) => todolists.id === action.payload);
        if (index !== -1) state.splice(index, 1);
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        //  return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state];
        const newTodolist: TodolistDomainType = { ...action.payload.todolist, filter: "all", entityStatus: "idle" };
        state.unshift(newTodolist);
        //state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
      });
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
          dispatch(tasksThunks.fetchTasks(tl.id));
        });
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};

const removeTodolist = createAppAsyncThunk<
  string,
  {
    id: string;
  }
>(`${slice.name}/removeTodolist`, async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    dispatch(todolistsActions.changeTodolistEntityStatus({ id: arg.id, entityStatus: "loading" }));
    const res = await todolistsAPI.deleteTodolist(arg.id);
    if (res.data.resultCode === ResultCodeEnum.success) {
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      return arg.id;
    } else {
      serverAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  } catch (err) {
    handleServerNetworkError(err, dispatch);
    return rejectWithValue(null);
  }
});
const addTodolist = createAppAsyncThunk<
  {
    todolist: TodolistType;
  },
  {
    title: string;
  }
>(`${slice.name}/addTodolist`, async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    const res = await todolistsAPI.createTodolist(arg.title);
    if (res.data.resultCode === ResultCodeEnum.success) {
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      return { todolist: res.data.data.item };
    } else {
      serverAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  } catch (err) {
    handleServerNetworkError(err, dispatch);
    return rejectWithValue(null);
  }
});
/*export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};*/
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

export const todoListsThunks = { removeTodolist, addTodolist };
export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
