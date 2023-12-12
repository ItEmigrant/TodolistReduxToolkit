import React, { useCallback, useEffect } from "react";
import "./App.css";
import { TodolistsList } from "features/TodolistsList/ui/TodolistsList";
import { ErrorSnackbar } from "Common/components/ErrorSnackbar/ErrorSnackbar";
import { useSelector } from "react-redux";
import { AppRootStateType } from "./store";
import { RequestStatusType } from "./app-reducer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "features/Login/Login";
import {
  AppBar,
  Button,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import { selectIsInitialized, selectIsLoggedIn, selectStatus } from "app/appSelectors";
import { authThunks } from "features/Login/auth-reducer";

import { useActions } from "Common/hooks/useActions";

type PropsType = {
  demo?: boolean;
};

function App({ demo = false }: PropsType) {
  const status = useSelector<AppRootStateType, RequestStatusType>(selectStatus);
  const isInitialized = useSelector<AppRootStateType, boolean>(selectIsInitialized);
  const isLoggedIn = useSelector<AppRootStateType, boolean>(selectIsLoggedIn);

  const { initializeApp, logout } = useActions(authThunks);

  useEffect(() => {
    //dispatch(authThunks.initializeApp());
    initializeApp();
  }, []);

  const logoutHandler = useCallback(() => {
    logout();
  }, []);

  if (!isInitialized) {
    return (
      <div className="circularProgress">
        <CircularProgress />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <ErrorSnackbar />
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <Menu />
            </IconButton>
            <Typography variant="h6">News</Typography>
            {isLoggedIn && (
              <Button color="inherit" onClick={logoutHandler}>
                Log out
              </Button>
            )}
          </Toolbar>
          {status === "loading" && <LinearProgress />}
        </AppBar>
        <Container fixed>
          <Routes>
            <Route path={"/"} element={<TodolistsList demo={demo} />} />
            <Route path={"/login"} element={<Login />} />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;
