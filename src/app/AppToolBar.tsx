import React from "react";
import { AppBar, Button, IconButton, LinearProgress, Toolbar, Typography } from "@mui/material";
import { Menu } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { AppRootStateType } from "app/store";
import { selectIsLoggedIn, selectStatus } from "app/appSelectors";
import { RequestStatusType } from "app/app-reducer";

type PropsType = {
  logoutHandler: () => void;
};

const AppToolBar = ({ logoutHandler }: PropsType) => {
  const isLoggedIn = useSelector<AppRootStateType, boolean>(selectIsLoggedIn);
  const status = useSelector<AppRootStateType, RequestStatusType>(selectStatus);
  return (
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
  );
};

export default AppToolBar;
