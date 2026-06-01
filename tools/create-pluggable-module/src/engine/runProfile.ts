// (C) 2026 GoodData Corporation

import { existsSync, readFileSync, writeFileSync } from "fs";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";

import type {
    IProfileContext,
    IRegistrationStep,
    IRepoInfo,
    IScaffoldAnswers,
    IScaffoldProfile,
} from "../types.js";

import { insertBeforeAnchor } from "./anchors.js";
import { checkAnchors } from "./checkAnchors.js";
import { copyTemplate } from "./copyTemplate.js";
import { runPrompts } from "./prompts.js";
import { detectRepo } from "./repoDetection.js";

/**
 * Resolves the on-disk location of a single template subtree (`module` or `harness`).
 *
 * Two cases:
 *   1. Published: prepack-bundle-template.sh copied templates into our own
 *      package's `dist/templates/<subtree>/`. Use those — already path-rewritten.
 *   2. Workspace dev: resolve the template package via require.resolve, so the
 *      dependency graph stays honest. Templates live as workspace siblings.
 *
 * The template package names are the literal placeholder strings that get
 * substituted at scaffold time. They look like template tokens; they ARE real
 * workspace package identifiers.
 */
function getTemplateSubtreeRoot(
    subtree: string,
    preferWorkspace: boolean,
    explicitRoots: Readonly<Record<string, string>> | undefined,
): string {
    // 1. Explicit override wins. Profiles use this when the templates aren't
    //    resolvable from the engine's runtime location — e.g. gdc-ui's internal
    //    scaffolder, where the engine runs from a transitively-installed
    //    `.pnpm/.../@gooddata/create-pluggable-module/` location that doesn't
    //    have the workspace template packages alongside.
    const explicit = explicitRoots?.[subtree];
    if (explicit) {
        if (!existsSync(explicit)) {
            throw new Error(
                `Profile-supplied templateSubtreeRoots["${subtree}"] points at "${explicit}" but no directory exists there.`,
            );
        }
        return explicit;
    }

    // 2. `preferWorkspaceTemplate` opts out of the bundled `dist/templates/`
    //    path AND requires the profile to supply paths. Without paths there's
    //    no safe place to find workspace templates at runtime — fail loudly
    //    instead of falling through to brittle dependency-graph resolution.
    if (preferWorkspace) {
        throw new Error(
            `Profile sets preferWorkspaceTemplate=true but did not supply templateSubtreeRoots["${subtree}"]. ` +
                `Workspace templates can't be resolved at runtime without an explicit absolute path — ` +
                `populate templateSubtreeRoots[] in the profile (typically via import.meta.url-relative resolution).`,
        );
    }

    // 3. Published path under dist/templates/ — created by prepack-bundle-template.sh
    //    just before `npm pack` and consumed by external clients via `npm init`.
    //    The bundled tsconfigs are pre-inlined so they don't need workspace parents.
    const here = dirname(fileURLToPath(import.meta.url));
    const publishedRoot = join(here, "..", "..", "dist", "templates", subtree);
    if (existsSync(publishedRoot)) return publishedRoot;

    // 4. Nothing left to try. Both paths require setup we don't have.
    throw new Error(
        `No template root for subtree "${subtree}". Either supply templateSubtreeRoots["${subtree}"] in the profile, ` +
            `or ensure dist/templates/${subtree}/ exists (run prepack-bundle-template.sh).`,
    );
}

export async function runProfile(profile: IScaffoldProfile): Promise<void> {
    // 1. Detect the repo shape — drives everything downstream.
    const repo = detectRepo(process.cwd());

    // 2. Pre-flight: every file the profile wants to register in must already
    //    carry the right anchor. Bail before prompts so we don't half-scaffold.
    const steps = profile.registrations(repo);
    checkAnchors(steps, repo.repoRoot);

    // 3. Prompts: shared appName/title/scope + the profile's extras.
    const answers = await runPrompts(profile.extraPrompts);

    await runProfileWithAnswers(profile, answers, { repo, steps });
}

/**
 * Test-friendly variant: skip prompt collection, take answers as input.
 * Also useful for programmatic consumers that want to drive the scaffolder
 * without an interactive TTY.
 *
 * @alpha
 */
export async function runProfileWithAnswers(
    profile: IScaffoldProfile,
    answers: IScaffoldAnswers,
    options?: {
        /** Optional repo override (defaults to detecting from process.cwd()). */
        repo?: IRepoInfo;
        /**
         * Optional pre-resolved registration steps. The engine usually recomputes
         * these from `profile.registrations(repo)`; tests can pass a fixture set.
         */
        steps?: readonly IRegistrationStep[];
    },
): Promise<void> {
    const repo = options?.repo ?? detectRepo(process.cwd());
    const steps = options?.steps ?? profile.registrations(repo);

    // Pre-flight in case caller didn't already do it (the prompts entry does).
    if (!options?.steps) {
        checkAnchors(steps, repo.repoRoot);
    }

    // 4. Resolve destRoot via the profile (it may consume an extra prompt like
    //    destPath) THEN check the destination doesn't already exist. Hard-coding
    //    `modules/<name>` here would miss real collisions when the client profile
    //    rewrote destPath, and would false-positive when the user explicitly
    //    targeted somewhere else.
    const destRoot = profile.resolveDestRoot(answers, repo.repoRoot);
    if (existsSync(destRoot)) {
        throw new Error(
            `Destination ${destRoot} already exists. Choose a different app name or destPath, or remove the directory.`,
        );
    }

    // 5. Derived values. Profile-specific because devPort scanning and menuOrder
    //    computation depend on the host's registry shape.
    const derived = profile.derive(answers, repo);

    const ctx: IProfileContext = {
        answers,
        derived,
        repoRoot: repo.repoRoot,
        destRoot,
        packageManager: repo.packageManager,
    };

    printPlan(ctx, profile);

    // 6. Copy template subtrees in declared order, applying token replacements.
    const replacements = profile.buildReplacements(ctx);
    const packageJsonsToTransform: string[] = [];

    const preferWorkspace = profile.preferWorkspaceTemplate ?? false;
    for (const subtree of profile.templateSubtrees) {
        // getTemplateSubtreeRoot guarantees the returned path exists — every
        // branch either throws or returns a path that just passed existsSync.
        const srcDir = getTemplateSubtreeRoot(subtree, preferWorkspace, profile.templateSubtreeRoots);
        const destSubtree = join(destRoot, subtree);
        console.log(`\n  Copying template ${subtree}/ → ${relativeTo(repo.repoRoot, destSubtree)}/ ...`);
        const { written } = copyTemplate(srcDir, destSubtree, replacements);

        // Collect package.json paths for the post-copy transform pass.
        for (const path of written) {
            if (basename(path) === "package.json") {
                packageJsonsToTransform.push(path);
            }
        }
    }

    // 6b. Apply profile-specific overlays on top of the templates. Used by
    //     profiles that need files which shouldn't live in the shared template
    //     (e.g. internal-only deploy configs that would leak GoodData infra if
    //     shipped to client repos). See IOverlayPath.
    for (const overlay of profile.overlayPaths ?? []) {
        if (!existsSync(overlay.srcDir)) {
            throw new Error(
                `Overlay source directory "${overlay.srcDir}" (destSubdir "${overlay.destSubdir}") does not exist.`,
            );
        }
        const destSubtree = join(destRoot, overlay.destSubdir);
        console.log(
            `  Applying overlay → ${relativeTo(repo.repoRoot, destSubtree)}/ (from ${overlay.srcDir}) ...`,
        );
        const { written } = copyTemplate(overlay.srcDir, destSubtree, replacements);
        for (const path of written) {
            if (basename(path) === "package.json") {
                packageJsonsToTransform.push(path);
            }
        }
    }

    // 7. Per-package.json transform. Internal profile is a no-op; client rewrites
    //    workspace:* deps to concrete semver versions.
    for (const path of packageJsonsToTransform) {
        const before = JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
        const after = profile.transformPackageJson(before, ctx);
        // 4-space indent + trailing newline matches the rest of the SDK.
        writeFileSync(path, JSON.stringify(after, null, 4) + "\n", "utf-8");
    }

    // 8. Anchor-driven file edits. Sequential because edits to the same file from
    //    multiple steps (e.g. host Dockerfile with two anchors) would race.
    for (const step of steps) {
        const fullPath = join(repo.repoRoot, step.file);
        const suffixLabel = step.suffix ? ` (${step.suffix})` : "";
        console.log(`  Registering in ${step.file}${suffixLabel} ...`);
        const original = readFileSync(fullPath, "utf-8");
        // preInsertTransform handles structural fix-ups before splice (e.g.
        // adding a trailing comma to the last entry in a JSONC array).
        const transformed = step.preInsertTransform
            ? step.preInsertTransform(original, step.suffix)
            : original;
        const linesToInsert = step.emit(ctx);
        const after = insertBeforeAnchor(transformed, step.file, linesToInsert, step.suffix);
        writeFileSync(fullPath, after, "utf-8");
    }

    // 9. Profile-specific postCopy — rush update / npm install / nothing.
    await profile.postCopy(ctx);
}

function relativeTo(repoRoot: string, abs: string): string {
    if (abs.startsWith(repoRoot)) {
        return abs.slice(repoRoot.length).replace(/^[\\/]/, "");
    }
    return abs;
}

function printPlan(ctx: IProfileContext, profile: IScaffoldProfile): void {
    const { answers, derived } = ctx;
    console.log(`\n  Creating ${answers.appName} (profile: ${profile.name})...`);
    console.log(`    Route:           ${derived.route}`);
    console.log(`    Scope:           ${answers.scope}`);
    console.log(`    Menu order:      ${derived.menuOrder}`);
    console.log(`    Harness port:    ${derived.devPort}`);
    console.log(`    Module fed port: ${derived.moduleDevPort}`);
    console.log(`    Federation name: ${derived.federationName}`);
    console.log(`    Remote URL env:  ${derived.remoteUrlEnvVar}`);
}
