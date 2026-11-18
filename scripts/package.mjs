import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { agents, project, readTemplate, renderTemplate, validateConfig } from "./config.mjs";

const { values } = parseArgs({
    options: {
        output: {
            type: "string"
        }
    }
});
const { pkg } = validateConfig();
const output = resolve(values.output ?? "E:/PrecompiledWeb/MNCloud2016/MNmcpclient");
const sourceFromOutput = relative(output, fileURLToPath(project));
if (!sourceFromOutput || (!sourceFromOutput.startsWith("..") && !isAbsolute(sourceFromOutput))) {
    throw new Error("Package output must not be the project directory or one of its parents");
}
for (const entry of ["codex", "openclaw", "workbuddy", "assets"]) {
    const insideSource = relative(fileURLToPath(new URL(entry, project)), output);
    if (!insideSource || (!insideSource.startsWith("..") && !isAbsolute(insideSource))) {
        throw new Error("Package output must not be inside a bundled source directory");
    }
}
const npmCli = process.env.npm_execpath ?? join(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
if (!existsSync(npmCli)) {
    throw new Error("Cannot locate npm CLI. Run this script using npm run package.");
}
mkdirSync(output, { recursive: true });
const stage = mkdtempSync(join(output, ".package-"));
const workbuddyFiles = ["connector-meta.json", "mcp.json", "token-schema.json", "icon.svg", "skills", "LICENSE", "README.md"];

function writeJson(path, value) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

function run(command, args) {
    const result = spawnSync(command, args, {
        cwd: stage,
        encoding: "utf8",
        timeout: 120_000
    });
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${command} failed (${result.status}): ${result.stderr}`);
    }
    return result.stdout;
}

let preserveStage = false;
try {
    const plugin = join(stage, "codex");
    const openclaw = join(stage, "openclaw");
    const workbuddy = join(stage, "workbuddy");
    for (const agent of agents) {
        const destination = join(stage, agent.id);
        const skillDirectory = join(destination, "skills", pkg.name);
        mkdirSync(skillDirectory, { recursive: true });
        const readme = renderTemplate(readFileSync(new URL("README.md", project), "utf8"), project, agent);
        writeFileSync(join(destination, "README.md"), readme);
        writeFileSync(join(skillDirectory, "SKILL.md"), readme);
    }
    for (const entry of ["assets", "LICENSE"]) {
        for (const destination of [plugin, openclaw]) {
            cpSync(new URL(entry, project), join(destination, entry), { recursive: true });
        }
    }
    for (const entry of [".codex-plugin/plugin.json", ".mcp.json"]) {
        writeJson(join(plugin, entry), readTemplate(`codex/${entry}`));
        writeJson(join(openclaw, entry), readTemplate(`openclaw/${entry}`));
    }
    writeJson(join(openclaw, "package.json"), readTemplate("openclaw/package.json"));
    for (const entry of workbuddyFiles) {
        if (entry === "skills" || entry === "README.md") {
            continue;
        }
        let source;
        if (entry === "icon.svg") {
            source = "assets/logo.svg";
        } else if (entry === "LICENSE") {
            source = entry;
        } else {
            source = `workbuddy/${entry}`;
        }
        if (entry.endsWith(".json")) {
            writeJson(join(workbuddy, entry), readTemplate(source));
        } else {
            cpSync(new URL(source, project), join(workbuddy, entry), { recursive: true });
        }
    }
    const { name, version } = pkg;
    const [packed] = JSON.parse(run(process.execPath,
        [npmCli, "pack", "./openclaw", "--ignore-scripts", "--offline", "--json"]));
    const tar = process.platform === "win32" ? "tar.exe" : "tar";
    const codexArchive = `${name}-codex-${version}.zip`;
    const workbuddyArchive = `${name}-workbuddy-${version}.zip`;
    // The upload ZIP contains one plugin at its root, without the marketplace wrapper.
    run(tar, [
        "-a", "-cf", codexArchive,
        "-C", "codex",
        ".codex-plugin", ".mcp.json", "assets", "skills", "LICENSE", "README.md"
    ]);
    run(tar, ["-a", "-cf", workbuddyArchive, "-C", "workbuddy", ...workbuddyFiles]);

    // Build all archives before replacing the release. Replace only owned targets.
    const entries = ["codex", "openclaw", "workbuddy", packed.filename, codexArchive, workbuddyArchive];
    const published = [];
    const backedUp = [];
    const backup = join(stage, "previous");
    mkdirSync(backup);
    try {
        for (const entry of entries) {
            const target = join(output, entry);
            if (existsSync(target)) {
                renameSync(target, join(backup, entry));
                backedUp.push(entry);
            }
            renameSync(join(stage, entry), target);
            published.push(entry);
        }
    } catch (error) {
        try {
            for (const entry of published.reverse()) {
                renameSync(join(output, entry), join(stage, entry));
            }
            for (const entry of backedUp.reverse()) {
                renameSync(join(backup, entry), join(output, entry));
            }
        } catch (rollbackError) {
            preserveStage = true;
            throw new AggregateError([error, rollbackError], `Release rollback failed; recovery files retained in ${stage}`);
        }
        throw error;
    }
    console.log(`Packaged ${name} ${version} for OpenClaw, Codex, and WorkBuddy in ${output}`);
} finally {
    // stage is a freshly created directory directly under the selected output.
    if (!preserveStage) {
        rmSync(stage, {
            recursive: true,
            force: true
        });
    }
}
