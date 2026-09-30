import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export const TRADEBEE_MCP_URL = "https://mcp.tradew.com/mcp";

export interface ServerOptions {
    apiKey: string;
}

export async function callTradebee(request: Record<string, unknown>, options: ServerOptions): Promise<unknown> {
    if (!options.apiKey?.trim()) throw new Error("A Tradebee API key is required for this client user.");
    const transport = new StreamableHTTPClientTransport(new URL(TRADEBEE_MCP_URL), {
        requestInit: { headers: { Authorization: `Bearer ${options.apiKey}` } }
    });
    const client = new Client({ name: "tradebee-mcp-client", version: "26.9.30" });
    try {
        await client.connect(transport);
        const result = await client.callTool({ name: "tradebee", arguments: request });
        if (result.structuredContent) return result.structuredContent;
        const content: unknown = result.content;
        const text = Array.isArray(content)
            ? content.find((item: unknown) => item !== null && typeof item === "object" && "type" in item && item.type === "text")
            : undefined;
        if (text && typeof text.text === "string") {
            try { return JSON.parse(text.text); } catch { return { status: !result.isError, msg: text.text }; }
        }
        return { status: !result.isError, msg: result.isError ? "MCP tool call failed." : "MCP tool returned no content." };
    } finally {
        await client.close();
    }
}
