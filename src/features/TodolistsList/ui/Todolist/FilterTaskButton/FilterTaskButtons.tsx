import React from "react";
import { Button } from "@mui/material";
import { useActions } from "Common/hooks/useActions";
import {
  FilterValuesType,
  TodolistDomainType,
  todolistsActions,
} from "features/TodolistsList/model/todolists/todolists-reducer";

type Props = {
  todolist: TodolistDomainType;
};
const FilterTaskButtons = ({ todolist }: Props) => {
  const { changeTodolistFilter } = useActions(todolistsActions);
  const { filter, id } = todolist;
  const changeTodoListsFilterHandler = (filter: FilterValuesType) => {
    changeTodolistFilter({ filter: filter, id });
  };

  return (
    <>
      <Button
        variant={filter === "all" ? "outlined" : "text"}
        onClick={() => changeTodoListsFilterHandler("all")}
        color={"inherit"}
      >
        All
      </Button>
      <Button
        variant={filter === "active" ? "outlined" : "text"}
        onClick={() => changeTodoListsFilterHandler("active")}
        color={"primary"}
      >
        Active
      </Button>
      <Button
        variant={filter === "completed" ? "outlined" : "text"}
        onClick={() => changeTodoListsFilterHandler("completed")}
        color={"secondary"}
      >
        Completed
      </Button>
    </>
  );
};

export default FilterTaskButtons;
