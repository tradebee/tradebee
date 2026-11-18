import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export function registerTradebeeTools(api, tools, connection) {
    for (const tool of tools) {
        api.registerTool({
            name: `${connection.name}__${tool.name}`,
            description: tool.description ?? tool.name,
            parameters: tool.inputSchema,
            async execute(_id, params, signal) {
                // Read the Gateway environment on every call, without storing the key.
                const key = process.env[connection.tokenEnvVar]?.trim();
                if (!key) throw new Error(`Set ${connection.tokenEnvVar} in the OpenClaw Gateway environment and restart the Gateway.`);
                const requestSignal = AbortSignal.any([
                    AbortSignal.timeout(connection.timeout),
                    ...signal ? [signal] : []
                ]);
                const client = new Client({ name: `${connection.name}-openclaw`, version: connection.version });
                const transport = new StreamableHTTPClientTransport(new URL(connection.url), {
                    requestInit: {
                        headers: { Authorization: `Bearer ${key}` },
                        signal: requestSignal,
                        redirect: "error"
                    }
                });
                try {
                    await client.connect(transport);
                    const result = await client.callTool({ name: tool.name, arguments: params }, undefined, {
                        timeout: connection.timeout,
                        signal: requestSignal
                    });
                    return { ...result, details: result.structuredContent ?? { isError: result.isError === true } };
                } catch {
                    // Transport errors may contain sensitive upstream bodies or headers.
                    throw new Error("Tradebee MCP request failed. Check Gateway connectivity and API key validity.");
                } finally {
                    await transport.terminateSession().catch(() => {});
                    await client.close().catch(() => {});
                }
            }
        });
    }
}
