import React, { ChangeEvent } from "react";
import { Checkbox, IconButton } from "@mui/material";
import { EditableSpan } from "Common/components/EditableSpan/EditableSpan";
import { Delete } from "@mui/icons-material";
import { TaskStatuses } from "Common/Enum/enum";
import { TaskType } from "features/TodolistsList/api/tasks/tasksApi.types";
import { tasksThunks } from "features/TodolistsList/model/tasks/tasks-reducer";
import { useActions } from "Common/hooks/useActions";
import s from 'features/TodolistsList/ui/Todolist/Tasks/Task/task.module.css'

type PropsType = {
  task: TaskType;
  todolistId: string;
};
export const Task = React.memo(({task, todolistId}: PropsType) => {
  const { removeTask, updateTask } = useActions(tasksThunks);

  const removeTaskHandler = () => {
    removeTask({ taskId: task.id, todolistId });
  };

  const changeTaskStatusHandler = (e: ChangeEvent<HTMLInputElement>) => {
    let status = e.currentTarget.checked ? TaskStatuses.Completed : TaskStatuses.New;
    updateTask({
      taskId:task.id,
      todolistId,
      domainModel: { status },
    });
  };

  const changeTaskTitleHandler = (newTitle: string) => {
    updateTask({ taskId:task.id, todolistId, domainModel: { title: newTitle } });
  };

  return (
    <div key={task.id} className={task.status === TaskStatuses.Completed ? s.isDone : ""}>
      <Checkbox
        checked={task.status === TaskStatuses.Completed}
        color="primary"
        onChange={changeTaskStatusHandler}
      />

      <EditableSpan value={task.title} onChange={changeTaskTitleHandler} />
      <IconButton onClick={removeTaskHandler}>
        <Delete />
      </IconButton>
    </div>
  );
});
