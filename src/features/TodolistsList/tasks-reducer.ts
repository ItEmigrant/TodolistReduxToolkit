import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "api/todolists-api";
import { AppThunk } from "app/store";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { appActions } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todolistsActions } from "features/TodolistsList/todolists-reducer";
import { clearTasksTodos } from "Common/Actions/commonActions";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        todolistId: string;
      }>,
    ) => {
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
    },
    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        model: UpdateDomainTaskModelType;
        todolistId: string;
      }>,
    ) => {
      /* return {
         ...state,
         [action.todolistId]: state[action.todolistId].map((t) =>
           t.id === action.taskId ? { ...t, ...action.model } : t,
         ),
       };*/
      let ourTaskIndex = state[action.payload.todolistId].findIndex((t) => {
        return t.id === action.payload.taskId;
      });
      if (ourTaskIndex !== -1) {
        state[action.payload.todolistId][ourTaskIndex] = {
          ...state[action.payload.todolistId][ourTaskIndex],
          ...action.payload.model,
        };
      }
      /* let ourTask = state[action.payload.todolistId].find((t) => {
         t.id === action.payload.taskId;
       });
       if (ourTask) {
         ourTask = { ...ourTask, ...action.payload.model };
       }*/ //???
    },
  },
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
      .addCase(todolistsActions.addTodolist, (state, action) => {
        // return { ...state, [action.todolist.id]: [] };
        state[action.payload.todolist.id] = [];
      })
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        // const copyState = { ...state };
        //delete copyState[action.id];
        // return copyState;
        delete state[action.payload.id];
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
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

// thunks

const fetchTasks = createAppAsyncThunk<
  {
    tasks: TaskType[];
    todolistId: string;
  },
  string
>(`${slice.name}/fetchTasks`, async (todolistId, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    const res = await todolistsAPI.getTasks(todolistId);
    dispatch(appActions.setAppStatus({ status: "succeeded" }));
    return { tasks: res.data.items, todolistId };
  } catch (err) {
    handleServerNetworkError(err, dispatch);
    return rejectWithValue(null);
  }
});
export const removeTaskTC =
  (taskId: string, todolistId: string): AppThunk =>
    (dispatch) => {
      todolistsAPI.deleteTask(todolistId, taskId).then(() => {
        const action = tasksActions.removeTask({ taskId, todolistId });
        dispatch(action);
      });
    };


/*export const _fetchTasksTC =
  (todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.getTasks(todolistId).then((res) => {
      const tasks = res.data.items;
      dispatch(tasksActions.setTasks({ tasks, todolistId }));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };*/

const addTask = createAppAsyncThunk<{ task: TaskType }, { todolistId: string; title: string }>(
  `${slice.name}/addTasks`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await todolistsAPI.createTask(arg.todolistId, arg.title);
      if (res.data.resultCode === 0) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { task: res.data.data.item };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (err) {
      handleServerNetworkError(err, dispatch);
      return rejectWithValue(null);
    }
  },
);
/*export const addTaskTC =
  (title: string, todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(tasksActions.addTask({ task: res.data.data.item }));
          dispatch(appActions.setAppStatus({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };*/
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const task = state.tasks[todolistId].find((t) => t.id === taskId);
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state");
      return;
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    };

    todolistsAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const action = tasksActions.updateTask({ taskId, model: domainModel, todolistId });
          dispatch(action);
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = { fetchTasks, addTask };

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};
