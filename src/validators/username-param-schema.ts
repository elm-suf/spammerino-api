import { z } from "@hono/zod-openapi";

const createUsernameParamSchema = (exampleUserName?: string) =>
    z.object({
        userName: z.string().openapi({
            example: exampleUserName ?? "zoil",
        }),
    });

export default createUsernameParamSchema;
