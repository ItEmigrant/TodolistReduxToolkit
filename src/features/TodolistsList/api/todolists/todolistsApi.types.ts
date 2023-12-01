import { UpdateDomainTaskModelType } from "features/TodolistsList/model/tasks/tasks-reducer";

export type TodolistType = {
  id: string;
  title: string;
  addedDate: string;
  order: number;
};

export type ArgUpdateTask = {
  taskId: string;
  domainModel: UpdateDomainTaskModelType;
  todolistId: string;
};

