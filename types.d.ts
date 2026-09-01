import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "OWNER" | "ADMIN";
      status: "ACTIVE" | "DISABLED";
    } & DefaultSession["user"];
  }
}
