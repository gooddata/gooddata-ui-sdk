#!/usr/bin/env node
// (C) 2026 GoodData Corporation

//
// Lists SDK changelog entries and, for each, the hand-written guide pages that probably
// describe what changed. It narrows the search but does not decide. The agent reads each
// entry, checks the SDK source, and makes the call.
//
// Usage (from sdk/docs):
//   node .claude/skills/docs-changelog-drift/scripts/changelog-scan.mjs --version 11.60.0
//   node .claude/skills/docs-changelog-drift/scripts/changelog-scan.mjs --since 11.58.0   # newer than 11.58.0
//   node .claude/skills/docs-changelog-drift/scripts/changelog-scan.mjs --pending         # common/changes, not released yet
//   add --json for machine-readable output
//
// Sources: sdk/libs/sdk-ui-all/CHANGELOG.json (written by the release bot, "feat: add changelog
// changes") and common/changes/@gooddata/sdk-ui-all/*.json (rush change files waiting for the next release).

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse as parseYaml } from "yaml";

const DOCS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const REPO = resolve(DOCS_DIR, "../..");
const TREE = join(DOCS_DIR, "content/en/latest");
const CHANGELOG = join(REPO, "sdk/libs/sdk-ui-all/CHANGELOG.json");
const PENDING = join(REPO, "common/changes/@gooddata/sdk-ui-all");

// Packages without a reference page (generate-reference.ts LIBS_TO_SKIP). Guides may still cover them.
const NO_REFERENCE = new Set([
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
// Mixed-case words that are prose, not identifiers.
const NOT_IDENTIFIERS = new Set([
    "GoodData",
    "JavaScript",
    "TypeScript",
    "GitHub",
    "WebKit",
    "MapLibre",
    "PowerPoint",
    "LinkedIn",
    "YouTube",
    "iFrame",
    "iframe",
    "OAuth",
    "PostgreSQL",
    "GoodData.CN",
    "README",
]);
// Capitalized words that say nothing about which page is affected.
const STOP_TERMS = new Set([
    "The",
    "This",
    "When",
    "With",
    "And",
    "For",
    "Add",
    "Fix",
    "Use",
    "Show",
    "All",
    "Analytical",
    "Designer",
    "Dashboard",
    "Restricted",
    "Edit",
    "Type",
    "Week",
    "Time",
    "Date",
    "Range",
    "None",
]);
const TYPE_LABEL = { none: "update", patch: "patch", minor: "minor", major: "major" };

function parseArgs(argv) {
    const args = { json: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--json") args.json = true;
        else if (a === "--pending") args.pending = true;
        else if (a === "--version") args.version = argv[++i];
        else if (a === "--since") args.since = argv[++i];
        else throw new Error(`unknown argument ${a}`);
    }
    if (!args.pending && !args.version && !args.since)
        throw new Error("pass --version X.Y.Z, --since X.Y.Z or --pending");
    return args;
}

const cmpVersion = (a, b) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
    return 0;
};

function releasedEntries({ version, since }) {
    const { entries } = JSON.parse(readFileSync(CHANGELOG, "utf8"));
    const picked = entries.filter((e) =>
        version ? e.version === version : cmpVersion(e.version, since) > 0,
    );
    if (!picked.length)
        throw new Error(`no CHANGELOG.json entry for ${version ?? `versions after ${since}`}`);
    return picked.flatMap((e) =>
        Object.entries(e.comments ?? {}).flatMap(([type, list]) =>
            list.map((c) => ({ version: e.version, type: TYPE_LABEL[type] ?? type, text: c.comment.trim() })),
        ),
    );
}

function pendingEntries() {
    if (!existsSync(PENDING)) return [];
    return readdirSync(PENDING)
        .filter((f) => f.endsWith(".json"))
        .flatMap((f) =>
            JSON.parse(readFileSync(join(PENDING, f), "utf8")).changes.map((c) => ({
                version: "pending",
                type: TYPE_LABEL[c.type] ?? c.type,
                text: c.comment.trim(),
                file: relative(REPO, join(PENDING, f)),
            })),
        );
}

function analyze(entry) {
    const prefix = entry.text.match(/^([a-z0-9@/-]+(?:\s*,\s*[a-z0-9@/-]+)*):\s/);
    const packages = new Set(
        prefix ? prefix[1].split(/\s*,\s*/).map((p) => p.replace("@gooddata/", "")) : [],
    );
    for (const m of entry.text.matchAll(/\b(sdk-[a-z-]+[a-z]|api-client-tiger)\b/g)) packages.add(m[1]);

    const ids = new Set();
    for (const m of entry.text.matchAll(/`([^`]+)`/g)) {
        for (const part of m[1].split(/[^\w$]+/)) if (part.length > 2) ids.add(part);
    }
    // camelCase, PascalCase with 2+ capitals, SCREAMING_CASE members
    for (const m of entry.text.matchAll(/\b[A-Za-z_$][\w$]*\b/g)) {
        const w = m[0];
        const mixed = /[a-z]/.test(w) && /[A-Z]/.test(w.slice(1));
        const screaming = /^[A-Z][A-Z0-9]*_[A-Z0-9_]+$/.test(w);
        if ((mixed || screaming) && w.length > 3 && !NOT_IDENTIFIERS.has(w)) ids.add(w);
    }

    // Terms: capitalized words or acronyms inside a sentence (Vite, MAQL), npm-style names (maplibre-gl)
    const terms = new Set();
    const body = prefix ? entry.text.slice(prefix[0].length) : entry.text;
    for (const m of body.matchAll(/(?<![.!?:]\s|^|["'(])\b([A-Z][A-Za-z0-9]{2,})\b/g)) {
        if (!ids.has(m[1]) && !STOP_TERMS.has(m[1])) terms.add(m[1]);
    }
    for (const m of body.matchAll(/\b([a-z][a-z0-9]+(?:-[a-z0-9]+)+)\b/g)) {
        const w = m[1];
        const adjective =
            /-(scoped|only|level|based|side|time|wide|specific|aware|free|like|friendly|related|defined|facing|width|height)$/.test(
                w,
            );
        const prefixWord =
            /^(sdk|api|non|re|co|so|well|full|drag|edit|top|time|side|read|zero|one|two|multi)-/.test(w);
        if (!packages.has(w) && !adjective && !prefixWord) terms.add(w);
    }

    const t = entry.text.toLowerCase();
    const hints = [];
    if (/\b(deprecat)/.test(t)) hints.push("deprecation");
    if (/\b(remove[ds]?|drop(s|ped)?|no longer)\b/.test(t)) hints.push("removal/behavior change");
    if (/\b(add(s|ed)?|new|introduce[ds]?|support(s)?)\b/.test(t)) hints.push("addition");
    if (/\b(rename[ds]?)\b/.test(t)) hints.push("rename");
    if (/\b(default)\b/.test(t)) hints.push("default changed?");
    if ([...ids].some((i) => /^enable[A-Z]/.test(i)) || /feature flag/.test(t)) hints.push("feature flag");
    if (prefix && [...packages].every((p) => !p.startsWith("sdk-") && p !== "api-client-tiger"))
        hints.push("app, not an SDK package");
    if (packages.size && [...packages].every((p) => NO_REFERENCE.has(p)))
        hints.push("package has no API reference");
    return { packages: [...packages], identifiers: [...ids], terms: [...terms], hints };
}

function walk(dir, out = []) {
    for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) {
            if (relative(TREE, p) !== "api-reference") walk(p, out);
        } else if (f.endsWith(".md")) out.push(p);
    }
    return out;
}

function loadPages() {
    return walk(TREE).map((file) => {
        const raw = readFileSync(file, "utf8");
        const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
        const fm = m ? (parseYaml(m[1]) ?? {}) : {};
        const symbols = (fm.api_symbols ?? []).filter((s) => typeof s === "string");
        return {
            path: relative(DOCS_DIR, file),
            title: fm.title ?? "",
            packages: new Set(symbols.map((s) => s.replace(/^@gooddata\//, "").split(":")[0])),
            text: `${raw}\n${symbols.join("\n")}`,
        };
    });
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wordRe = (w, flags = "") => new RegExp(`(^|[^\\w$-])${escapeRe(w)}([^\\w$-]|$)`, flags);

/** A page title names the feature ("Key Driver Analysis"): several words, or one long one. */
const titleNamesFeature = (title) => title.split(/\s+/).length >= 2 || title.length >= 10;

function match(entry, info, pages) {
    const byId = [];
    for (const page of pages) {
        const hits = [
            ...info.identifiers.filter((id) => wordRe(id).test(page.text)),
            ...info.terms.filter((term) => wordRe(term).test(page.text)),
        ];
        if (page.title && titleNamesFeature(page.title) && wordRe(page.title, "i").test(entry.text))
            hits.unshift(`title "${page.title}"`);
        if (!hits.length) continue;
        const samePkg = info.packages.some((pkg) => page.packages.has(pkg));
        byId.push({ path: page.path, title: page.title, hits, samePkg });
    }
    // title match first, then pages of the same package, then by number of hits
    const score = (p) => (p.hits[0]?.startsWith("title") ? 100 : 0) + (p.samePkg ? 10 : 0) + p.hits.length;
    byId.sort((a, b) => score(b) - score(a) || a.path.localeCompare(b.path));
    const samePackage = byId.length
        ? []
        : pages
              .filter((p) => info.packages.some((pkg) => p.packages.has(pkg)))
              .map((p) => ({ path: p.path, title: p.title }));
    return { byIdentifier: byId, samePackage };
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const entries = args.pending ? pendingEntries() : releasedEntries(args);
    const pages = loadPages();
    const results = entries.map((e, i) => {
        const info = analyze(e);
        return { id: `E${i + 1}`, ...e, ...info, ...match(e, info, pages) };
    });

    if (args.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
    }
    const source = args.pending ? "pending change files" : (args.version ?? `versions after ${args.since}`);
    console.log(`# Changelog scan: ${source}\n`);
    console.log(
        `${results.length} entries · ${pages.length} guide pages scanned · ${results.filter((r) => r.byIdentifier.length).length} entries name something a page mentions\n`,
    );
    for (const r of results) {
        console.log(
            `## ${r.id} · ${r.version} · ${r.type}${r.hints.length ? ` · ${r.hints.join(", ")}` : ""}`,
        );
        console.log(`> ${r.text}${r.file ? `\n> (${r.file})` : ""}\n`);
        if (r.identifiers.length || r.terms.length)
            console.log(`looked for: ${[...r.identifiers, ...r.terms].map((i) => `\`${i}\``).join(" ")}`);
        if (r.byIdentifier.length) {
            console.log("pages that mention them:");
            for (const p of r.byIdentifier.slice(0, 10))
                console.log(`- ${p.path} (${p.hits.join(", ")}${p.samePkg ? "; same package" : ""})`);
            if (r.byIdentifier.length > 10) console.log(`- … ${r.byIdentifier.length - 10} more`);
        } else if (r.samePackage.length) {
            console.log(
                `no page names these identifiers; ${r.samePackage.length} page(s) document ${r.packages.join(", ")}:`,
            );
            for (const p of r.samePackage.slice(0, 8)) console.log(`- ${p.path}`);
            if (r.samePackage.length > 8) console.log(`- … ${r.samePackage.length - 8} more`);
        } else {
            console.log("no candidate pages");
        }
        console.log("");
    }
}

try {
    main();
} catch (e) {
    console.error(`changelog-scan: ${e.message}`);
    process.exit(2);
}
