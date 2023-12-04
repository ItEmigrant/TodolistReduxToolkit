import React, { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppRootStateType } from "app/store";
import { TodolistDomainType, todoListsThunks } from "features/TodolistsList/model/todolists/todolists-reducer";
import { TasksStateType } from "features/TodolistsList/model/tasks/tasks-reducer";
import { Grid, Paper } from "@mui/material";
import { AddItemForm } from "Common/components/AddItemForm/AddItemForm";
import { Todolist } from "features/TodolistsList/ui/Todolist/Todolist";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "app/useAppDispatch";
import {
  selectTodoLists,
  selectTodosIsLoggedIn,
  selectTodosTasks,
} from "features/TodolistsList/model/todolists/todolistsListsSelectors";
import { useActions } from "Common/hooks/useActions";

type PropsType = {
  demo?: boolean;
};

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(selectTodoLists);
  const tasks = useSelector<AppRootStateType, TasksStateType>(selectTodosTasks);
  const isLoggedIn = useSelector<AppRootStateType, boolean>(selectTodosIsLoggedIn);

  const dispatch = useAppDispatch();
  const { addTodolist, fetchTodolist} = useActions(todoListsThunks);

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    fetchTodolist();
  }, []);

  const addTodolistCB = useCallback(
    (title: string) => {
      addTodolist({ title });
    },
    [dispatch],
  );

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <Grid container style={{ padding: "20px" }}>
        <AddItemForm addItem={addTodolistCB} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id];

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: "10px" }}>
                <Todolist todolist={tl} tasks={allTodolistTasks} demo={demo} />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
