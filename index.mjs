import { readFileSync } from "node:fs";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { registerTradebeeTools } from "./runtime.mjs";

const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const connection = readJson("./connection.json");
const tools = readJson("./tools.json");

export default definePluginEntry({
    id: connection.name,
    name: connection.name,
    description: "Connect Tradebee website tools through MCP.",
    register(api) {
        registerTradebeeTools(api, tools, connection);
    }
});
