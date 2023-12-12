import React, { memo, useCallback, useEffect } from "react";
import { AddItemForm } from "Common/components/AddItemForm/AddItemForm";

import { TodolistDomainType } from "features/TodolistsList/model/todolists/todolists-reducer";
import { TaskType } from "features/TodolistsList/api/tasks/tasksApi.types";
import { useActions } from "Common/hooks/useActions";
import { tasksThunks } from "features/TodolistsList/model/tasks/tasks-reducer";
import FilterTaskButtons from "features/TodolistsList/ui/Todolist/FilterTaskButton/FilterTaskButtons";
import Tasks from "features/TodolistsList/ui/Todolist/Tasks/Tasks";
import TodolistTitle from "features/TodolistsList/ui/Todolist/TodolistTitle/TodolistTitle";

type PropsType = {
  todolist: TodolistDomainType;
  tasks: TaskType[];
};

export const Todolist = memo(function ({ todolist, tasks }: PropsType) {
  const { addTask, fetchTasks } = useActions(tasksThunks);
  useEffect(() => {
    fetchTasks(todolist.id);
  }, []);

  const addTaskCallback = useCallback(
    (title: string) => {
     return addTask({ title, todolistId: todolist.id }).unwrap();
    },
    [todolist.id],
  );
  return (
    <div>
      <TodolistTitle todolist={todolist} />
      <AddItemForm addItem={addTaskCallback} disabled={todolist.entityStatus === "loading"} />
      <Tasks todolist={todolist} tasks={tasks} />
      <div style={{ paddingTop: "10px" }}>
        <FilterTaskButtons todolist={todolist} />
      </div>
    </div>
  );
});
