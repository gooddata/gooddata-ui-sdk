#!/usr/bin/env node
// (C) 2026 GoodData Corporation

//
// Quick lint for hand-written guide pages under content/en/latest.
// Checks what the theme and the build rely on: frontmatter, related_pages, api_symbols,
// the Props shortcode, aliases, code fence tags, images, wording. Faster than a Hugo
// build and it names the field to fix.
//
// Usage (from sdk/docs):
//   node .claude/skills/docs-new-page/scripts/check-page.mjs content/en/latest/filters/my-page.md [...]
//
// Exit code 1 when any ERROR is found. WARN lines are judgment calls.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse as parseYaml } from "yaml";

const DOCS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const TREE = join(DOCS_DIR, "content/en/latest");
const DIATAXIS = ["tutorial", "howto", "reference", "explanation"];
const REQUIRED = ["title", "description", "weight", "type", "diataxis_type"];

function readPage(file) {
    const raw = readFileSync(file, "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!m) return { fm: {}, body: raw, hasFm: false };
    return { fm: parseYaml(m[1]) ?? {}, body: m[2], hasFm: true };
}

/** `/docs/<path>` -> the file it resolves to in latest, or undefined. */
function resolveDocsPath(ref) {
    const p = ref.replace(/^\/docs\//, "").replace(/\/$/, "");
    return [join(TREE, `${p}.md`), join(TREE, p, "_index.md")].find((f) => existsSync(f));
}

/** Prose only: fenced code, inline code, shortcodes and link targets removed. */
function prose(body) {
    return body
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`\n]*`/g, "")
        .replace(/\{\{[<%][\s\S]*?[%>]\}\}/g, "")
        .replace(/\]\([^)]*\)/g, "]");
}

function loadRefs() {
    const f = join(DOCS_DIR, "data/api_refs.json");
    if (!existsSync(f)) return undefined;
    return JSON.parse(readFileSync(f, "utf8"));
}

function loadKnownMisses() {
    const f = join(DOCS_DIR, "scripts/lib/reference-known-misses.json");
    return existsSync(f) ? new Set(JSON.parse(readFileSync(f, "utf8")).known_misses) : new Set();
}

function checkPage(file, refs, knownMisses) {
    const out = [];
    const err = (msg) => out.push(`ERROR ${msg}`);
    const warn = (msg) => out.push(`WARN  ${msg}`);
    const rel = relative(TREE, file);

    if (rel.startsWith("..")) {
        err("not under content/en/latest");
        return out;
    }
    if (rel.startsWith("api-reference/")) {
        err("api-reference/ is generated; don't hand-write pages there");
        return out;
    }

    const { fm, body, hasFm } = readPage(file);
    if (!hasFm) err("no YAML frontmatter");

    // Required fields (the docs home gets `type: docs` from the [[cascade]] in config/_default/config.toml)
    for (const key of rel === "_index.md" ? REQUIRED.filter((k) => k !== "type") : REQUIRED) {
        if (fm[key] === undefined || fm[key] === "") err(`frontmatter: missing \`${key}\``);
    }
    if (fm.type !== undefined && fm.type !== "docs") err("frontmatter: `type` must be `docs`");
    if (fm.diataxis_type !== undefined && !DIATAXIS.includes(fm.diataxis_type)) {
        err(`frontmatter: diataxis_type \`${fm.diataxis_type}\` is not one of ${DIATAXIS.join(" | ")}`);
    }
    if (typeof fm.weight !== "undefined" && typeof fm.weight !== "number")
        err("frontmatter: `weight` must be a number");

    // Title and description
    if (typeof fm.title === "string") {
        const words = fm.title.split(/\s+/).slice(1);
        const capped = words.filter((w) => /^[A-Z][a-z]+$/.test(w));
        if (
            words.length >= 2 &&
            capped.length >= 2 &&
            capped.length === words.filter((w) => /^[a-zA-Z]+$/.test(w)).length
        ) {
            warn(
                `title looks like Title Case ("${fm.title}"); use sentence case unless these are product or component names`,
            );
        }
    }
    if (typeof fm.description === "string") {
        if (fm.description.length > 300)
            warn("description is long; keep it to one sentence (it feeds SEO, cards and llms.txt)");
        if (body.includes(fm.description.trim()))
            warn("description is copied into the body; it should say something the first paragraph doesn't");
    }

    // related_pages
    const related = fm.related_pages ?? [];
    if (!Array.isArray(related)) err("frontmatter: `related_pages` must be a list");
    else {
        if (related.length === 0)
            warn(
                "no related_pages: the Related box falls back to pages sharing an api_symbol, then to siblings",
            );
        if (related.length > 5)
            warn(`related_pages has ${related.length} entries; the theme shows only the first 5`);
        const seen = new Set();
        for (const ref of related) {
            if (seen.has(ref)) warn(`related_pages: duplicate ${ref}`);
            seen.add(ref);
            if (typeof ref !== "string" || !ref.startsWith("/docs/")) {
                err(
                    `related_pages: \`${ref}\` must be an absolute /docs/<path> (resolved in the page's own version)`,
                );
                continue;
            }
            const target = resolveDocsPath(ref);
            if (!target)
                err(`related_pages: ${ref} does not resolve to a page (build drops it with a warning)`);
            else if (resolve(target) === resolve(file))
                err(`related_pages: ${ref} points at the page itself`);
        }
    }

    // api_symbols
    const symbols = fm.api_symbols ?? [];
    if (!Array.isArray(symbols)) err("frontmatter: `api_symbols` must be a list");
    else {
        for (const s of symbols) {
            const m = typeof s === "string" && s.match(/^@gooddata\/([a-z0-9-]+):([A-Za-z_$][\w$]*)$/);
            if (!m) {
                err(`api_symbols: \`${s}\` must look like "@gooddata/<package>:<Symbol>"`);
                continue;
            }
            if (refs && !refs[`${m[1]}.${m[2].toLowerCase()}`] && !knownMisses.has(s)) {
                warn(
                    `api_symbols: ${s} has no reference page (alpha, internal, excluded package or typo?). Generator will warn; intentional misses go in scripts/lib/reference-known-misses.json`,
                );
            }
        }
        if (!refs && symbols.length)
            warn(
                "data/api_refs.json missing (no generated reference), api_symbols not checked against the SDK",
            );
    }

    // Props
    const hasPropsShortcode = /\{\{%\s*props\s*%\}\}/.test(body);
    const propsHeading = body.match(/^## Props\s*$/m);
    if (hasPropsShortcode) {
        if (!propsHeading) warn("{{% props %}} without a `## Props` heading above it");
        if (!symbols.length && !(fm.props_interfaces ?? []).length)
            err("{{% props %}} needs api_symbols naming the component or its props interface");
    }
    if (propsHeading && !hasPropsShortcode) {
        const after = body.slice(propsHeading.index).split(/\n## /)[0];
        if (/^\|.*\|\s*$/m.test(after)) {
            warn(
                "hand-written Props table: use {{% props %}} unless the symbol is @internal (no reference page)",
            );
        }
    }

    // Aliases and legacy_path
    const aliases = fm.aliases ?? [];
    for (const a of aliases) {
        if (typeof a !== "string") continue;
        if (a.startsWith("/")) err(`aliases: \`${a}\` must be page-relative (no leading /)`);
        if (a !== a.toLowerCase()) err(`aliases: \`${a}\` must be lowercase`);
        if (!a.endsWith("/")) err(`aliases: \`${a}\` needs a trailing slash`);
    }
    if (
        fm.legacy_path &&
        !aliases.some((a) => typeof a === "string" && a.replace(/^(\.\.\/)+/, "") === `${fm.legacy_path}/`)
    ) {
        err(`legacy_path ${fm.legacy_path} has no matching alias (scripts/tests/aliases.test.ts fails)`);
    }

    // Body mechanics
    for (const m of body.matchAll(/^```(\w*)/gm)) {
        const lang = m[1];
        if (["javascript", "js", "jsx", "typescript"].includes(lang))
            warn(`code fence \`${lang}\`: use tsx (JSX) or ts`);
    }
    if (/^```\s*$/m.test(body.replace(/```\w+[\s\S]*?```/g, ""))) warn("code fence without a language tag");
    if (/!\[[^\]]*\]\(/.test(body)) warn('bare Markdown image: use {{< figure src="..." alt="..." >}}');
    for (const m of body.matchAll(/\{\{<\s*figure\b[^>]*>\}\}/g))
        if (!/\balt=/.test(m[0])) warn(`figure without alt text: ${m[0]}`);
    if (/\[(here|click here|this link)\]\(/i.test(body))
        warn("link text 'here': describe the target instead");
    if (/^>\s/m.test(body) && fm.diataxis_type !== "explanation")
        warn("blockquote: use {{% alert %}} for notes and caveats");
    if (/^# /m.test(prose(body))) warn("H1 in the body: the theme prints the title as H1; start at ##");
    if (/<(div|span|p|table|figure|img)\b/i.test(prose(body)))
        warn(
            "raw HTML in the body: it lands as is in the page's Markdown copy (index.md); use Markdown or a theme shortcode",
        );

    const text = prose(body);
    if (/\bGoodData UI\b/.test(text)) warn("write GoodData.UI (with the period)");
    if (/\binsights?\b/i.test(text))
        warn("prose says 'insight': use 'visualization' (keep insight only in API names)");
    if (/\bmetrics?\b/i.test(text))
        warn("prose says 'metric': use 'measure' outside MAQL / GoodData Cloud UI context");
    if (/\b(powerful|seamless(ly)?|best-in-class|effortless(ly)?)\b/i.test(text))
        warn("marketing adjective in prose");
    if (/\b(visualis|customis|colour|behaviour|organis)/i.test(text))
        warn("British spelling in prose: use US English");

    // Section placement
    const dir = dirname(file);
    // A page sorts among the pages and sub-sections of its folder; a section's _index.md sorts
    // among those of the parent folder, not among its own children.
    const listDir = basename(file) === "_index.md" ? dirname(dir) : dir;
    const self = resolve(basename(file) === "_index.md" ? dir : file);
    const siblings = readdirSync(listDir, { withFileTypes: true }).flatMap((e) => {
        const path = join(listDir, e.name);
        if (e.isFile() && e.name.endsWith(".md") && e.name !== "_index.md") return [{ name: e.name, path }];
        const index = join(path, "_index.md");
        if (e.isDirectory() && existsSync(index))
            return [{ name: `${e.name}/_index.md`, path: index, dir: path }];
        return [];
    });
    const sameWeight = siblings
        .filter((f) => resolve(f.dir ?? f.path) !== self && readPage(f.path).fm.weight === fm.weight)
        .map((f) => f.name);
    if (fm.weight !== undefined && sameWeight.length)
        warn(`weight ${fm.weight} also used by ${sameWeight.join(", ")}: sidebar order becomes alphabetical`);
    const index = join(dir, "_index.md");
    if (existsSync(index) && resolve(index) !== resolve(file)) {
        const indexBody = readPage(index).body;
        const slug = file.endsWith("_index.md") ? "" : relative(dir, file).replace(/\.md$/, "");
        const listsByHand = /^\s*[-*] \[[^\]]+\]\((\.\.\/|\.\/)?[\w-]/m.test(indexBody);
        if (slug && listsByHand && !new RegExp(`\\(([^)]*/)?${slug}/?\\)`).test(indexBody)) {
            warn(`${relative(TREE, index)} lists its pages by hand and doesn't link ${slug}; add it there`);
        }
    }

    return out;
}

const files = process.argv.slice(2).map((f) => resolve(f));
if (!files.length) {
    console.error("usage: check-page.mjs <page.md> [...]");
    process.exit(2);
}
const refs = loadRefs();
const knownMisses = loadKnownMisses();
let errors = 0;
for (const f of files) {
    if (!existsSync(f)) {
        console.log(`${f}\n  ERROR file not found`);
        errors++;
        continue;
    }
    const lines = checkPage(f, refs, knownMisses);
    errors += lines.filter((l) => l.startsWith("ERROR")).length;
    console.log(`${relative(DOCS_DIR, f)}${lines.length ? "" : "  OK"}`);
    for (const l of lines) console.log(`  ${l}`);
}
process.exit(errors ? 1 : 0);
