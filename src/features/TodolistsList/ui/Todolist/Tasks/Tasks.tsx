import React from "react";
import { Task } from "features/TodolistsList/ui/Todolist/Tasks/Task/Task";
import { TaskStatuses } from "Common/Enum";
import { TaskType } from "features/TodolistsList/api/tasks/tasksApi.types";
import { TodolistDomainType } from "features/TodolistsList/model/todolists/todolists-reducer";

type PropsType = {
  tasks: TaskType[];
  todolist: TodolistDomainType;
};
const Tasks = ({ tasks, todolist }: PropsType) => {
  let tasksForTodolist = tasks;

  if (todolist.filter === "active") {
    tasksForTodolist = tasks.filter((t) => t.status === TaskStatuses.New);
  }
  if (todolist.filter === "completed") {
    tasksForTodolist = tasks.filter((t) => t.status === TaskStatuses.Completed);
  }
  return (
    <>
      <div>{tasksForTodolist?.map((t) => <Task key={t.id} task={t} todolistId={todolist.id} />)}</div>
    </>
  );
};

export default Tasks;
