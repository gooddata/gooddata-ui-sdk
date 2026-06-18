// (C) 2026 GoodData Corporation

/**
 * Contracts shared between the engine (engine/runProfile.ts and friends) and the
 * profile authors (profiles/client.ts, profiles/internal.ts). The engine drives
 * the *order* of operations (prompt → derive → copy → register → postCopy); the
 * profile fills in *what* each step does.
 *
 * The IScaffoldProfile interface is small on purpose: a new profile is a
 * single file that fills in these fields, and diffing two profiles tells you
 * exactly how they diverge.
 */

export type ProfileName = "client" | "internal";

export type ApplicationScope = "workspace" | "organization";

export type PackageManager = "npm" | "yarn" | "pnpm" | "rush";

/**
 * Output of engine/repoDetection.ts. Computed once at startup from `cwd`,
 * then threaded through the rest of the pipeline so neither profile nor
 * registrations need to redo filesystem probes.
 *
 * Profiles that need to gate on "is this a Rush monorepo" check
 * `packageManager === "rush"` — there's no separate boolean to keep in sync.
 */
export interface IRepoInfo {
    /** Absolute path resolved from process.cwd(). */
    repoRoot: string;
    /** Detected package manager — drives postCopy. */
    packageManager: PackageManager;
}

/**
 * Answers populated by the engine via the shared prompts (appName, title, scope,
 * maintainer). Profile-specific extra prompts (e.g. `destPath` for client) write
 * into the same object under their declared `key`.
 *
 * The index signature is intentional — profiles narrow with a local cast in
 * their callbacks since they know which extras they registered. Trying to make
 * this a discriminated union forces a generic parameter through the whole
 * engine for very little safety gain at this scale.
 */
export interface IScaffoldAnswers {
    appName: string;
    title: string;
    scope: ApplicationScope;
    /** Owner contact for the new app — required for every profile. Preferably an email. */
    maintainer: string;
    [extraKey: string]: string | undefined;
}

export interface IPromptDescriptor {
    /** Key under which the answer lands in IScaffoldAnswers. */
    key: string;
    /** Question text shown via readline. The engine appends ": ". */
    label: string;
    /**
     * Whether an empty answer is accepted (true) or re-prompts the user (false, default).
     * When optional, the answer slot is left undefined; profile callbacks must handle that.
     */
    optional?: boolean;
    /** Returns null on success, or an error string to display and re-prompt. */
    validate?: (value: string) => string | null;
}

export interface IDerivedValues {
    /** Default route under which the host mounts the app, e.g. "/foo" for gdc-foo. */
    route: string;
    /** Module Federation `name` — a valid JS identifier derived from appName. */
    federationName: string;
    /** Compile-time env var the host/harness reads to override the dev remoteEntry URL. */
    remoteUrlEnvVar: string;
    /** Port the harness vite dev server listens on. */
    devPort: number;
    /** Port the module federation preview server listens on (= devPort + 100). */
    moduleDevPort: number;
    /** Position in the host menu among apps of the same scope. */
    menuOrder: number;
}

export interface IProfileContext {
    answers: IScaffoldAnswers;
    derived: IDerivedValues;
    /** Absolute path to the repo the engine is scaffolding into. */
    repoRoot: string;
    /** Absolute destination root for the new module, e.g. <repoRoot>/modules/<appName>/. */
    destRoot: string;
    /** Detected package manager — drives postCopy. */
    packageManager: PackageManager;
}

/**
 * Ordered list of token → replacement pairs applied to every text file in a
 * template subtree. ORDER MATTERS:
 *   - longer tokens MUST come before shorter ones that are their substrings
 *     (e.g. `gdc-app-template-module` before `gdc-app-template`),
 *   - we use an array (not Record<string, string>) so JS-engine integer-key
 *     iteration ordering can't reshuffle numeric tokens (`"8450"`, `"8550"`)
 *     ahead of string tokens.
 */
export type TokenReplacements = ReadonlyArray<readonly [string, string]>;

/**
 * A single anchor-driven insertion into an existing repo file. The `emit`
 * callback returns the literal lines (without trailing newlines); the engine
 * splices them in before the line containing PLUGGABLE_APP_SCAFFOLD_ANCHOR
 * (suffixed if `suffix` is set).
 *
 * `preInsertTransform` runs against the file content BEFORE the splice — used
 * by JSONC files (rush.json) to add a trailing comma to the last existing
 * project entry so the spliced array remains valid JSON.
 */
export interface IRegistrationStep {
    /** Path relative to repoRoot. */
    file: string;
    /**
     * Disambiguating suffix when a file carries more than one anchor point
     * (e.g. Dockerfile has both `(stages)` and `(remotes)` anchors).
     */
    suffix?: string;
    preInsertTransform?: (content: string, suffix: string | undefined) => string;
    emit: (ctx: IProfileContext) => string[];
}

/**
 * Additional file tree layered on top of the scaffolded templateSubtrees. Used
 * by profiles that need files which shouldn't live in the shared template —
 * e.g. internal-only deploy configs that would leak GoodData infra if shipped
 * to client repos. Profile authors point `srcDir` at their own bundled assets
 * (typically next to the profile's own source file) so the files physically
 * cannot reach the published template tarball.
 *
 * Token substitution applies the same as for `templateSubtrees`. Overlay files
 * with the same path as a template file overwrite the template version.
 */
export interface IOverlayPath {
    /** Absolute path to a directory whose contents are copied into destRoot/destSubdir. */
    srcDir: string;
    /** Subdirectory under destRoot where the overlay contents land (e.g. "harness"). */
    destSubdir: string;
}

export interface IScaffoldProfile {
    readonly name: ProfileName;

    /** Prompts displayed after the shared appName/title/scope/maintainer prompts, in array order. */
    readonly extraPrompts: readonly IPromptDescriptor[];

    /** Resolves where the scaffolded files will land. Receives raw cwd, not repoRoot. */
    resolveDestRoot(answers: IScaffoldAnswers, cwd: string): string;

    /**
     * Subdirectory names under src/templates/ that this profile wants copied into destRoot.
     * Engine copies them in array order, so put `module` before `harness` if harness imports module.
     */
    readonly templateSubtrees: readonly string[];

    /**
     * Optional override: explicit absolute filesystem paths for each subtree.
     * When set, the engine uses these directly and skips its own resolution.
     * Profile authors use this for internal-only profiles where the templates
     * aren't installed as transitive deps of @gooddata/create-pluggable-module —
     * e.g. gdc-ui's internal scaffolder resolves the workspace templates via
     * its own `import.meta.url`-relative path.
     *
     * Keys must be a superset of `templateSubtrees`. Subtrees without an entry
     * here fall back to the bundled `dist/templates/<subtree>/` (created by
     * prepack-bundle-template.sh). If neither is available, the engine throws.
     */
    readonly templateSubtreeRoots?: Readonly<Record<string, string>>;

    /**
     * Optional overlays applied after `templateSubtrees`. See `IOverlayPath`.
     * Profile authors use this to keep profile-specific files out of the shared
     * template (which would otherwise leak them at publish time).
     */
    readonly overlayPaths?: readonly IOverlayPath[];

    /**
     * When true, the engine resolves templates from the workspace source (with
     * workspace-extending tsconfigs etc.) instead of the bundled `dist/templates/`
     * (with inlined tsconfigs). Set true for internal-only profiles that scaffold
     * into a repo that already has the workspace tsconfigs at the expected paths
     * (e.g. gdc-ui's own `modules/tsconfig.*.json`). Default: false — clients
     * scaffolding into arbitrary repos need the self-contained bundled version.
     */
    readonly preferWorkspaceTemplate?: boolean;

    /** Derives route, ports, menu order, federation name, etc. Runs after prompts, before copy. */
    derive(answers: IScaffoldAnswers, repo: IRepoInfo): IDerivedValues;

    /** Ordered token → replacement pairs applied to every text file under each subtree on copy. */
    buildReplacements(ctx: IProfileContext): TokenReplacements;

    /**
     * In-place transform of each copied module/harness package.json. Used by the
     * client profile to rewrite `workspace:*` deps to concrete semver — internal
     * leaves them as `workspace:*`.
     */
    transformPackageJson(pkg: Record<string, unknown>, ctx: IProfileContext): Record<string, unknown>;

    /**
     * Files in the host repo that must be edited to register the new app
     * (rush.json, host registry, dockerfiles, etc.). Single source of truth —
     * the engine uses this list for both the pre-flight anchor check AND the
     * actual insertion pass, so the two can't drift.
     *
     * Returns empty for fully-decoupled scaffolds.
     *
     * Profile authors use `repo` to gate steps on filesystem state (e.g. client
     * skips the rush.json registration unless `repo.packageManager === "rush"`).
     * The same list is consumed by pre-flight `checkAnchors` (before prompts/derive)
     * and by the post-copy insertion pass, so don't make this depend on answers.
     */
    registrations(repo: IRepoInfo): readonly IRegistrationStep[];

    /** Final step after copy + register: rush update / npm install / no-op. */
    postCopy(ctx: IProfileContext): Promise<void>;
}
