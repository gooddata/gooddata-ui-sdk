// (C) 2026 GoodData Corporation

/**
 * generate-reference.ts
 *
 * Turns api-extractor output into a Hugo page tree for the API reference:
 *   api-extractor (per lib, run by the SDK build) -> libs/<pkg>/temp/*.api.json
 *   api-documenter markdown                        -> one MD per symbol
 *   this script                                    -> OUT_DIR/api-reference/**, OUT_DIR/api_refs.json,
 *                                                     OUT_DIR/api_props.json (guide Props tables)
 *
 * The output is an artifact, not site content. URL prefixes are written as the
 * placeholders __API_REF_BASE__ and __DOCS_BASE__; sdk/scripts/place-api-reference.sh
 * substitutes them for the section the artifact lands in when the build places
 * the output.
 *
 * Usage (from sdk/docs):
 *   OUT_DIR=/tmp/api-ref npm run api-reference:generate
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { stringify as stringifyYaml } from "yaml";

import { loadApiModelFromDocs, type ApiPackageJson } from "./lib/api-model.js";
import { resolveConfig, type GeneratorConfig } from "./lib/config.js";
import { buildDashboardCatalog, type CatalogEntry } from "./lib/dashboard-catalog.js";
import { buildPropsData, makeRefLinker, propsInterfaceKey, safeFilenameForName } from "./lib/props-table.js";
import {
    collectGuideSymbols,
    collectGuideUsage,
    loadKnownMisses,
    symbolToRefSlug,
    type GuideSymbols,
    type UsagePage,
} from "./lib/reference-usage.js";
import { computeRelated } from "./lib/related.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Same blacklist as upstream common/scripts/build-docs.js, except sdk-ui-ext: it holds the public
// InsightView and NotificationsPanel, which the guides document (~130 pages).
const LIBS_TO_SKIP = new Set([
    "api-client-tiger",
    "sdk-backend-base",
    "sdk-backend-mockingbird",
    "sdk-embedding",
    "sdk-ui-all",
    "sdk-ui-kit",
    "sdk-ui-tests",
    "sdk-ui-tests-e2e",
    "sdk-ui-web-components",
]);

function fail(msg: string): never {
    console.error(`[generate-reference] ${msg}`);
    process.exit(1);
}

interface Paths {
    tmpInput: string;
    tmpOutput: string;
    referenceDir: string;
    dataFile: string;
    propsFile: string;
    manifestFile: string;
}

function pathsFor(cfg: GeneratorConfig): Paths {
    return {
        tmpInput: join(cfg.outDir, ".tmp", "input"),
        tmpOutput: join(cfg.outDir, ".tmp", "md"),
        referenceDir: join(cfg.outDir, cfg.referenceDirName),
        dataFile: join(cfg.outDir, "api_refs.json"),
        propsFile: join(cfg.outDir, "api_props.json"),
        manifestFile: join(cfg.outDir, "manifest.json"),
    };
}

function collectApiJsonFiles(sdkLibsDir: string): string[] {
    if (!existsSync(sdkLibsDir)) fail(`SDK libs not found: ${sdkLibsDir}`);
    const found: string[] = [];
    for (const entry of readdirSync(sdkLibsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (LIBS_TO_SKIP.has(entry.name)) continue;
        const tempDir = join(sdkLibsDir, entry.name, "temp");
        if (!existsSync(tempDir)) continue;
        for (const f of readdirSync(tempDir)) {
            if (f.endsWith(".api.json")) found.push(join(tempDir, f));
        }
    }
    return found;
}

function resetDir(dir: string) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
}

/**
 * Release stages the reference publishes. api-extractor tags every declaration
 * Public / Beta / Alpha / Internal / None and already leaves @internal out of
 * the model. @beta is exported, supported API that may still change, so it is
 * published with a "Beta" badge. @alpha is published too, with an "Alpha" badge
 * and notice: public and beta signatures use alpha types, and guides use alpha
 * APIs, so leaving it out only turned those names into dead text (2026-10-19,
 * reverses the 2026-09-30 decision to keep it out).
 */
export const PUBLISHED_RELEASE_TAGS: ReadonlySet<string> = new Set(["Public", "Beta", "Alpha", "None"]);

/**
 * Recursively prune members whose `releaseTag` is set and not published.
 * Containers (Package, EntryPoint) carry no releaseTag and are always traversed.
 */
function filterToPublished(node: unknown): unknown {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) return node.map(filterToPublished);
    const obj = node as Record<string, unknown>;
    const tag = obj.releaseTag;
    if (typeof tag === "string" && !PUBLISHED_RELEASE_TAGS.has(tag)) return undefined;
    const next: Record<string, unknown> = { ...obj };
    if (Array.isArray(obj.members)) {
        next.members = (obj.members as unknown[])
            .map(filterToPublished)
            .filter((member) => member !== undefined);
    }
    return next;
}

/** Result of pruning one api.json document to its public surface. */
interface PruneResult {
    pruned: unknown;
    kept: number;
    /** Kept declarations that are not @alpha. */
    keptStable: number;
    droppedReleaseTag: number;
}

function countLeaves(node: unknown, stats: { count: number; stable: number }) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
        node.forEach((child) => countLeaves(child, stats));
        return;
    }
    const obj = node as Record<string, unknown>;
    if (typeof obj.releaseTag === "string") {
        stats.count += 1;
        if (obj.releaseTag !== "Alpha") stats.stable += 1;
    }
    if (Array.isArray(obj.members)) {
        (obj.members as unknown[]).forEach((child) => countLeaves(child, stats));
    }
}

/**
 * Prune a parsed api.json to its published declarations and report how many survived.
 * `keptStable === 0` means the package has no @public or @beta API (internal-only packages
 * like util or sdk-e2e-utils, alpha-only ones like sdk-ui-pluggable-application) — callers
 * skip those entirely: a whole package that is @alpha is not ready for consumers, so it gets
 * no reference section.
 */
export function pruneApiJson(original: unknown): PruneResult {
    const before = { count: 0, stable: 0 };
    countLeaves(original, before);
    const pruned = filterToPublished(original);
    const after = { count: 0, stable: 0 };
    countLeaves(pruned, after);
    return {
        pruned,
        kept: after.count,
        keptStable: after.stable,
        droppedReleaseTag: before.count - after.count,
    };
}

/**
 * Walk one api.json document and map every emitted page slug (api-documenter
 * filename without `.md`) to its declaration's `fileUrlPath`.
 *
 * Replicates MarkdownDocumenter._getFilenameForApiItem: the package contributes
 * the unscoped name, EntryPoint/EnumMember contribute nothing, every other level
 * appends `.` + safe(name), and overloads (items carrying `overloadIndex` > 1)
 * append `_<overloadIndex - 1>`. Children without their own `fileUrlPath`
 * inherit the parent's (api-extractor omits it when identical).
 */
export function collectSourcePaths(apiJson: unknown): Map<string, string> {
    return collectBySlug(apiJson, (obj) =>
        typeof obj.fileUrlPath === "string" ? obj.fileUrlPath : undefined,
    );
}

/**
 * Every emitted page slug mapped to its declaration's `releaseTag` (Public, Beta, Alpha, None).
 * Members carry their own tag; one without inherits its parent's.
 */
export function collectReleaseTags(apiJson: unknown): Map<string, string> {
    return collectBySlug(apiJson, (obj) => (typeof obj.releaseTag === "string" ? obj.releaseTag : undefined));
}

/**
 * Walk one api.json document by page slug (see collectSourcePaths) and map each slug to
 * `pick(declaration)`, or to its parent's value when `pick` returns undefined.
 */
function collectBySlug(
    apiJson: unknown,
    pick: (obj: Record<string, unknown>) => string | undefined,
): Map<string, string> {
    const map = new Map<string, string>();
    const root = apiJson as { kind?: string; name?: string; members?: unknown[] };
    if (root?.kind !== "Package" || typeof root.name !== "string") return map;
    const unscoped = root.name.split("/").pop() ?? root.name;
    const pkgSlug = safeFilenameForName(unscoped);

    const walk = (node: unknown, slug: string, inherited: string | undefined) => {
        if (!node || typeof node !== "object") return;
        const obj = node as Record<string, unknown>;
        const value = pick(obj) ?? inherited;
        if (value && slug !== pkgSlug) map.set(slug, value);
        if (!Array.isArray(obj.members)) return;
        for (const member of obj.members as Array<Record<string, unknown>>) {
            const kind = member.kind;
            if (kind === "EntryPoint" || kind === "EnumMember") {
                // no filename segment; EnumMember pages don't exist, EntryPoint passes through
                if (kind === "EntryPoint") walk(member, slug, value);
                continue;
            }
            let segment = safeFilenameForName(String(member.name ?? ""));
            if (typeof member.overloadIndex === "number" && member.overloadIndex > 1) {
                segment += `_${member.overloadIndex - 1}`;
            }
            walk(member, `${slug}.${segment}`, value);
        }
    };
    walk(root, pkgSlug, undefined);
    return map;
}

/**
 * api-extractor follows the `.d.ts.map` declaration maps (tsconfig.base
 * `declarationMap: true`) and records `fileUrlPath` as the source file itself
 * (`src/*.ts[x]`), which passes straight through. Without resolvable maps it
 * records the build output (`esm/*.d.ts`, gitignored) instead; tsconfig maps
 * `rootDir: src` -> `outDir: esm`, so the transform back is mechanical. Either
 * way the caller probes which candidate exists in the checkout.
 */
export function esmPathToSrcCandidates(fileUrlPath: string): string[] {
    if (/^src\/.*(?<!\.d)\.tsx?$/.test(fileUrlPath)) return [fileUrlPath];
    const match = /^esm\/(.*)\.d\.ts$/.exec(fileUrlPath);
    if (!match) return [];
    return [`src/${match[1]}.ts`, `src/${match[1]}.tsx`];
}

function runApiDocumenter(paths: Paths) {
    const bin = join(__dirname, "..", "node_modules", ".bin", "api-documenter");
    if (!existsSync(bin)) fail("api-documenter not installed. Run: npm ci in sdk/docs");
    execFileSync(bin, ["markdown", "--input-folder", paths.tmpInput, "--output-folder", paths.tmpOutput], {
        stdio: "inherit",
    });
}

// Trailing kind word api-documenter appends to every symbol heading
// ("BarChart() function", "IFoo.area property", "BadRequestSdkError class").
const KIND_SUFFIX =
    /\s+(method|property|function|interface|class|enum|enum member|type|variable|namespace|constructor|event)$/i;

// api-documenter kind word -> frontmatter slug
const KIND_SLUGS: Record<string, string> = {
    "enum member": "enum-member",
    type: "type-alias",
};

// api-documenter Markdown-escapes headings (`Permissions\_2`); the title is plain text.
const MARKDOWN_ESCAPE = /\\([\\`*_{}[\]()#+\-.!|<>])/g;

export function parseSymbolHeading(heading: string): { titleNoKind: string; kind?: string } {
    const rawTitle = heading.replace(MARKDOWN_ESCAPE, "$1");
    const match = KIND_SUFFIX.exec(rawTitle);
    if (!match) return { titleNoKind: rawTitle, kind: undefined };
    const word = match[1].toLowerCase();
    return {
        titleNoKind: rawTitle.slice(0, match.index),
        kind: KIND_SLUGS[word] ?? word,
    };
}

export const DEPRECATION_MARKER = "> Warning: This API is now obsolete";
/** api-documenter's notice on every @beta page; sets the page's "Beta" badge. */
export const BETA_MARKER = "> This API is provided as a beta preview";

/**
 * Notice opening every @alpha page, set from the declaration's releaseTag (the page's "Alpha"
 * badge keys off that, not off a marker in the text).
 */
export function alphaNotice(maturityRef?: string): string {
    const more = maturityRef ? ` See [API maturity]({{< relref "${maturityRef}" >}}).` : "";
    return `> **Alpha API.** Initial API, highly likely to change outside SemVer. Don't build on it in production.${more}\n`;
}

/**
 * Replace api-documenter's alpha notice ("...provided as an alpha preview...") with ours, so an
 * @alpha page carries one notice, not two. Without one, ours goes on top.
 */
export function rewriteAlphaNotice(body: string, maturityRef?: string): string {
    const theirs = /^> This API is provided as an alpha preview[^\n]*\n(?:>[ \t]*\n)?/m;
    return theirs.test(body)
        ? body.replace(theirs, alphaNotice(maturityRef))
        : `${alphaNotice(maturityRef)}\n${body}`;
}

/** Guide page, relative to the guide tree, that explains the API stability tags. */
export const API_MATURITY_PAGE = "integrations/platform/api-maturity.md";

/**
 * Replace api-documenter's beta notice with ours. Its text ("...Do not use this API in a
 * production environment.") contradicts the API maturity guide, which calls @beta mostly stable,
 * and beta components ship in the product. `maturityRef` is the relref target of that guide, or
 * undefined when the guide tree being built has no such page (an old release branch), so the
 * notice never links a page that isn't there.
 */
export function rewriteBetaNotice(body: string, maturityRef?: string): string {
    const more = maturityRef ? ` See [API maturity]({{< relref "${maturityRef}" >}}).` : "";
    return body.replace(
        /^> This API is provided as a beta preview[^\n]*\n(?:>[ \t]*\n)?/m,
        `> **Beta API.** Mostly stable, but details may change in a minor release, outside SemVer.${more}\n`,
    );
}

/**
 * Strip api-documenter's per-page chrome, redundant under the theme: the
 * in-content breadcrumb line (`[Home](./index.md) &gt; …` — the theme renders
 * its own breadcrumb) and the first `## <title>` heading (restates the H1 the
 * layout emits from frontmatter). Together they cost three navigational rows
 * before the first content sentence on every symbol page.
 */
export function stripSymbolChrome(raw: string): string {
    return raw.replace(/^\[Home\]\(\.\/index\.md\)[^\n]*$\n*/m, "").replace(/^##\s[^\n]*$\n*/m, "");
}

/**
 * Label unlabelled code fences so they get syntax highlighting.
 *
 * api-documenter tags the `**Signature:**` block `typescript` but copies TSDoc
 * `@example` blocks through with whatever fence the source author wrote — and
 * roughly 30 of them across the SDK are bare ```. Hugo highlights by language
 * tag only (`guessSyntax` is off), so a bare fence renders as unstyled white
 * text next to fully coloured neighbours.
 *
 * `tsx` rather than `typescript`: every bare example is TS, and a third of them
 * embed JSX, which the typescript lexer does not colour. The tsx lexer handles
 * both.
 *
 * Fences are tracked open/closed rather than pattern-matched, so a closing ```
 * is never mistaken for an opening one, and fences inside a block (a nested
 * fence in a longer example) are left alone.
 *
 * api-documenter writes CRLF, hence the explicit `\r` handling: `.` does not
 * match `\r` in JS and `$` without `/m` only matches true end-of-string, so a
 * `.*$` info capture silently fails to match every line in a CRLF file — which
 * is every file this runs on. The captured ending is put back so the output
 * keeps the line endings it arrived with.
 */
export function labelBareCodeFences(body: string, lang = "tsx"): string {
    let inFence = false;
    let closer = "";
    return body
        .split("\n")
        .map((line) => {
            const fence = /^([ \t]*)(`{3,}|~{3,})([^\r\n]*)(\r?)$/.exec(line);
            if (!fence) return line;
            const [, indent, marker, info, cr] = fence;
            if (inFence) {
                // only a same-or-longer run of the opening character closes the block
                if (marker[0] === closer[0] && marker.length >= closer.length && info.trim() === "") {
                    inFence = false;
                }
                return line;
            }
            inFence = true;
            closer = marker;
            return info.trim() === "" ? `${indent}${marker}${lang}${cr}` : line;
        })
        .join("\n");
}

/**
 * The page a sub-symbol belongs to, from api-documenter's slugs and the kind of every page.
 *
 * The parent is the slug minus its last segment (`pkg.ifoo.bar` -> `pkg.ifoo`), so a property
 * of an interface inside a namespace (`pkg.v1.ifoo.bar`) belongs to the interface, not to the
 * namespace. A parent with no page of its own falls back to the nearest ancestor that has one.
 *
 * `folded`: the sub-symbol's content is a section of its parent's page, in HTML and in Markdown
 * (the theme's reference/single.html and single.markdown.md); the sub-symbol has no page of its
 * own. A namespace is the exception: its members are symbols in their own right
 * (`v1.AggregatedFact`) and keep their own page; folding them would make the namespace one page
 * of 4 MB.
 */
export function symbolParent(
    slug: string,
    kindBySlug: ReadonlyMap<string, string | undefined>,
): { parentSlug?: string; folded: boolean } {
    const parts = slug.split(".");
    for (let end = parts.length - 1; end >= 2; end -= 1) {
        const parentSlug = parts.slice(0, end).join(".");
        if (kindBySlug.has(parentSlug)) {
            return { parentSlug, folded: kindBySlug.get(parentSlug) !== "namespace" };
        }
    }
    return { folded: false };
}

/**
 * Convert one api-documenter MD file to Hugo-flavoured MD.
 *
 * api-documenter emits files like `sdk-ui-charts.barchart.md` (one MD per symbol)
 * with a leading `## Title` heading. We:
 *   - derive a Hugo slug + title from the filename + first heading
 *   - prepend YAML frontmatter
 *   - fix Docusaurus-only escapes (`\|` in union-type tables, `\[`/`\]`)
 *   - rewrite intra-doc links from `./foo.md` -> Hugo ref paths
 */
function adaptToHugo(
    srcPath: string,
    refBase: string,
    pkgSlug: string,
    kindBySlug: ReadonlyMap<string, string | undefined>,
    usagePages?: UsagePage[],
    sourcePath?: string,
    maturityRef?: string,
    related?: string[],
    releaseTag?: string,
): {
    slug: string;
    title: string;
    content: string;
    body: string;
    parentSlug?: string;
    kind?: string;
    deprecated: boolean;
    stability?: Stability;
} {
    const raw = readFileSync(srcPath, "utf8");
    const fileName = basename(srcPath, ".md");
    const parts = fileName.split(".");

    const headingMatch = /^##\s+(.*)$/m.exec(raw);
    const rawTitle = headingMatch ? headingMatch[1].trim() : fileName;
    const { titleNoKind, kind } = parseSymbolHeading(rawTitle);

    let title: string;
    let parentSlug: string | undefined;
    let folded = false;
    if (parts.length === 1) {
        // Package overview page.
        title = `Overview of ${pkgSlug}`;
    } else if (parts.length === 2) {
        // Top-level symbol: "Foo.bar() method" -> "bar()"; "IFoo interface" -> "IFoo".
        const dotIdx = titleNoKind.indexOf(".");
        title = dotIdx >= 0 ? titleNoKind.slice(dotIdx + 1) : titleNoKind;
    } else {
        // Sub-symbol (method/property/overload). Keep the parent qualifier
        // (e.g. `IGeoChartViewport.area`) so two members named "area" on
        // different parents stay distinguishable in titles, Related panels,
        // search results, and breadcrumbs.
        title = titleNoKind;
        // powers the Related panel via related_pages frontmatter, and the parent's Markdown version
        ({ parentSlug, folded } = symbolParent(fileName, kindBySlug));
    }

    const adapted = labelBareCodeFences(stripSymbolChrome(raw))
        // union-type tables: `\|` -> &#124; (otherwise pipe breaks the MD table)
        .replace(/\\\|/g, "&#124;")
        // unescape brackets (Hugo + GoldMark handle them fine)
        .replace(/\\\[/g, "[")
        .replace(/\\\]/g, "]")
        // Drop the entire "## Constructors" section from class pages: constructors
        // rarely document more than the signature and link to a separate page whose
        // title is the unhelpful "(constructor)". The class signature on the parent
        // page already shows how to instantiate. Section runs until the next `##` heading.
        .replace(/^##\s+Constructors\b[\s\S]*?(?=^##\s+|$(?![\r\n]))/m, "")
        // intra-doc links: `./pkg.symbol.md` -> Hugo relref (keep `.md` so Hugo resolves filenames with dots correctly)
        .replace(/\]\(\.\/([^)]+)\.md\)/g, (_match, target: string) => {
            if (target === "index") return `]({{< relref "${refBase}" >}})`;
            // A dotless target is api-documenter's package overview page. It ships as
            // the package's `_index.md`, so it has no standalone URL to link to.
            if (!target.includes(".")) return `]({{< relref "${refBase}/${target}" >}})`;
            const targetPkg = target.split(".")[0];
            return `]({{< relref "${refBase}/${targetPkg}/${target}.md" >}})`;
        });

    const frontmatterObj: Record<string, unknown> = {
        title,
        slug: fileName,
        package: pkgSlug,
        diataxis_type: "reference",
        type: "reference",
        source: "api-documenter",
    };
    if (kind) frontmatterObj.kind = kind;
    const deprecated = adapted.includes(DEPRECATION_MARKER);
    if (deprecated) frontmatterObj.deprecated = true;
    const beta = adapted.includes(BETA_MARKER);
    const stability: Stability | undefined = beta ? "beta" : releaseTag === "Alpha" ? "alpha" : undefined;
    if (stability) frontmatterObj.stability = stability;
    const body = beta
        ? rewriteBetaNotice(adapted, maturityRef)
        : stability === "alpha"
          ? rewriteAlphaNotice(adapted, maturityRef)
          : adapted;
    if (sourcePath) {
        // upstream-repo-relative path (libs/<pkg>/src/...); theme joins it with
        // site.Params.repoURL + sourceRef into a GitHub "View source" link
        frontmatterObj.source_path = sourcePath;
    }
    if (usagePages?.length) {
        // guides documenting this symbol; rendered as "Guide:" chips in the theme badge row
        frontmatterObj.usage_pages = usagePages.map((page) => ({ title: page.title, path: page.path }));
    }
    if (related?.length) {
        // Top-level symbols: the closest symbols in the api model (lib/related.ts).
        frontmatterObj.related_pages = related.map((slug) => `${refBase}/${slug.split(".")[0]}/${slug}`);
    }
    if (parentSlug) {
        // Sub-symbols (e.g. `IGeoChartViewport.area`) wire the Related panel back to their
        // parent type page. Without this, the layout falls back to "first 5 pages in section"
        // which surfaces unrelated symbols.
        frontmatterObj.related_pages = [`${refBase}/${pkgSlug}/${parentSlug}`];
        frontmatterObj.parent_symbol = parentSlug;
    }
    if (folded) {
        // The parent symbol's page carries this page's content as a section, in HTML and in
        // Markdown (8k of the 12k pages are members of a few lines each, and every HTML page
        // repeats ~75 KB of site chrome). The page itself is not published (`render: link`): it
        // keeps a URL only so the theme can point every link to it at that section
        // (api-member-urls.html), and is left out of the sitemap and the Markdown output.
        frontmatterObj.folded = true;
        frontmatterObj.build = { render: "link" };
        frontmatterObj.outputs = ["html"];
        frontmatterObj.sitemap = { disable: true };
    }
    const frontmatter = stringifyYaml(frontmatterObj);

    return {
        slug: fileName,
        title,
        content: body,
        body: `---\n${frontmatter}---\n\n${body}`,
        parentSlug,
        kind,
        deprecated,
        stability,
    };
}

/** `pkg.symbol` slugs of the top-level symbol pages api-documenter wrote (members and overviews skipped). */
export function topLevelPageSlugs(files: string[]): Set<string> {
    const slugs = new Set<string>();
    for (const file of files) {
        if (!file.endsWith(".md")) continue;
        const segments = basename(file, ".md").split(".");
        if (segments.length !== 2 || /^_[a-z_]+_$/.test(segments[1])) continue;
        slugs.add(segments.join("."));
    }
    return slugs;
}

/** A published API's release stage below @public, as page frontmatter and api_refs.json carry it. */
type Stability = "beta" | "alpha";

interface PackageBucket {
    pkg: string;
    /** Body of api-documenter's package overview page, adapted to Hugo. */
    overview?: string;
    members: Array<{
        slug: string;
        title: string;
        kind?: string;
        deprecated?: boolean;
        stability?: Stability;
    }>;
}

/**
 * Frontmatter for a package's _index.md. `nav_leaf: true` tells the sidebar
 * tree to render the package as a single link instead of descending into its
 * thousands of symbol pages; `weight` fixes alphabetical order. Emitted here
 * (not by stamp-nav) so regen into any site — gdc-ui included — navigates
 * correctly without a separate stamping pass.
 */
export function packageIndexFrontmatter(pkg: string, weight: number): Record<string, unknown> {
    return {
        title: `@gooddata/${pkg}`,
        slug: pkg,
        // pagefind facets reference results by package (see baseof.html)
        package: pkg,
        diataxis_type: "reference",
        type: "reference",
        source: "api-documenter",
        nav_leaf: true,
        weight,
    };
}

/**
 * Strip the two bits of api-documenter chrome that only make sense on a
 * standalone overview page: its own breadcrumb (the theme renders one, and the
 * package link in it would now point at this very page) and the `## <pkg>
 * package` heading (duplicates the `@gooddata/<pkg>` H1 the layout emits).
 * Everything below — summary, remarks, and the per-kind symbol tables — is the
 * package landing page.
 */
export function overviewToIndexBody(content: string, pkg: string): string {
    const pkgHeading = new RegExp(
        `^##\\s+${pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} package\\s*$\\n*`,
        "m",
    );
    return content
        .replace(/^\[Home\]\(\{\{<[^\n]*$\n*/m, "")
        .replace(pkgHeading, "")
        .trimStart();
}

/**
 * The package's _index.md IS the overview page — one landing page per package,
 * no separate `<pkg>.md` and no second flat list of the same symbols.
 */
function writePackageIndex(referenceDir: string, bucket: PackageBucket, weight: number) {
    const dir = join(referenceDir, bucket.pkg);
    mkdirSync(dir, { recursive: true });
    const frontmatter = stringifyYaml(packageIndexFrontmatter(bucket.pkg, weight));
    const body = bucket.overview ? overviewToIndexBody(bucket.overview, bucket.pkg) : "";
    writeFileSync(join(dir, "_index.md"), `---\n${frontmatter}---\n\n${body}`, "utf8");
}

// Section-index keys the host site owns (nav placement, legacy redirects). The
// generator wipes and rewrites its whole tree, so these are read before the wipe
// and merged back — otherwise every regen resets the section's nav metadata.
const PRESERVED_SECTION_KEYS = ["title", "linkTitle", "weight", "legacy_path", "aliases"];

export function mergeSectionFrontmatter(
    existing: Record<string, unknown> | undefined,
): Record<string, unknown> {
    const preserved: Record<string, unknown> = {};
    for (const key of PRESERVED_SECTION_KEYS) {
        if (existing && existing[key] !== undefined) preserved[key] = existing[key];
    }
    return {
        title: "Reference",
        ...preserved,
        description:
            "Per-symbol API reference generated via api-extractor + api-documenter (upstream SDK pipeline).",
        diataxis_type: "reference",
        type: "reference",
    };
}

function writeSectionIndex(referenceDir: string, refBase: string, buckets: PackageBucket[]) {
    mkdirSync(referenceDir, { recursive: true });
    const frontmatter = stringifyYaml(mergeSectionFrontmatter(undefined));
    const packageList = buckets
        .slice()
        .sort((left, right) => left.pkg.localeCompare(right.pkg))
        .map(
            (bucket) =>
                `- [@gooddata/${bucket.pkg}]({{< relref "${refBase}/${bucket.pkg}" >}}) — ${bucket.members.length} top-level symbols`,
        )
        .join("\n");
    writeFileSync(
        join(referenceDir, "_index.md"),
        `---\n${frontmatter}---\n\n## Packages\n\n${packageList}\n`,
        "utf8",
    );
}

export interface ManifestCounts {
    pages: number;
    symbols: number;
    packages: string[];
}

export function buildManifest(
    cfg: Pick<GeneratorConfig, "artifactVersion" | "gitCommit">,
    counts: ManifestCounts,
    now = new Date(),
) {
    return {
        version: cfg.artifactVersion,
        commit: cfg.gitCommit,
        generatedAt: now.toISOString(),
        pages: counts.pages,
        symbols: counts.symbols,
        packages: [...counts.packages].sort(),
    };
}

function main(cfg: GeneratorConfig) {
    const paths = pathsFor(cfg);
    const apiJsonFiles = collectApiJsonFiles(cfg.sdkLibsDir);
    if (apiJsonFiles.length === 0) {
        fail(
            `No .api.json files under ${cfg.sdkLibsDir}. Build the SDK first:\n  cd sdk && rush install && rush build && rush api-extractor`,
        );
    }
    console.log(`[generate-reference] Found ${apiJsonFiles.length} .api.json files`);

    resetDir(paths.tmpInput);
    resetDir(paths.tmpOutput);
    resetDir(paths.referenceDir);
    let totalKept = 0;
    let totalDropped = 0;
    const skippedEmpty: string[] = [];
    const sourcePathBySlug = new Map<string, string>();
    const releaseTagBySlug = new Map<string, string>();
    const prunedDocs: ApiPackageJson[] = [];
    let sourceUnresolved = 0;
    let sourceUnresolvedSample: string | undefined;
    for (const file of apiJsonFiles) {
        const original = JSON.parse(readFileSync(file, "utf8")) as unknown;
        const { pruned, kept, keptStable, droppedReleaseTag } = pruneApiJson(original);
        if (keptStable === 0) {
            skippedEmpty.push(basename(file, ".api.json"));
            continue;
        }
        const pkg = basename(file, ".api.json");
        for (const [slug, tag] of collectReleaseTags(pruned)) releaseTagBySlug.set(slug, tag);
        for (const [slug, esmPath] of collectSourcePaths(pruned)) {
            const hit = esmPathToSrcCandidates(esmPath).find((candidate) =>
                existsSync(join(cfg.sdkSrcLibsDir, pkg, candidate)),
            );
            if (hit) sourcePathBySlug.set(slug, `libs/${pkg}/${hit}`);
            else {
                sourceUnresolved += 1;
                // one sample, so a new fileUrlPath shape shows up in the build log
                sourceUnresolvedSample ??= `${pkg}: ${esmPath}`;
            }
        }
        writeFileSync(join(paths.tmpInput, basename(file)), JSON.stringify(pruned), "utf8");
        prunedDocs.push(pruned as ApiPackageJson);
        totalKept += kept;
        totalDropped += droppedReleaseTag;
    }
    console.log(
        `[generate-reference] Pruned to ${[...PUBLISHED_RELEASE_TAGS].join("/")}: kept ${totalKept} declarations, dropped ${totalDropped}`,
    );
    if (skippedEmpty.length) {
        console.log(
            `[generate-reference] Skipped ${skippedEmpty.length} package(s) with no @public or @beta API: ${skippedEmpty.sort().join(", ")}`,
        );
    }
    console.log(
        `[generate-reference] Source links: resolved ${sourcePathBySlug.size} declarations` +
            (sourceUnresolved ? `, ${sourceUnresolved} unresolved (e.g. ${sourceUnresolvedSample})` : ""),
    );

    console.log("[generate-reference] Running api-documenter markdown...");
    runApiDocumenter(paths);

    const usageMap = existsSync(cfg.guideContentDir)
        ? collectGuideUsage(cfg.guideContentDir, cfg.docsBase, cfg.referenceDirName)
        : new Map<string, UsagePage[]>();
    const knownMisses = loadKnownMisses();
    const consumedSlugs = new Set<string>();
    console.log(
        `[generate-reference] Guide tree: ${cfg.guideContentDir}${existsSync(cfg.guideContentDir) ? "" : " (missing, no usage_pages)"}`,
    );
    console.log(`[generate-reference] Guide usage map: ${usageMap.size} symbols across guides`);
    // The beta notice links the API maturity guide only when this guide tree has it.
    const maturityRef = existsSync(join(cfg.guideContentDir, API_MATURITY_PAGE))
        ? `${cfg.docsBase}/${API_MATURITY_PAGE}`
        : undefined;

    const pageFiles = readdirSync(paths.tmpOutput).filter((file) => {
        if (!file.endsWith(".md") || file === "index.md") return false;
        const lastSegment = basename(file, ".md").split(".").pop() ?? "";
        return !/^_[a-z_]+_$/.test(lastSegment);
    });
    // Every page's kind, read up front: a sub-symbol's parent is only known once all pages are.
    const kindBySlug = new Map<string, string | undefined>();
    for (const file of pageFiles) {
        const heading = /^##\s+(.*)$/m.exec(readFileSync(join(paths.tmpOutput, file), "utf8"));
        kindBySlug.set(
            basename(file, ".md"),
            heading ? parseSymbolHeading(heading[1].trim()).kind : undefined,
        );
    }

    const guides = existsSync(cfg.guideContentDir)
        ? collectGuideSymbols(cfg.guideContentDir, cfg.referenceDirName)
        : [];
    const topLevelSlugs = topLevelPageSlugs(readdirSync(paths.tmpOutput));
    const related = computeRelated({
        docs: prunedDocs,
        pageSlugs: topLevelSlugs,
        sourcePathBySlug,
        guideSymbolGroups: guides.map((g) =>
            g.apiSymbols.map(symbolToRefSlug).filter((s): s is string => !!s),
        ),
    });

    const buckets = new Map<string, PackageBucket>();
    const pageSlugs = new Set<string>();
    let totalPages = 0;
    for (const file of pageFiles) {
        const baseName = basename(file, ".md");
        const segments = baseName.split(".");
        const pkg = segments[0];
        const isOverview = segments.length === 1;
        const isTopLevelSymbol = segments.length === 2;
        const usagePages = usageMap.get(baseName);
        if (usagePages) consumedSlugs.add(baseName);
        const adapted = adaptToHugo(
            join(paths.tmpOutput, file),
            cfg.refBase,
            pkg,
            kindBySlug,
            usagePages,
            sourcePathBySlug.get(baseName),
            maturityRef,
            related.get(baseName),
            releaseTagBySlug.get(baseName),
        );

        let bucket = buckets.get(pkg);
        if (!bucket) {
            bucket = { pkg, members: [] };
            buckets.set(pkg, bucket);
        }
        if (isOverview) {
            bucket.overview = adapted.content;
            continue;
        }
        const pkgDir = join(paths.referenceDir, pkg);
        mkdirSync(pkgDir, { recursive: true });
        writeFileSync(join(pkgDir, `${adapted.slug}.md`), adapted.body, "utf8");
        pageSlugs.add(adapted.slug);
        totalPages += 1;
        if (isTopLevelSymbol) {
            bucket.members.push({
                slug: adapted.slug,
                title: adapted.title,
                kind: adapted.kind,
                deprecated: adapted.deprecated,
                stability: adapted.stability,
            });
        }
    }

    const apiRefs: Record<
        string,
        {
            title: string;
            path: string;
            kind?: string;
            deprecated?: boolean;
            stability?: Stability;
        } & Partial<CatalogEntry>
    > = {};
    for (const bucket of buckets.values()) {
        for (const member of bucket.members) {
            apiRefs[member.slug] = {
                title: member.title,
                path: `${cfg.refBase}/${bucket.pkg}/${member.slug}`,
                ...(member.kind ? { kind: member.kind } : {}),
                ...(member.deprecated ? { deprecated: true } : {}),
                ...(member.stability ? { stability: member.stability } : {}),
            };
        }
    }
    // Dashboard events and commands carry their catalog row (dashboard-catalog shortcode).
    const catalog = buildDashboardCatalog(prunedDocs, topLevelSlugs);
    for (const [slug, entry] of catalog) if (apiRefs[slug]) Object.assign(apiRefs[slug], entry);
    console.log(`[generate-reference] Dashboard catalog: ${catalog.size} events and commands`);
    writeFileSync(paths.dataFile, JSON.stringify(apiRefs, null, 2), "utf8");
    console.log(
        `[generate-reference] Wrote symbol lookup: ${Object.keys(apiRefs).length} entries -> ${paths.dataFile}`,
    );

    let unresolved = 0;
    const knownMissSlugs = new Set([...knownMisses].map((s) => symbolToRefSlug(s)).filter(Boolean));
    for (const [slug, pages] of usageMap) {
        if (consumedSlugs.has(slug) || knownMissSlugs.has(slug)) continue;
        unresolved += 1;
        console.warn(
            `[generate-reference] WARN: guide api_symbols -> no reference page: ${slug} (used by ${pages.map((p) => p.path).join(", ")})`,
        );
    }
    if (unresolved) {
        console.warn(
            `[generate-reference] ${unresolved} unresolved symbol(s) — add intentional ones to scripts/lib/reference-known-misses.json`,
        );
    }

    writePropsData(cfg, paths, prunedDocs, pageSlugs, guides);

    const orderedBuckets = [...buckets.values()].sort((left, right) => left.pkg.localeCompare(right.pkg));
    orderedBuckets.forEach((bucket, i) => writePackageIndex(paths.referenceDir, bucket, i));
    writeSectionIndex(paths.referenceDir, cfg.refBase, orderedBuckets);

    const manifest = buildManifest(cfg, {
        pages: totalPages + buckets.size + 1,
        symbols: Object.keys(apiRefs).length,
        packages: orderedBuckets.map((b) => b.pkg),
    });
    writeFileSync(paths.manifestFile, JSON.stringify(manifest, null, 2), "utf8");
    rmSync(join(cfg.outDir, ".tmp"), { recursive: true, force: true });
    console.log(
        `[generate-reference] Wrote ${manifest.pages} pages (${manifest.symbols} top-level symbols across ${manifest.packages.length} packages) -> ${paths.referenceDir}`,
    );
}

/**
 * Guide Props tables from the same pruned model as the reference pages. A page
 * that renders {{% props %}} but resolves to no public props would lose its
 * table silently, so that fails the build; a page that still carries a
 * hand-written table its symbols could now generate only warns.
 */
function writePropsData(
    cfg: GeneratorConfig,
    paths: Paths,
    docs: ApiPackageJson[],
    pageSlugs: Set<string>,
    guides: GuideSymbols[],
): void {
    const { tables, unresolvedPages } = buildPropsData(
        loadApiModelFromDocs(docs),
        guides,
        makeRefLinker(cfg.refBase, pageSlugs),
    );
    writeFileSync(paths.propsFile, JSON.stringify(tables, null, 2), "utf8");
    const shortcodePages = guides.filter((g) => g.usesShortcode).length;
    console.log(
        `[generate-reference] Wrote props tables: ${Object.keys(tables).length} symbols for ${shortcodePages} {{% props %}} pages -> ${paths.propsFile}`,
    );
    for (const g of guides) {
        if (g.usesShortcode || !g.hasPropsTable) continue;
        const symbols = g.apiSymbols.length ? g.apiSymbols : g.propsInterfaces.map(propsInterfaceKey);
        if (symbols.some((s) => tables[s])) {
            console.warn(
                `[generate-reference] WARN: ${g.path} has a hand-written Props table; its symbols now generate one — replace it with {{% props %}}`,
            );
        }
    }
    if (unresolvedPages.length) {
        fail(
            `{{% props %}} on page(s) whose api_symbols have no published props: ${unresolvedPages.join(", ")}.\n` +
                "  Fix the page's api_symbols, or replace the shortcode with a hand-written table.",
        );
    }
}

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
    main(resolveConfig(process.env, __dirname));
}
