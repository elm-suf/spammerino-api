import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route";
import users from "@/routes/users/users.index";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
const api = createApp();

configureOpenAPI(api);

const routes = [
  index,
  users,
] as const;

routes.forEach((route) => {
  api.route("/", route);
});

export type AppType = typeof routes[number];

app.use(
    '*',
    cors({
      origin: 'http://localhost:3000',
      allowMethods: ['POST', 'GET', 'OPTIONS'],
    })
  )
app.route("/", api);

export default app;
