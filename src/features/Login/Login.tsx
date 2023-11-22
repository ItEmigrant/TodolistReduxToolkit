import React from "react";
import { FormikHelpers, useFormik } from "formik";
import { useSelector } from "react-redux";
import { AppRootStateType } from "app/store";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "app/useAppDispatch";
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, TextField } from "@mui/material";
import { selectLoginIsLoggedIn } from "features/Login/loginSelectors";
import { authThunks } from "features/Login/auth-reducer";
import { BaseResponseType } from "Common/types";

type FormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};
export const Login = () => {
  const dispatch = useAppDispatch();

  const isLoggedIn = useSelector<AppRootStateType, boolean>(selectLoginIsLoggedIn);

  const formik = useFormik({
    validate: (values) => {
      if (!values.email) {
        return {
          email: "Email is required",
        };
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email))
        return {
          email: "Invalid email address",
        };

      if (!values.password) {
        return {
          password: "Password is required",
        };
      } else if (values.password.length < 4)
        return {
          password: "Must be  more 3 symbols",
        };
    },

    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: (values, formikHelpers: FormikHelpers<FormValues>) => {
      dispatch(authThunks.login(values))
        .unwrap()
        .catch((err: BaseResponseType) => {
          err.fieldsErrors?.forEach((fieldsError) => formikHelpers.setFieldError(fieldsError.field, fieldsError.error));
        });
    },
  });

  if (isLoggedIn) {
    return <Navigate to={"/"} />;
  }

  return (
    <Grid container justifyContent="center">
      <Grid item xs={4}>
        <form onSubmit={formik.handleSubmit}>
          <FormControl>
            <FormLabel>
              <p>
                To log in get registered{" "}
                <a href={"https://social-network.samuraijs.com/"} target={"_blank"}>
                  here
                </a>
              </p>
              <p>or use common test account credentials:</p>
              <p> Email: free@samuraijs.com</p>
              <p>Password: free</p>
            </FormLabel>
            <FormGroup>
              <TextField label="Email" margin="normal" {...formik.getFieldProps("email")} />
              {formik.errors.email ? <div style={{ color: "red" }}>{formik.errors.email}</div> : null}
              <TextField type="password" label="Password" margin="normal" {...formik.getFieldProps("password")} />
              {formik.errors.password ? <div style={{ color: "red" }}>{formik.errors.password}</div> : null}
              <FormControlLabel
                label={"Remember me"}
                control={<Checkbox {...formik.getFieldProps("rememberMe")} checked={formik.values.rememberMe} />}
              />
              <Button type={"submit"} variant={"contained"} color={"primary"}>
                Login
              </Button>
            </FormGroup>
          </FormControl>
        </form>
      </Grid>
    </Grid>
  );
};
