import React, { ChangeEvent } from "react";
import { Checkbox, IconButton } from "@mui/material";
import { EditableSpan } from "Common/components/EditableSpan/EditableSpan";
import { Delete } from "@mui/icons-material";
import { TaskStatuses } from "Common/Enum/enum";
import { TaskType } from "features/TodolistsList/api/tasks/tasksApi.types";
import { tasksThunks } from "features/TodolistsList/model/tasks/tasks-reducer";
import { useActions } from "Common/hooks/useActions";

type Props = {
  task: TaskType;
  todolistId: string;
};
export const Task = React.memo((props: Props) => {
  const { removeTask, updateTask } = useActions(tasksThunks);

  const removeTaskHandler = () => {
    removeTask({ taskId: props.task.id, todolistId: props.todolistId });
  };

  const changeTaskStatusHandler = (e: ChangeEvent<HTMLInputElement>) => {
    let status = e.currentTarget.checked ? TaskStatuses.Completed : TaskStatuses.New;
    updateTask({
      taskId: props.task.id,
      todolistId: props.todolistId,
      domainModel: { status },
    });
  };

  const changeTaskTitleHandler = (newTitle: string) => {
    updateTask({ taskId: props.task.id, todolistId: props.todolistId, domainModel: { title: newTitle } });
  };

  return (
    <div key={props.task.id} className={props.task.status === TaskStatuses.Completed ? "is-done" : ""}>
      <Checkbox
        checked={props.task.status === TaskStatuses.Completed}
        color="primary"
        onChange={changeTaskStatusHandler}
      />

      <EditableSpan value={props.task.title} onChange={changeTaskTitleHandler} />
      <IconButton onClick={removeTaskHandler}>
        <Delete />
      </IconButton>
    </div>
  );
});
