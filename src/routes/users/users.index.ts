import { createRouter } from "@/lib/create-app";

import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

const router = createRouter()
  .openapi(routes.searchUsers, handlers.searchUsers)
  .openapi(routes.getUserByUsername, handlers.getUserByUsername)
  .openapi(routes.getEmotesByUsername, handlers.getEmotesByUsername)
  .openapi(routes.getBadgesByUsername, handlers.getBadgesByUsername);

export default router;
