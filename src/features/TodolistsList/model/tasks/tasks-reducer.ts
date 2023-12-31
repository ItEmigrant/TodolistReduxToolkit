import { createSlice } from "@reduxjs/toolkit";
import { todoListsThunks } from "features/TodolistsList/model/todolists/todolists-reducer";
import { clearTasksTodos } from "Common/Actions/commonActions";
import { createAppAsyncThunk } from "Common/utils/createAppAsyncThunk";
import { serverAppError } from "Common/utils/ServerAppError";

import { TaskPriorities, TaskStatuses } from "Common/Enum/enum";
import { TaskType, UpdateTaskModelType } from "features/TodolistsList/api/tasks/tasksApi.types";

import { ArgUpdateTask } from "features/TodolistsList/api/todolists/todolistsApi.types";
import { tasksApi } from "features/TodolistsList/api/tasks/tasksApi";

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        //return { ...state, [action.todolistId]: action.tasks };
        state[action.payload.todolistId] = action.payload.tasks;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        /* return {
          ...state,
          [action.task.todoListId]: [action.task, ...state[action.task.todoListId]],
        };*/
        state[action.payload.task.todoListId].unshift(action.payload.task);
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        /* return {
           ...state,
           [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId),
         }*/
        /*const TaskIndex = state[action.payload.todolistId].findIndex((tasks) => tasks.id === action.payload.taskId);
        if (TaskIndex === -1) state[action.payload.todolistId].slice(TaskIndex, 1);*/
        let TaskForTodo = state[action.payload.todolistId];
        const index = TaskForTodo.findIndex((t) => t.id === action.payload.taskId);
        if (index !== -1) TaskForTodo.splice(index, 1);
        /* state[action.payload.todolistId].splice(Number(action.payload.taskId), 1);*/
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        let ourTaskIndex = state[action.payload.todolistId].findIndex((t) => {
          return t.id === action.payload.taskId;
        });
        if (ourTaskIndex !== -1) {
          state[action.payload.todolistId][ourTaskIndex] = {
            ...state[action.payload.todolistId][ourTaskIndex],
            ...action.payload.domainModel,
          };
        }
      })
      .addCase(todoListsThunks.addTodolist.fulfilled, (state, action) => {
        // return { ...state, [action.todolist.id]: [] };
        state[action.payload.todolist.id] = [];
      })
      .addCase(todoListsThunks.removeTodolist.fulfilled, (state, action) => {
        // const copyState = { ...state };
        //delete copyState[action.id];
        // return copyState;
        delete state[action.payload];
      })
      .addCase(todoListsThunks.fetchTodolist.fulfilled, (state, action) => {
        //const copyState = { ...state };
        //action.todolists.forEach((tl: any) => {
        // copyState[tl.id] = [];
        action.payload.todolists.forEach((tl) => (state[tl.id] = []));
      })
      .addCase(clearTasksTodos.type, () => {
        return {};
      });
  },
});

export enum ResultCodeEnum {
  success = 0,
  error = 1,
  captcha = 10,
}

// thunks
const fetchTasks = createAppAsyncThunk<
  {
    tasks: TaskType[];
    todolistId: string;
  },
  string
>(`${slice.name}/fetchTasks`, async (todolistId, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  const res = await tasksApi.getTasks(todolistId);
  if (res.data) {
    return { tasks: res.data.items, todolistId };
  } else {
    return rejectWithValue(res.data);
  }
});

const removeTask = createAppAsyncThunk<{ taskId: string; todolistId: string }, { taskId: string; todolistId: string }>(
  `${slice.name}/removeTasks`,
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    const res = await tasksApi.deleteTask(arg.todolistId, arg.taskId);
    if (res.data.resultCode === ResultCodeEnum.success) {
      return arg;
    } else {
      return rejectWithValue(res.data);
    }
  },
);

const addTask = createAppAsyncThunk<{ task: TaskType }, { todolistId: string; title: string }>(
  `${slice.name}/addTasks`,
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    const res = await tasksApi.createTask(arg.todolistId, arg.title);
    if (res.data.resultCode === ResultCodeEnum.success) {
      return { task: res.data.data.item };
    } else {
      return rejectWithValue(res.data);
    }
  },
);

const updateTask = createAppAsyncThunk<ArgUpdateTask, ArgUpdateTask>(
  `${slice.name}/updateTasks`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI;

    const state = getState();
    const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
    if (!task) {
      console.warn("task not found in the state");
      return rejectWithValue(null);
    }
    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...arg.domainModel,
    };
    const res = await tasksApi.updateTask(arg.todolistId, arg.taskId, apiModel);
    if (res.data.resultCode === ResultCodeEnum.success) {
      return arg;
    } else {
      serverAppError(res.data, dispatch);
      return rejectWithValue(res.data);
    }
  },
);

export const tasksReducer = slice.reducer;
/*export const tasksActions = slice.actions;*/
export const tasksThunks = { fetchTasks, addTask, updateTask, removeTask };

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};

export type TasksStateType = Record<string, TaskType[]>;
