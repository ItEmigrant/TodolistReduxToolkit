import { FormikHelpers, useFormik } from "formik";
import { authThunks } from "features/Login/auth-reducer";
import { BaseResponseType } from "Common/types";
import { LoginParamsType } from "features/Login/LoginApi";
import { useAppDispatch } from "app/useAppDispatch";
import { useSelector } from "react-redux";
import { AppRootStateType } from "app/store";
import { selectLoginIsLoggedIn } from "features/Login/loginSelectors";

export const useLogin = () => {
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
  return { formik, isLoggedIn }
};

//types
type FormValues = Omit<LoginParamsType, "captcha">;
