import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export const project = new URL("../", import.meta.url);
export const agents = [
    {
        id: "openclaw",
        name: "OpenClaw"
    },
    {
        id: "codex",
        name: "Codex"
    },
    {
        id: "workbuddy",
        name: "WorkBuddy"
    }
];
export function readJson(path, root = project) {
    return JSON.parse(readFileSync(new URL(path, root), "utf8"));
}

export function renderTemplate(value, root = project, agent) {
    const pkg = readJson("package.json", root);
    const settings = readJson("config.json", root);
    const globals = {
        ...settings,
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        license: pkg.license,
        agent: {
            ...agent,
            toolPrefix: agent?.id === "openclaw" ? `${pkg.name}__` : ""
        },
        mcp: {
            ...settings.mcp,
            authorization: `Bearer \${${settings.mcp.tokenEnvVar}}`
        }
    };
    const lookup = key => {
        const result = key.split(".").reduce((current, part) => {
            if (current && Object.hasOwn(current, part)) {
                return current[part];
            }
            return undefined;
        }, globals);
        assert.notEqual(result, undefined, `Unknown global setting: ${key}`);
        return result;
    };
    const render = item => {
        if (typeof item === "string") {
            const exact = /^\$\{([\w.]+)\}$/.exec(item);
            if (exact) {
                return structuredClone(lookup(exact[1]));
            }
            return item.replace(/\$\{([\w.]+)\}/g, (_, key) => {
                const result = lookup(key);
                assert.ok(["string", "number", "boolean"].includes(typeof result), `Setting ${key} must be scalar here`);
                return String(result);
            });
        }
        if (Array.isArray(item)) {
            return item.map(render);
        }
        if (item && typeof item === "object") {
            return Object.fromEntries(Object.entries(item).map(([key, child]) => {
                return [render(key), render(child)];
            }));
        }
        return item;
    };
    return render(value);
}

export function readTemplate(path, root = project) {
    return renderTemplate(readJson(path, root), root);
}

// Check the separately consumed manifests before touching release files.
export function validateConfig(root = project) {
    const pkg = readJson("package.json", root);
    const manifest = readTemplate("codex/.codex-plugin/plugin.json", root);
    const clawManifest = readTemplate("openclaw/.codex-plugin/plugin.json", root);
    const clawPackage = readTemplate("openclaw/package.json", root);
    const clawConfig = readTemplate("openclaw/.mcp.json", root);
    const connector = readTemplate("workbuddy/connector-meta.json", root);
    const codex = readTemplate("codex/.mcp.json", root);
    const workbuddy = readTemplate("workbuddy/mcp.json", root);
    const token = readTemplate("workbuddy/token-schema.json", root);
    assert.match(pkg.name, /^[a-z][a-z0-9-]*$/);
    assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
    assert.ok(typeof pkg.description === "string" && pkg.description.trim());
    for (const metadata of [manifest, clawManifest, clawPackage, connector]) {
        for (const key of ["name", "version", "description"]) {
            assert.equal(metadata[key], pkg[key], `${key} differs from global package.json`);
        }
    }
    assert.equal(manifest.name, pkg.name, "Codex plugin name differs from package.json");
    assert.equal(connector.source, pkg.name, "WorkBuddy source differs from package.json");
    assert.equal(manifest.version, pkg.version, "Codex version differs from package.json");
    assert.equal(connector.version, pkg.version, "WorkBuddy version differs from package.json");
    assert.equal(clawManifest.name, pkg.name);
    assert.equal(clawManifest.version, pkg.version, "OpenClaw manifest version differs from package.json");
    assert.equal(clawManifest.mcpServers, "./.mcp.json");
    assert.equal(clawManifest.skills, "./skills/");
    assert.equal(clawPackage.name, pkg.name);
    assert.equal(clawPackage.version, pkg.version, "OpenClaw package version differs from package.json");
    assert.deepEqual(clawPackage.files, [".codex-plugin", ".mcp.json", "assets", "skills", "LICENSE", "README.md"]);
    assert.equal(manifest.mcpServers, "./.mcp.json");
    assert.equal(manifest.skills, "./skills/");
    assert.deepEqual(Object.keys(codex.mcpServers), [pkg.name]);
    assert.deepEqual(Object.keys(workbuddy.mcpServers), [pkg.name]);
    const server = codex.mcpServers[pkg.name];
    const endpoint = new URL(server.url);
    assert.equal(server.type, "http");
    assert.equal(endpoint.protocol, "https:", "Release MCP endpoint must use HTTPS");
    assert.equal(endpoint.username + endpoint.password + endpoint.search + endpoint.hash, "",
        "Release MCP endpoint must not contain credentials, query parameters, or a fragment");
    assert.match(server.bearer_token_env_var, /^[A-Z][A-Z0-9_]*$/);
    assert.deepEqual(clawConfig.mcpServers, {
        [pkg.name]: {
            transport: "streamable-http",
            url: server.url,
            headers: {
                Authorization: `Bearer \${${server.bearer_token_env_var}}`
            }
        }
    }, "OpenClaw MCP endpoint or authentication differs from Codex");
    const buddy = workbuddy.mcpServers[pkg.name];
    assert.equal(buddy.type, "streamableHttp");
    assert.equal(buddy.url, server.url, "WorkBuddy endpoint differs from Codex");
    assert.deepEqual(buddy.headers, { Authorization: `Bearer \${${server.bearer_token_env_var}}` });
    assert.ok(Number.isInteger(buddy.timeout) && buddy.timeout > 0);
    assert.equal(connector.auth_mode, "token");
    assert.ok(token.fields.some(field => {
        return field.key === server.bearer_token_env_var
            && field.type === "password"
            && field.required === true;
    }), "Missing required API key field");
    for (const agent of agents) {
        const readme = renderTemplate(readFileSync(new URL("README.md", root), "utf8"), root, agent);
        assert.match(readme, new RegExp(`^version: ${pkg.version.replaceAll(".", "\\.")}\\r?$`, "m"));
    }
    for (const asset of [manifest.interface.logo, manifest.interface.composerIcon,
        clawManifest.interface.logo, clawManifest.interface.composerIcon]) {
        assert.ok(asset.startsWith("./assets/") && !asset.includes(".."), "Invalid plugin asset path");
        readFileSync(new URL(asset, root));
    }
    return {
        pkg,
        server
    };
}
