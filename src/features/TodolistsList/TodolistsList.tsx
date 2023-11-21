import React, { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppRootStateType } from "app/store";
import { FilterValuesType, TodolistDomainType, todolistsActions, todoListsThunks } from "./todolists-reducer";
import { TasksStateType, tasksThunks } from "./tasks-reducer";
import { Grid, Paper } from "@mui/material";
import { AddItemForm } from "Common/components/AddItemForm/AddItemForm";
import { Todolist } from "./Todolist/Todolist";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "app/useAppDispatch";
import {
  selectTodoLists,
  selectTodosIsLoggedIn,
  selectTodosTasks,
} from "features/TodolistsList/todolistsListsSelectors";
import { TaskStatuses } from "Common/Enum/enum";
import { useActions } from "Common/hooks/useActions";

type PropsType = {
  demo?: boolean;
};

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(selectTodoLists);
  const tasks = useSelector<AppRootStateType, TasksStateType>(selectTodosTasks);
  const isLoggedIn = useSelector<AppRootStateType, boolean>(selectTodosIsLoggedIn);

  const dispatch = useAppDispatch();
  const { addTodolist, removeTodolist, fetchTodolist, changeTodolistTitle } = useActions(todoListsThunks);

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    fetchTodolist();
  }, []);

  const removeTask = useCallback(function (taskId: string, todolistId: string) {
    dispatch(tasksThunks.removeTask({ taskId, todolistId }));
  }, []);

  const addTask = useCallback(function (title: string, todolistId: string) {
    dispatch(tasksThunks.addTask({ title, todolistId }));
  }, []);

  const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
    dispatch(tasksThunks.updateTask({ taskId, domainModel: { status }, todolistId }));
  }, []);

  const changeTaskTitle = useCallback(function (taskId: string, newTitle: string, todolistId: string) {
    dispatch(tasksThunks.updateTask({ taskId, domainModel: { title: newTitle }, todolistId }));
  }, []);

  const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
    dispatch(todolistsActions.changeTodolistFilter({ id, filter }));
  }, []);

  const removeTodolistCB = useCallback(function (id: string) {
   removeTodolist({ id })
  }, []);

  const changeTodolistTitleCB = useCallback(function (id: string, title: string) {
    changeTodolistTitle({ id, title })
  }, []);

  const addTodolistCB = useCallback(
    (title: string) => {
     addTodolist({ title })
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
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTask}
                  changeFilter={changeFilter}
                  addTask={addTask}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolistCB}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitleCB}
                  demo={demo}
                />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
