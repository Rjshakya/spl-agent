import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8000",
});

export const SignIn = async (callbackURL?: string) => {
  return await authClient.signIn.social({
    provider: "google",
    callbackURL,
  });
};

export const SignOut = async () => {
  return await authClient.signOut();
};
