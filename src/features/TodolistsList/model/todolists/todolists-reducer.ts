import { appActions, RequestStatusType } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { clearTasksTodos } from "Common/Actions/commonActions";
import { ResultCodeEnum } from "features/TodolistsList/model/tasks/tasks-reducer";

import { createAppAsyncThunk } from "Common/utils/createAppAsyncThunk";
import { TodolistType } from "features/TodolistsList/api/todolists/todolistsApi.types";
import { todolistsAPI } from "features/TodolistsList/api/todolists/todolistApi";

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
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
      })
      .addCase(fetchTodolist.fulfilled, (state, action) => {
        /*return action.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle",
      }))*/
        //optional 1
        /* return action.payload.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle",
        }));*/
        action.payload.todolists.forEach((tl) => {
          state.push({ ...tl, filter: "all", entityStatus: "idle" });
        });
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const ourTodo = state.find((t) => t.id === action.payload.id);
        if (ourTodo) {
          ourTodo.title = action.payload.title;
        }
      });
  },
});

// thunks
const fetchTodolist = createAppAsyncThunk<{ todolists: TodolistType[] }, void>(
  `${slice.name}/fetchTodolist`,
  async () => {
    const res = await todolistsAPI.getTodolists();
    return { todolists: res.data };
  },
);

const removeTodolist = createAppAsyncThunk<string, { id: string }>(
  `${slice.name}/removeTodolist`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(todolistsActions.changeTodolistEntityStatus({ id: arg.id, entityStatus: "loading" }));
    const res = await todolistsAPI.deleteTodolist(arg.id).finally(() => {
      dispatch(todolistsActions.changeTodolistEntityStatus({ id: arg.id, entityStatus: "loading" }));
    });
    if (res.data.resultCode === ResultCodeEnum.success) {
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      return arg.id;
    } else {
      // serverAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  },
);

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, { title: string }>(
  `${slice.name}/addTodolist`,
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    const res = await todolistsAPI.createTodolist(arg.title);
    if (res.data.resultCode === ResultCodeEnum.success) {
      return { todolist: res.data.data.item };
    } else {
      return rejectWithValue(res.data);
    }
  },
);

const changeTodolistTitle = createAppAsyncThunk<{ id: string; title: string }, { id: string; title: string }>(
  `${slice.name}/changeTodolistTitle`,
  async (arg, {rejectWithValue}) => {
    const res = await todolistsAPI.updateTodolist(arg.id, arg.title);
    if (res.data.resultCode === ResultCodeEnum.success) {
      return { id: arg.id, title: arg.title };
    } else {
      return rejectWithValue(res.data);
    }
  },
);

// types
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};

export const todoListsThunks = { removeTodolist, addTodolist, fetchTodolist, changeTodolistTitle };
export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
