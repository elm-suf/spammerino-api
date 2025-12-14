import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema, createMessageObjectSchema, IdParamsSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";

import { selectEmotesSchema, selectUsersSchema } from "./user.model";
import createUsernameParamSchema from "@/validators/username-param-schema";

const tags = ["Users"];

export type GetUserByUsernameRoute = typeof getUserByUsername;
export const getUserByUsername = createRoute({
  path: "/users/{userName}",
  method: "get",
  summary: "getUserByUsername",
  description: "Get a user by their username",
  request: {
    params: createUsernameParamSchema("userName"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectUsersSchema,
      "The requested user",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createUsernameParamSchema("userName")),
      "Invalid userName error",
    ),
  },

});

export type GetEmotesByUsernameRoute = typeof getEmotesByUsername;
export const getEmotesByUsername = createRoute({
  path: "/users/{userName}/emotes",
  method: "get",
  summary: "getEmotesByUsername",
  description: "Get a user's emotes by their username",
  request: {
    params: createUsernameParamSchema("userName"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectEmotesSchema,
      "The requested user's emotes",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User emotes not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createMessageObjectSchema("userName")),
      "Invalid userName error",
    ),
  },
});

