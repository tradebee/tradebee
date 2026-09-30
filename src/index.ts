import { readFileSync } from "node:fs";
import { defineToolPlugin } from "openclaw/plugin-sdk/tool-plugin";
import { Type } from "typebox";
import { resolveApiKey } from "./auth.js";
import { callTradebee } from "./client.js";

const schema = JSON.parse(readFileSync(new URL("../tool.schema.json", import.meta.url), "utf8"));
const inputSchema = Type.Unsafe<Record<string, unknown>>(schema.input);
const outputSchema = Type.Unsafe<Record<string, unknown>>(schema.output);

export default defineToolPlugin({
    id: "tradebee",
    name: "Tradebee AI Toolkit",
    description: "Connect OpenClaw to Tradebee MCP using BEE_API_KEY.",
    configSchema: Type.Object({}, { additionalProperties: false }),
    tools: (tool) => [tool({
        name: "tradebee",
        label: "Tradebee MCP",
        description: schema.description,
        parameters: inputSchema,
        factory() {
            if (!resolveApiKey()) return null;
            return {
                name: "tradebee",
                label: "Tradebee MCP",
                description: schema.description,
                parameters: inputSchema,
                outputSchema,
                async execute(_toolCallId: string, params: unknown, signal?: AbortSignal) {
                    signal?.throwIfAborted();
                    const apiKey = resolveApiKey();
                    if (!apiKey) {
                        const error = { status: false, msg: "Tradebee API key is unavailable." };
                        return { content: [{ type: "text" as const, text: JSON.stringify(error) }], details: error };
                    }
                    const result = await callTradebee(params as Record<string, unknown>, {
                        apiKey
                    });
                    return { content: [{ type: "text" as const, text: JSON.stringify(result) }], details: result };
                }
            };
        }
    })]
});
