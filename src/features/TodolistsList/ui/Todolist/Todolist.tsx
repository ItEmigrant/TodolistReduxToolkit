import React, { useCallback, useEffect } from "react";
import { AddItemForm } from "Common/components/AddItemForm/AddItemForm";
import { EditableSpan } from "Common/components/EditableSpan/EditableSpan";
import { Task } from "features/TodolistsList/ui/Todolist/Task/Task";

import {
  TodolistDomainType,
  todolistsActions,
  todoListsThunks,
} from "features/TodolistsList/model/todolists/todolists-reducer";
import { Button, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

import { TaskStatuses } from "Common/Enum/enum";
import { TaskType } from "features/TodolistsList/api/tasks/tasksApi.types";
import { useActions } from "Common/hooks/useActions";
import { tasksThunks } from "features/TodolistsList/model/tasks/tasks-reducer";

type Props = {
  todolist: TodolistDomainType;
  tasks: TaskType[];
  demo?: boolean;
};

export const Todolist = React.memo(function ({ demo = false, ...props }: Props) {
  const { addTask, fetchTasks } = useActions(tasksThunks);
  const { changeTodolistTitle, removeTodolist } = useActions(todoListsThunks);
  const { changeTodolistFilter } = useActions(todolistsActions);

  useEffect(() => {
    fetchTasks(props.todolist.id);
  }, []);

  const addTaskCallback = useCallback(
    (title: string) => {
      addTask({ title, todolistId: props.todolist.id });
    },
    [props.todolist.id],
  );

  const removeTodolistHandler = () => {
    removeTodolist({ id: props.todolist.id });
  };
  const changeTodolistTitleCB = useCallback(
    (title: string) => {
      changeTodolistTitle({ id: props.todolist.id, title });
    },
    [props.todolist.id],
  );

  const onAllClickHandler = useCallback(
    () => changeTodolistFilter({ filter: "all", id: props.todolist.id }),
    [props.todolist.id],
  );
  const onActiveClickHandler = useCallback(
    () => changeTodolistFilter({ filter: "active", id: props.todolist.id }),
    [props.todolist.id],
  );
  const onCompletedClickHandler = useCallback(
    () => changeTodolistFilter({ filter: "completed", id: props.todolist.id }),
    [props.todolist.id],
  );

  let tasksForTodolist = props.tasks;

  if (props.todolist.filter === "active") {
    tasksForTodolist = props.tasks.filter((t) => t.status === TaskStatuses.New);
  }
  if (props.todolist.filter === "completed") {
    tasksForTodolist = props.tasks.filter((t) => t.status === TaskStatuses.Completed);
  }

  return (
    <div>
      <h3>
        <EditableSpan value={props.todolist.title} onChange={changeTodolistTitleCB} />
        <IconButton onClick={removeTodolistHandler} disabled={props.todolist.entityStatus === "loading"}>
          <Delete />
        </IconButton>
      </h3>
      <AddItemForm addItem={addTaskCallback} disabled={props.todolist.entityStatus === "loading"} />
      <div>{tasksForTodolist?.map((t) => <Task key={t.id} task={t} todolistId={props.todolist.id} />)}</div>
      <div style={{ paddingTop: "10px" }}>
        <Button
          variant={props.todolist.filter === "all" ? "outlined" : "text"}
          onClick={onAllClickHandler}
          color={"inherit"}
        >
          All
        </Button>
        <Button
          variant={props.todolist.filter === "active" ? "outlined" : "text"}
          onClick={onActiveClickHandler}
          color={"primary"}
        >
          Active
        </Button>
        <Button
          variant={props.todolist.filter === "completed" ? "outlined" : "text"}
          onClick={onCompletedClickHandler}
          color={"secondary"}
        >
          Completed
        </Button>
      </div>
    </div>
  );
});
