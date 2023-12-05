import React, { useCallback, useEffect } from "react";
import { AddItemForm } from "Common/components/AddItemForm/AddItemForm";

import { TodolistDomainType } from "features/TodolistsList/model/todolists/todolists-reducer";
import { TaskType } from "features/TodolistsList/api/tasks/tasksApi.types";
import { useActions } from "Common/hooks/useActions";
import { tasksThunks } from "features/TodolistsList/model/tasks/tasks-reducer";
import FilterTaskButtons from "features/TodolistsList/ui/Todolist/FilterTaskButton/FilterTaskButtons";
import Tasks from "features/TodolistsList/ui/Todolist/Tasks/Tasks";
import TodolistTitle from "features/TodolistsList/ui/Todolist/TodolistTitle/TodolistTitle";

type Props = {
  todolist: TodolistDomainType;
  tasks: TaskType[];
  demo?: boolean;
};

export const Todolist = React.memo(function ({ demo = false, ...props }: Props) {
  const { addTask, fetchTasks } = useActions(tasksThunks);

  useEffect(() => {
    fetchTasks(props.todolist.id);
  }, []);

  const addTaskCallback = useCallback(
    (title: string) => {
      addTask({ title, todolistId: props.todolist.id });
    },
    [props.todolist.id],
  );

  return (
    <div>
      <TodolistTitle todolist={props.todolist}/>
      <AddItemForm addItem={addTaskCallback} disabled={props.todolist.entityStatus === "loading"} />
      <Tasks todolist={props.todolist} tasks={props.tasks} />
      <div style={{ paddingTop: "10px" }}>
        <FilterTaskButtons todolist={props.todolist} />
      </div>
    </div>
  );
});
