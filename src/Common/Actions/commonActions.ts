import { createAction } from "@reduxjs/toolkit";
import { TasksStateType } from "features/TodolistsList/tasks-reducer";
import { TodolistDomainType } from "features/TodolistsList/todolists-reducer";

export type ClearTasksTodosType = {
  tasks: TasksStateType,
  todolists: TodolistDomainType[]
}

export const clearTasksTodos = createAction<ClearTasksTodosType>("common/clear-tasks-todos");
