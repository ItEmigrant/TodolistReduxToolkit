import React, { useCallback } from "react";
import { EditableSpan } from "Common/components/EditableSpan/EditableSpan";
import { IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useActions } from "Common/hooks/useActions";
import { TodolistDomainType, todoListsThunks } from "features/TodolistsList/model/todolists/todolists-reducer";

type Props = {
  todolist: TodolistDomainType;
};
const TodolistTitle = ({ todolist }: Props) => {
  const { title, id, entityStatus } = todolist;
  const { changeTodolistTitle, removeTodolist } = useActions(todoListsThunks);

  const changeTodolistTitleCB = useCallback((title: string) => changeTodolistTitle({ id, title }), [id]);
  const removeTodolistHandler = () => {
    removeTodolist({ id });
  };

  return (
    <>
      <h3>
        <EditableSpan value={title} onChange={changeTodolistTitleCB} />
        <IconButton onClick={removeTodolistHandler} disabled={entityStatus === "loading"}>
          <Delete />
        </IconButton>
      </h3>
    </>
  );
};

export default TodolistTitle;
