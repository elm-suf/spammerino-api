import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema, createMessageObjectSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";
import createUsernameParamSchema from "@/validators/username-param-schema";

import { selectBadgesSchema, selectEmotesSchema, selectSearchUsersSchema, selectUsersSchema } from "./user.model";

const tags = ["Users"];

export type SearchUsersRoute = typeof searchUsers;
export const searchUsers = createRoute({
  path: "/users/search/{userName}",
  method: "get",
  operationId: "searchUsers",
  summary: "Search for users by their username",
  request: {
    params: createUsernameParamSchema("userName"),

  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSearchUsersSchema,
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

export type GetUserByUsernameRoute = typeof getUserByUsername;
export const getUserByUsername = createRoute({
  path: "/users/{userName}",
  method: "get",
  operationId: "getUserByUsername",
  summary: "Get a user by their username",
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
  operationId: "getEmotesByUsername",
  summary: "Get a user's emotes by their username",
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

export type GetBadgesByUsernameRoute = typeof getBadgesByUsername;
export const getBadgesByUsername = createRoute({
  path: "/users/{userName}/badges",
  method: "get",
  operationId: "getBadgesByUsername",
  summary: "Get available badges for user channel",
  request: {
    params: createUsernameParamSchema("userName"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectBadgesSchema,
      "The requested user's badges",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User badges not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createMessageObjectSchema("userName")),
      "Invalid userName error",
    ),
  },
});
