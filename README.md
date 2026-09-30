# Tradebee (小蜜蜂数字营销) - MCP Plugin

Connect your AI agent to your Tradebee digital marketing website.

Tradebee exposes one remote MCP tool for querying, optimizing, customizing, analyzing, and managing content, inquiries, visitors, keywords, traffic, products, news, FAQs, custom pages, blogs, navigation, and pages.

The connector supports **OpenAI Codex**, **OpenClaw**, and **WorkBuddy**.

## Install

### OpenAI Codex

Install the Tradebee plugin in Codex:

```bash
codex plugin add tradebee
```

After installation, set one `BEE_API_KEY` environment variable for the Codex MCP connection.

Codex can then discover and use the Tradebee tools exposed by the plugin and remote MCP server.

### OpenClaw

Install the Tradebee plugin from npm:

```bash
openclaw plugins install clawhub:tradebee
```

After installation, set one `BEE_API_KEY` environment variable for OpenClaw. All agents using this plugin share that key. The MCP endpoint is fixed at `https://mcp.tradew.com/mcp` and does not need configuration.

### WorkBuddy

The WorkBuddy connector files are at the root of this directory: `connector-meta.json`, `mcp.json`, `token-schema.json`, `icon.svg`, and `skills/tradebee/SKILL.md`. Package these files with the `skills/` directory as the connector root for WorkBuddy import or review. WorkBuddy 4.24.0 or later asks each user for their own Tradebee API Key and inserts it into the HTTPS MCP request header. No API Key belongs in the package.

## What you get

- **Tradebee tools**  
  Access Tradebee platform operations through structured AI tools.

- **Remote MCP access**  
  Tool requests are forwarded to the Tradebee MCP service:

  ```text
  https://mcp.tradew.com/mcp
  ```

- **API schema discovery**  
  AI agents can understand supported actions, parameters, required fields, and response structures through the toolkit's JSON Schema definitions.

- **Platform management**  
  Manage supported Tradebee resources such as products, product groups, FAQs, FAQ groups, news, blogs, pages, inquiries, SEO content, and other platform data.

- **Centralized validation**  
  Authentication, permissions, parameter validation, ownership checks, and business rules are enforced by the Tradebee server.

## Architecture

The Tradebee AI Toolkit uses a client-server architecture:

```text
User
  ↓
OpenAI Codex / OpenClaw / WorkBuddy
  ↓
Tradebee plugin / connector
  ↓
Tradebee AI Toolkit
  ↓
https://mcp.tradew.com/mcp
  ↓
Tradebee MCP Server
  ↓
Tradebee API
  ↓
Tradebee SaaS Platform
```

The AI client is responsible for selecting and calling the appropriate Tradebee tools.

The Tradebee MCP server is responsible for authentication, validation, permission checks, business logic, and communication with the Tradebee API.

## Tool execution

Tradebee exposes its platform capabilities through structured actions.

For example:

```json
{
  "action": "languages-get"
}
```

The available actions and parameters are defined by the toolkit's canonical JSON Schema.

The plugin forwards tool calls to the Tradebee MCP server, where the request is validated and executed.

## API keys

Tradebee is a SaaS platform, and each customer can use their own API key.

API keys are used by the Tradebee MCP server to identify the customer and determine which Tradebee resources the agent is allowed to access.

API keys should never be embedded directly into prompts, generated content, or source code committed to a repository.

Provide `BEE_API_KEY` through the environment used by Codex or OpenClaw. In WorkBuddy, enter it in the connector's password field; WorkBuddy injects it as a Bearer header.

## Validation and security

All critical validation is performed on the Tradebee server.

This includes:

- API key validation
- Customer authentication
- Permission checks
- Resource ownership checks
- Required parameter validation
- Parameter type validation
- Language validation
- Business rule validation

Client-side plugin instructions and schemas help the AI agent use the tools correctly, but they are not treated as a security boundary.

The server remains the source of truth.

## MCP server

The Tradebee remote MCP endpoint is:

```text
https://mcp.tradew.com/mcp
```

Clients communicate with this endpoint using the Model Context Protocol.

The remote MCP server allows Tradebee to update platform logic, validation, and tool behavior without requiring all business logic to be duplicated in every AI client.

## Supported clients

Currently supported:

- OpenAI Codex
- OpenClaw
- WorkBuddy

Support for additional AI agent platforms may be added in the future.

## Updates

Tool definitions and schemas may evolve as Tradebee adds new platform capabilities.

Keeping the Tradebee plugin updated ensures the AI agent has access to the latest supported actions and schemas.