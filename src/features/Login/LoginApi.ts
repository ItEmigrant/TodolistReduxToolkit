import { instance } from "Common/api/baseApi";
import { BaseResponseType } from "Common/types/commonTypes";

export const authAPI = {
  login(data: LoginParamsType) {
    return instance.post<BaseResponseType<{ userId?: number }>>("auth/login", data);
  },
  logout() {
    return instance.delete<BaseResponseType<{ userId?: number }>>("auth/login");
  },
  me() {
    return instance.get<BaseResponseType<{ id: number; email: string; login: string }>>("auth/me");
  },
};

export const securityAPI = {
  getCaptchaUrl() {
    return instance.get<CaptchaResponseType>("security/get-captcha-url");
  },
};

//types
export type LoginParamsType = {
  email: string;
  password: string;
  rememberMe: boolean;
  captcha: string;
};
export type CaptchaResponseType = {
  url: string;
};