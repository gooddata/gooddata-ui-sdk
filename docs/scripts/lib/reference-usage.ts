/**
 * Reverse lookup: hand-authored guide pages declare the SDK symbols they
 * document via `api_symbols: ["@gooddata/<pkg>:<Symbol>", ...]` frontmatter.
 * This maps them back onto generated reference pages as `usage_pages`.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { parseFrontmatter } from "./frontmatter.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWN_MISSES_FILE = join(__dirname, "reference-known-misses.json");

export interface UsagePage {
    title: string;
    path: string;
}

const SYMBOL_FORMAT = /^@gooddata\/([a-z0-9-]+):(.+)$/;

/** `@gooddata/sdk-ui-charts:BarChart` -> `sdk-ui-charts.barchart` (reference page slug). */
export function symbolToRefSlug(symbol: string): string | undefined {
    const match = SYMBOL_FORMAT.exec(symbol.trim());
    if (!match) return undefined;
    return `${match[1]}.${match[2].toLowerCase()}`;
}

/**
 * @param guideContentDir root of the hand-written tree for one version
 * @param docsBase URL prefix for that version (placeholder at generation time)
 * @param skipDirName reference folder name inside guideContentDir, never scanned
 */
export function collectGuideUsage(
    guideContentDir: string,
    docsBase: string,
    skipDirName: string,
): Map<string, UsagePage[]> {
    const usage = new Map<string, UsagePage[]>();
    const skipDir = join(guideContentDir, skipDirName);
    const walk = (dir: string) => {
        const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
            a.name.localeCompare(b.name),
        );
        for (const entry of entries) {
            const full = join(dir, entry.name);
            if (entry.isDirectory()) {
                if (full === skipDir) continue;
                walk(full);
                continue;
            }
            if (!entry.name.endsWith(".md")) continue;
            const { frontmatter } = parseFrontmatter(readFileSync(full, "utf8"));
            const symbols = frontmatter.api_symbols;
            if (!Array.isArray(symbols) || symbols.length === 0) continue;
            const rel = relative(guideContentDir, full).replace(/\.md$/, "");
            const page: UsagePage = { title: String(frontmatter.title ?? rel), path: `${docsBase}/${rel}` };
            for (const symbol of symbols) {
                const slug = symbolToRefSlug(String(symbol));
                if (!slug) continue;
                const list = usage.get(slug) ?? [];
                list.push(page);
                usage.set(slug, list);
            }
        }
    };
    walk(guideContentDir);
    for (const pages of usage.values()) pages.sort((a, b) => a.path.localeCompare(b.path));
    return usage;
}

export interface GuideSymbols {
    /** Content-relative page path without `.md`, e.g. `visualisations/bar-chart`. */
    path: string;
    apiSymbols: string[];
    propsInterfaces: string[];
    /** The page renders its table with {{% props %}}. */
    usesShortcode: boolean;
    /** The page still carries a hand-written `## Props` Markdown table. */
    hasPropsTable: boolean;
}

const PROPS_SHORTCODE = /\{\{%\s*props\s*%\}\}/;

/** `## Props` followed (before the next `## `) by a Markdown table row. */
function hasHandWrittenPropsTable(body: string): boolean {
    const lines = body.split("\n");
    const start = lines.findIndex((l) => l.trim() === "## Props");
    if (start === -1) return false;
    for (let i = start + 1; i < lines.length && !/^##\s/.test(lines[i]); i++) {
        if (/^\s*\|/.test(lines[i])) return true;
    }
    return false;
}

/** Every guide page that names SDK symbols (`api_symbols` or `props_interfaces`), in path order. */
export function collectGuideSymbols(guideContentDir: string, skipDirName: string): GuideSymbols[] {
    const out: GuideSymbols[] = [];
    const skipDir = join(guideContentDir, skipDirName);
    const walk = (dir: string) => {
        const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
            a.name.localeCompare(b.name),
        );
        for (const entry of entries) {
            const full = join(dir, entry.name);
            if (entry.isDirectory()) {
                if (full !== skipDir) walk(full);
                continue;
            }
            if (!entry.name.endsWith(".md")) continue;
            const { frontmatter, body } = parseFrontmatter(readFileSync(full, "utf8"));
            const strings = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
            const apiSymbols = strings(frontmatter.api_symbols);
            const propsInterfaces = strings(frontmatter.props_interfaces);
            const usesShortcode = PROPS_SHORTCODE.test(body);
            if (!apiSymbols.length && !propsInterfaces.length && !usesShortcode) continue;
            out.push({
                path: relative(guideContentDir, full).replace(/\.md$/, ""),
                apiSymbols,
                propsInterfaces,
                usesShortcode,
                hasPropsTable: hasHandWrittenPropsTable(body),
            });
        }
    };
    walk(guideContentDir);
    return out;
}

export function loadKnownMisses(): Set<string> {
    const raw = JSON.parse(readFileSync(KNOWN_MISSES_FILE, "utf8")) as { known_misses: string[] };
    return new Set(raw.known_misses);
}
