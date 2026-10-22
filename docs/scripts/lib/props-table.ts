// (C) 2026 GoodData Corporation

/**
 * Guide "## Props" tables, rendered from the api model at every docs build.
 *
 * Nothing here is committed: generate-reference.ts writes one Markdown table per
 * guide symbol into api_props.json next to api_refs.json, and a guide page
 * renders it with {{% props %}} (layouts/_partials/props-markdown.html). The
 * table and the reference come from the same pruned model in the same run, so
 * they cannot disagree.
 *
 * Links are written as `](apiref:<page path>)`, the path carrying the same
 * __API_REF_BASE__ placeholder as api_refs.json. place-api-reference.sh rewrites
 * the placeholder, and the partial turns each target into its page's permalink
 * (or drops the link when the page is missing), so the table works under any
 * baseURL.
 */
import {
    refToSlug,
    resolvePropsForPage,
    type ApiModel,
    type ModelProp,
    type TypeToken,
} from "./api-model.js";
import { type GuideSymbols } from "./reference-usage.js";

/** Link scheme the Hugo partial resolves; never reaches a reader. */
const LINK_SCHEME = "apiref:";

export interface RefLinker {
    /** Page path of a top-level symbol slug (`sdk-ui.foo`), or undefined when it has no page. */
    symbolPath(slug: string): string | undefined;
    /** Page path of a member page (`sdk-ui-charts.ibarchartbucketprops.filters`), or undefined. */
    memberPath(ownerSlug: string, propName: string): string | undefined;
}

/** Linker that resolves nothing — every cell renders as plain code. */
export const NO_LINKS: RefLinker = {
    symbolPath: () => undefined,
    memberPath: () => undefined,
};

/** Mirrors api-documenter's Utilities.getSafeFilenameForName. */
export function safeFilenameForName(name: string): string {
    return name.replace(/[^a-z0-9_\-.]/gi, "_").toLowerCase();
}

/**
 * @param refBase     reference root as written into page paths (the placeholder at generation time)
 * @param pageSlugs   every generated reference page (`sdk-ui.foo`, `sdk-ui.foo.bar`); a link to anything else is dropped
 */
export function makeRefLinker(refBase: string, pageSlugs: ReadonlySet<string>): RefLinker {
    const pathOf = (slug: string) => `${refBase}/${slug.slice(0, slug.indexOf("."))}/${slug}`;
    return {
        symbolPath: (slug) => (pageSlugs.has(slug) ? pathOf(slug) : undefined),
        memberPath(ownerSlug, propName) {
            const slug = `${ownerSlug}.${safeFilenameForName(propName)}`;
            return pageSlugs.has(slug) ? pathOf(slug) : undefined;
        },
    };
}

/** Escape pipes and collapse newlines so a cell cannot break the Markdown table. */
function escapeCell(value: string): string {
    return value
        .replace(/\|/g, "\\|")
        .replace(/\r?\n+/g, " ")
        .trim();
}

function code(text: string): string {
    const t = escapeCell(text);
    return t.includes("`") ? `\`\` ${t} \`\`` : `\`${t}\``;
}

function linkedCode(text: string, path: string | undefined): string {
    return path ? `[${code(text)}](${LINK_SCHEME}${path})` : code(text);
}

/** Own before inherited; required before optional within each; alpha within tier. */
function sortProps<T extends { name: string; required: boolean; inherited: boolean }>(rows: T[]): T[] {
    const tier = (r: T) => (r.inherited ? 2 : 0) + (r.required ? 0 : 1);
    return [...rows].sort((a, b) => tier(a) - tier(b) || a.name.localeCompare(b.name));
}

function renderType(tokens: TypeToken[], linker: RefLinker): string {
    const out: string[] = [];
    let buffer = "";
    // Plain runs become code spans; whitespace at their edges moves outside the
    // span so `string | ObjRef` does not collapse into `string |ObjRef`.
    const flush = () => {
        if (buffer.trim()) {
            const lead = /^\s/.test(buffer) ? " " : "";
            const trail = /\s$/.test(buffer) ? " " : "";
            out.push(`${lead}${code(buffer)}${trail}`);
        }
        buffer = "";
    };
    for (const t of tokens) {
        const slug = t.ref ? refToSlug(t.ref) : undefined;
        const path = slug ? linker.symbolPath(slug) : undefined;
        if (path) {
            flush();
            out.push(linkedCode(t.text, path));
        } else {
            buffer += t.text;
        }
    }
    flush();
    return out.join("").trim() || "`unknown`";
}

const HEADER = [
    "| Prop | Type | Required | Description | Inherited from |",
    "|------|------|----------|-------------|----------------|",
];

/**
 * The Markdown table (no heading). Empty string when there are no props.
 * `rootStage`: the interface's own stage. A prop gets _(Beta)_ or _(Alpha)_ only when it is less
 * stable than the interface: on a @beta interface every row would say Beta, and the reference
 * page says so once.
 */
export function renderPropsTable(
    props: ModelProp[],
    linker: RefLinker,
    rootStage: "public" | "beta" | "alpha" = "public",
): string {
    if (!props.length) return "";
    const rows = sortProps(props).map((p) => {
        const ownerSlug = refToSlug(p.ownerRef);
        const name = linkedCode(p.name, ownerSlug ? linker.memberPath(ownerSlug, p.name) : undefined);
        const type = renderType(p.type, linker);
        const required = p.required ? "Yes" : "No";
        const description =
            [
                p.deprecated ? "_(Deprecated)_" : "",
                rootStage === "public" && p.beta ? "_(Beta)_" : "",
                rootStage !== "alpha" && p.alpha ? "_(Alpha)_" : "",
                escapeCell(p.description),
            ]
                .filter(Boolean)
                .join(" ") || "—";
        const inherited = p.inherited
            ? linkedCode(p.owner, ownerSlug ? linker.symbolPath(ownerSlug) : undefined)
            : "—";
        return `| ${name} | ${type} | ${required} | ${description} | ${inherited} |`;
    });
    return [...HEADER, ...rows].join("\n");
}

/** Key for a `props_interfaces` entry; `api_symbols` entries are keyed as written. */
export function propsInterfaceKey(name: string): string {
    return `props_interfaces:${name}`;
}

interface PropsData {
    /** `@gooddata/pkg:Symbol` or `props_interfaces:IName` -> Markdown table. */
    tables: Record<string, string>;
    /** Guide pages (content-relative, no extension) whose symbols resolve to no public props. */
    unresolvedPages: string[];
}

function releaseStage(releaseTag?: string): "public" | "beta" | "alpha" {
    return releaseTag === "Beta" ? "beta" : releaseTag === "Alpha" ? "alpha" : "public";
}

/**
 * One table per symbol the guides name. A page renders the first of its
 * `api_symbols` that has a table (props_interfaces only when it has no
 * api_symbols), which is how refresh-props resolved a page before tables were
 * generated at build time.
 */
export function buildPropsData(model: ApiModel, guides: GuideSymbols[], linker: RefLinker): PropsData {
    const tables: Record<string, string> = {};
    const unresolvedPages: string[] = [];
    const tableFor = (key: string, symbols: string[], interfaces: string[]) => {
        if (!(key in tables)) {
            const resolved = resolvePropsForPage(model, symbols, interfaces);
            tables[key] = resolved
                ? renderPropsTable(resolved.props, linker, releaseStage(resolved.root.releaseTag))
                : "";
        }
        return tables[key];
    };
    for (const page of guides) {
        const found = page.apiSymbols.length
            ? page.apiSymbols.map((s) => tableFor(s, [s], [])).some(Boolean)
            : page.propsInterfaces.map((i) => tableFor(propsInterfaceKey(i), [], [i])).some(Boolean);
        if (page.usesShortcode && !found) unresolvedPages.push(page.path);
    }
    for (const key of Object.keys(tables)) if (!tables[key]) delete tables[key];
    return { tables, unresolvedPages };
}
