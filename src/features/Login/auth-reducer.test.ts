import { authReducer, authThunks } from "features/Login/auth-reducer";
import { LoginParamsType, securityAPI } from "features/Login/LoginApi";
import { store } from "app/store";

let startState: any;

beforeEach(() => {
  startState = {
    isLoggedIn: false,
    captchaUrl: null as string | null,
  };
});
const defaultLoginParams: LoginParamsType = {
  email: "bohdan.11@gmail.com",
  password: "777",
  rememberMe: true,
  captcha: "helloCaptcha",
};
test("correct login status should be set", () => {
  const endState = authReducer(startState, authThunks.login.fulfilled({ isLoggedIn: true }, "", defaultLoginParams));
  expect(startState.isLoggedIn).toBe(false);
  expect(endState.isLoggedIn).toBe(true);
});

test("correct logout status should be set", () => {
  const endState = authReducer(startState, authThunks.logout.fulfilled({ isLoggedIn: false }, "", undefined));
  expect(startState.isLoggedIn).toBe(false);
  expect(endState.isLoggedIn).toBe(false);
});

test("correct initializeApp status should be set", () => {
  const endState = authReducer(startState, authThunks.initializeApp.fulfilled({ isLoggedIn: true }, "", undefined));
  expect(startState.isLoggedIn).toBe(false);
  expect(endState.isLoggedIn).toBe(true);
});

jest.mock("./LoginApi", () => ({
  securityAPI: {
    getCaptchaUrl: jest.fn(() =>
      Promise.resolve({
        data: { url: "test_captcha_url" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      } as any),
    ),
  },
}));

it("handles successful getCaptchaUrl", async () => {
  const captchaUrl = "test_captcha_url";

  (securityAPI.getCaptchaUrl as jest.MockedFunction<typeof securityAPI.getCaptchaUrl>).mockResolvedValue({
    data: { url: captchaUrl },
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as any,
  });

  await store.dispatch(authThunks.getCaptchaUrl());
  expect(store.getState().auth.captchaUrl).toEqual(captchaUrl);
});
