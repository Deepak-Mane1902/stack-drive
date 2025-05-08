import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware } from "better-auth/api";
import client from "../database/db";
import { Subscription } from "../database/schema/subscription.model";
import { ObjectId } from "mongodb";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../env";

const dbInstance = await client();
if (!dbInstance) {
  throw new Error("Database client is undefined");
}
const dbClient = dbInstance?.db;
if (!dbClient) {
  throw new Error("Failed to initialize database client");
}

export const auth = betterAuth({
  database: mongodbAdapter(dbClient),
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
  hooks: {
    after: createAuthMiddleware(async (c) => {
      const newSession = c.context.newSession;
      const user = newSession?.user;

      if (!user) return;

      try {
        await client();
        const isSubAvail = await Subscription.findOne({ subscriber: user.id });

        if (!isSubAvail) {
          const subs = await Subscription.create({
            subscriber: user.id,
            status: "activated",
          });

          const userCollection = dbClient.collection("user");
          await userCollection.updateOne(
            { _id: new ObjectId(user.id) },
            { $set: { subscription: subs._id } }
          );
        }
      } catch (error) {
        console.error("Subscription setup failed:", error);
      }
    }),
  },
  plugins: [nextCookies()],
});
