import React from "react";
import { Route, Routes } from "react-router-dom";
import { TodolistsList } from "features/TodolistsList/ui/TodolistsList";
import { Login } from "features/Login/Login";
import { Container } from "@mui/material";


const AppRouting = () => {
  return (
    <Container fixed>
      <Routes>
        <Route path={"/"} element={<TodolistsList />} />
        <Route path={"/login"} element={<Login />} />
        <Route path="/TodolistReduxToolkit" element={<Login />} />
      </Routes>
    </Container>
  );
};

export default AppRouting;
