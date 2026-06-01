// (C) 2026 GoodData Corporation

import { existsSync } from "fs";
import { join, resolve, sep } from "path";

import {
    computeDevPort,
    computeFederationName,
    computeRemoteUrlEnvVar,
    computeRoute,
    getOwnPackageVersion,
} from "../engine/derived.js";
import { ensureTrailingCommaBeforeAnchor } from "../engine/jsonAnchors.js";
import { validateTextValue } from "../engine/prompts.js";
import { installCommand, runCommand } from "../engine/spawn.js";
import type {
    IDerivedValues,
    IProfileContext,
    IRegistrationStep,
    IRepoInfo,
    IScaffoldAnswers,
    IScaffoldProfile,
    TokenReplacements,
} from "../types.js";

const DEST_PATH_KEY = "destPath";

/**
 * Rewrites `workspace:*` deps to a concrete semver range based on this
 * scaffolder's own version. The scaffolder ships locked to the SDK release
 * train (versionPolicyName: "sdk"), so its version matches the SDK packages
 * the templates depend on.
 *
 * We use a caret range so consumers get patch + minor updates within the SDK
 * release train; alpha versions get exact pin since semver caret behaves
 * surprisingly across prerelease boundaries.
 */
function buildClientDepVersion(): string {
    const ownVersion = getOwnPackageVersion();
    if (ownVersion.includes("-")) {
        // Prerelease (alpha/beta/rc) — pin exactly.
        return ownVersion;
    }
    return `^${ownVersion}`;
}

/**
 * Rewrites `workspace:*` deps to a concrete version — except for the
 * just-scaffolded siblings (the new `<app>-module` / `<app>-harness`), which
 * stay `workspace:*` because they're brand-new local packages with no
 * published version. The client repo's package manager resolves them via its
 * own workspaces feature (Rush, pnpm workspaces, yarn workspaces, etc.).
 */
function rewriteWorkspaceDeps(
    deps: Record<string, string> | undefined,
    version: string,
    siblings: ReadonlySet<string>,
): Record<string, string> | undefined {
    if (!deps) return deps;
    const out: Record<string, string> = {};
    for (const [name, range] of Object.entries(deps)) {
        if (range === "workspace:*") {
            out[name] = siblings.has(name) ? "workspace:*" : version;
        } else {
            out[name] = range;
        }
    }
    return out;
}

export const clientProfile: IScaffoldProfile = {
    name: "client",

    extraPrompts: [
        {
            key: DEST_PATH_KEY,
            label: "Destination path (relative to cwd, default ./modules/<name>)",
            optional: true,
            validate: validateTextValue,
        },
    ],

    resolveDestRoot(answers, cwd) {
        const overridden = answers[DEST_PATH_KEY];
        if (overridden) {
            const resolved = resolve(cwd, overridden);
            // Reject path traversal: `..` segments or absolute paths outside cwd.
            // The text-validation regex blocks shell-injection chars but not `..`,
            // so a value like "../../etc" would otherwise resolve outside cwd.
            // `+ sep` prevents prefix-overlap matches (`/proj` vs `/proj-other`).
            if (resolved !== cwd && !resolved.startsWith(cwd + sep)) {
                throw new Error(
                    `destPath "${overridden}" resolves outside the current directory (${resolved}). ` +
                        `Choose a destination inside ${cwd}.`,
                );
            }
            return resolved;
        }
        return join(cwd, "modules", answers.appName);
    },

    templateSubtrees: ["module", "harness"],

    derive(answers: IScaffoldAnswers, repo: IRepoInfo): IDerivedValues {
        const devPort = computeDevPort(repo.repoRoot);
        return {
            route: computeRoute(answers.appName),
            federationName: computeFederationName(answers.appName),
            remoteUrlEnvVar: computeRemoteUrlEnvVar(answers.appName),
            devPort,
            moduleDevPort: devPort + 100,
            // No host menu to slot into — keep a stable default so scaffolded apps
            // are still self-consistent and the harness can still read it.
            menuOrder: 100,
        };
    },

    buildReplacements(ctx: IProfileContext): TokenReplacements {
        const { answers, derived } = ctx;
        // Order matters: longer tokens (containing shorter ones as substring)
        // MUST come first. `gdc-app-template-module` before `gdc-app-template`.
        return [
            ["gdc-app-template-name-module", `${answers.appName}-module`],
            ["gdc-app-template-name-harness", `${answers.appName}-harness`],
            ["gdc-app-template-name", answers.appName],
            ["{applicationTemplateTitle}", answers.title],
            ["{applicationTemplateScope}", answers.scope],
            ["{applicationTemplateFederationName}", derived.federationName],
            ["APP_TEMPLATE_REMOTE_URL", derived.remoteUrlEnvVar],
            ["/app-template-route", derived.route],
            ["{harnessPort}", String(derived.devPort)],
            ["{modulePort}", String(derived.moduleDevPort)],
            // The template `clean` script prepends a call to gdc-ui's
            // `common/scripts/clean-command-state.sh` — that helper exists only
            // inside the gdc-ui monorepo. For client scaffolds, strip the helper
            // call entirely; the trailing `rm -rf …` cleans the dirs that matter
            // and is self-contained.
            ["../../../../common/scripts/clean-command-state.sh && ", ""],
        ];
    },

    transformPackageJson(pkg, ctx) {
        const version = buildClientDepVersion();
        // Brand-new sibling packages we just scaffolded — they have no published
        // version yet, so `workspace:*` must stay for the client repo's
        // workspace machinery (Rush / pnpm / yarn workspaces) to resolve them.
        const siblings: ReadonlySet<string> = new Set([
            `${ctx.answers.appName}-module`,
            `${ctx.answers.appName}-harness`,
        ]);
        const out = { ...pkg } as Record<string, unknown>;
        out.dependencies = rewriteWorkspaceDeps(
            pkg.dependencies as Record<string, string> | undefined,
            version,
            siblings,
        );
        out.devDependencies = rewriteWorkspaceDeps(
            pkg.devDependencies as Record<string, string> | undefined,
            version,
            siblings,
        );
        out.peerDependencies = rewriteWorkspaceDeps(
            pkg.peerDependencies as Record<string, string> | undefined,
            version,
            siblings,
        );
        // Drop _phase:* scripts — those are Rush-specific build phases and would
        // break npm/yarn/pnpm install in a client repo.
        if (out.scripts && typeof out.scripts === "object") {
            const filtered: Record<string, string> = {};
            for (const [k, v] of Object.entries(out.scripts as Record<string, string>)) {
                if (!k.startsWith("_phase:")) filtered[k] = v;
            }
            out.scripts = filtered;
        }
        return out;
    },

    registrations(repo: IRepoInfo): readonly IRegistrationStep[] {
        if (repo.packageManager !== "rush") {
            // Client repos without a Rush workspace have nothing to register;
            // the scaffold is purely additive (new files only).
            return [];
        }
        // Inside a Rush workspace, still register in rush.json so `rush update`
        // picks up the new packages. Doesn't touch the host (none in client repos).
        return [
            {
                file: "rush.json",
                preInsertTransform: ensureTrailingCommaBeforeAnchor,
                emit: (ctx) => emitRushJsonEntries(ctx.answers.appName, "    "),
            },
        ];
    },

    async postCopy(ctx) {
        const { command, args } = installCommand(ctx.packageManager);
        console.log(`\n  Running ${command} ${args.join(" ")} ...\n`);
        const ok = runCommand(command, args, ctx.repoRoot);
        printClientNextSteps(ctx, command, args, ok);
    },
};

function emitRushJsonEntries(appName: string, indent: string): string[] {
    return [
        `${indent}{`,
        `${indent}    "packageName": "${appName}-module",`,
        `${indent}    "projectFolder": "modules/${appName}/module"`,
        `${indent}},`,
        `${indent}{`,
        `${indent}    "packageName": "${appName}-harness",`,
        `${indent}    "projectFolder": "modules/${appName}/harness"`,
        `${indent}},`,
    ];
}

function printClientNextSteps(
    ctx: IProfileContext,
    installCmd: string,
    installArgs: readonly string[],
    installOk: boolean,
): void {
    const { answers, derived, destRoot, repoRoot } = ctx;
    const relativeDest = destRoot.startsWith(repoRoot)
        ? destRoot.slice(repoRoot.length).replace(/^[\\/]/, "")
        : destRoot;

    const harnessDir = `${relativeDest}/harness`;
    const moduleDir = `${relativeDest}/module`;
    const nextSteps: string[] = [];
    if (!installOk) nextSteps.push(`${installCmd} ${installArgs.join(" ")}`);
    nextSteps.push(`cd ${harnessDir}`);
    nextSteps.push("# Local harness dev loop (imports module source directly — no federation):");
    nextSteps.push("cp .env.template .env   # and fill in TIGER_API_TOKEN");
    nextSteps.push("npm run dev");
    nextSteps.push(
        `# Run the module as a federation remote (rebuild on change + preview at :${derived.moduleDevPort}):`,
    );
    nextSteps.push(`cd ${moduleDir} && npm run dev`);

    const numbered = nextSteps.map((step, i) => `    ${i + 1}. ${step}`).join("\n");
    const header = installOk
        ? "Done! Your new application has been scaffolded and dependencies installed."
        : "Your new application has been scaffolded, but the dependency install failed — re-run it before continuing.";

    console.log(`
  ${header}

  Next steps:
${numbered}

  Summary:
    - ID:              ${answers.appName}
    - Route:           ${derived.route}
    - Federation name: ${derived.federationName}
    - Remote URL env:  ${derived.remoteUrlEnvVar} (set in harness .env to point at a federation preview)
    - Dev default:     https://localhost:${derived.moduleDevPort}/remoteEntry.js
`);

    // Sanity check — print a warning if .env.template doesn't exist where we expect.
    if (!existsSync(join(destRoot, "harness", ".env.template"))) {
        console.warn(
            `  Warning: ${harnessDir}/.env.template not found. Expected one from the template subtree.`,
        );
    }
}
