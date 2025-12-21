import { Hono } from "hono";

import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import users from "@/routes/users/users.index";

const app = new Hono();
const api = createApp();

configureOpenAPI(api);

const routes = [
  users,
] as const;

routes.forEach((route) => {
  api.route("/", route);
});

export type AppType = typeof routes[number];

app.route("/", api);

export default app;
