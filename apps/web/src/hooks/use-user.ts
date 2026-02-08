import { authClient } from "@/lib/auth-client";

export const useUser = () => {
  const { data } = authClient.useSession();
  return { user: data?.user };
};
