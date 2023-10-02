import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "api/todolists-api";
import { Dispatch } from "redux";
import { AppThunk } from "app/store";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { appActions } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todolistsActions } from "features/TodolistsList/todolists-reducer";

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
      /* return {
           ...state,
           [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId),
         }*/
      /*const TaskIndex = state[action.payload.todolistId].findIndex((tasks) => tasks.id === action.payload.taskId);
      if (TaskIndex === -1) state[action.payload.todolistId].slice(TaskIndex, 1);*/
      const TaskForTodo = state[action.payload.todolistId];
      const index = state.TaskForTodo.findIndex((t) => t.id === action.payload.taskId);
      if (index !== -1) TaskForTodo.slice(index, 1);
      /* state[action.payload.todolistId].slice(Number(action.payload.taskId), 1);*/
    },
    addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      /* return {
         ...state,
         [action.task.todoListId]: [action.task, ...state[action.task.todoListId]],
       };*/
      state[action.payload.task.todoListId].unshift(action.payload.task);
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
        t.id === action.payload.taskId;
      });
      if (ourTaskIndex !== -1) {
        state[action.payload.todolistId][ourTaskIndex] = {...state[action.payload.todolistId][ourTaskIndex], ...action.payload.model};
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
      });
  },
});
/*export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
  switch (action.type) {

   
    case "UPDATE-TASK":
      return {
        ...state,
        [action.todolistId]: state[action.todolistId].map((t) =>
          t.id === action.taskId ? { ...t, ...action.model } : t,
        ),
      };


    case "SET-TODOLISTS": {
      const copyState = { ...state };
      action.todolists.forEach((tl: any) => {
        copyState[tl.id] = [];
      });
      return copyState;
    }
    case "SET-TASKS":
      return { ...state, [action.todolistId]: action.tasks };
    default:
      return state;
  }
};*/

// actions

export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
  ({ type: "UPDATE-TASK", model, todolistId, taskId }) as const;
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
  ({ type: "SET-TASKS", tasks, todolistId }) as const;

// thunks
export const fetchTasksTC =
  (todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.getTasks(todolistId).then((res) => {
      const tasks = res.data.items;
      dispatch(setTasksAC(tasks, todolistId));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
  todolistsAPI.deleteTask(todolistId, taskId).then(() => {
    const action = removeTaskAC(taskId, todolistId);
    dispatch(action);
  });
};
export const addTaskTC =
  (title: string, todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const task = res.data.data.item;
          const action = addTaskAC(task);
          dispatch(action);
          dispatch(appActions.setAppStatus({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
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
          const action = updateTaskAC(taskId, domainModel, todolistId);
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
type ActionsType =
  | ReturnType<typeof removeTaskAC>
  | ReturnType<typeof addTaskAC>
  | ReturnType<typeof updateTaskAC>
  | ReturnType<typeof setTasksAC>
  | any;
