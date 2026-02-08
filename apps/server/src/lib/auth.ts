import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getAppDB } from "../db/instance"; // your drizzle instance
import { env } from "cloudflare:workers";
import { verification, account, session, user } from "../db/schema/auth-schema";

export const getAuth = async () => {
  const db = await getAppDB();

  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: user,
        account: account,
        session: session,
        verification: verification,
      },
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    trustedOrigins: [env.CLIENT_URL],
  });

  return auth;
};
