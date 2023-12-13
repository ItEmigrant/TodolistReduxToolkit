import React, { useCallback, useEffect } from "react";
import "./App.css";
import { ErrorSnackbar } from "Common/components/ErrorSnackbar/ErrorSnackbar";
import { useSelector } from "react-redux";
import { AppRootStateType } from "./store";
import { BrowserRouter } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { selectIsInitialized } from "app/appSelectors";
import { authThunks } from "features/Login/auth-reducer";
import { useActions } from "Common/hooks/useActions";
import AppToolBar from "app/AppToolBar";
import AppRouting from "app/AppRouting";

function App() {
  const isInitialized = useSelector<AppRootStateType, boolean>(selectIsInitialized);
  const { initializeApp, logout } = useActions(authThunks);

  useEffect(() => {
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
        <AppToolBar logoutHandler={logoutHandler} />
        <AppRouting />
      </div>
    </BrowserRouter>
  );
}

export default App;
