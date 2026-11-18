# Tradebee native OpenClaw plugin

This is a native **code-plugin**, with a real JavaScript entry and tools registered through the OpenClaw SDK. Codex is not required.

## Installation

Use Node.js 24.16 or later and OpenClaw 2026.8.2 or later. Entry loading and tool registration are verified against OpenClaw 2026.8.2; other host versions require their own validation.

```powershell
openclaw plugins install npm-pack:./tradebee-26.11.18.tgz
```

Set `BEE_API_KEY` in the environment of the process running the OpenClaw Gateway, then restart the Gateway and start a new session. Get the API key from Tradebee's API Key management page. Never paste it into a chat. Try `tradebee__languages-get` with `{}`.

The plugin reads the key for each execution and connects directly to `https://mcp.tradew.com/mcp` using Streamable HTTP. Keys are not stored in the package.

## Publishing and updates

Upload the generated package as **code-plugin**, not the unrendered source templates. ClawHub requires the GitHub source repository and the exact commit containing the release sources. Local validation is not a market release.

When MNmcpserver tools change, run `npm run openclaw:catalog` in MNmcpclient, review `openclaw/tools.json`, run `npm test`, then rebuild. Catalogue generation reads schemas over an in-memory MCP connection without website API calls. Tool schema updates require a new plugin package.
