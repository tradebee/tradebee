import { readFileSync } from "node:fs";
import { defineToolPlugin } from "openclaw/plugin-sdk/tool-plugin";
import { Type } from "typebox";
import TradebeeOpenApi from "./tradebee.js";
import type { TradebeeRequest, TradebeeResult } from "./types.js";

const toolSchema = JSON.parse(readFileSync(new URL("../tool.schema.json", import.meta.url), "utf8"));
const inputSchema = Type.Unsafe<TradebeeRequest>(toolSchema.input);
const outputSchema = Type.Unsafe<TradebeeResult>(toolSchema.output);
const configSchema = Type.Object({
  apiKey: Type.Optional(Type.String({
    minLength: 1,
    description: "Tradebee API key. Falls back to BEE_API_KEY when omitted."
  }))
}, { additionalProperties: false });

export default defineToolPlugin({
  id: "tradebee",
  name: "Tradebee OpenAPI",
  description: "Manage Tradebee Website Builder content, navigation, products, analytics, files, links, and generated pages.",
  configSchema,
  tools: (tool) => [
    tool({
      name: "tradebee_api",
      label: "Tradebee OpenAPI",
      description: "Run one explicit Tradebee Website Builder action with validated structured input.",
      parameters: inputSchema,
      outputSchema,
      async execute(params, config, context) {
        context.signal?.throwIfAborted();
        return await TradebeeOpenApi(params, config.apiKey);
      }
    })
  ]
});
