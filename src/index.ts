import { serve } from "@hono/node-server";

import api from "./app";
import env from "./env";

const port = env.PORT;
// eslint-disable-next-line no-console
console.log(`Server is running on port http://localhost:${port}`);
console.log(`Docs running on port http://localhost:${port}/reference`);

serve({
  fetch: api.fetch,
  port,
});
