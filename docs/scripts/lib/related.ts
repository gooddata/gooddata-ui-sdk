// (C) 2026 GoodData Corporation

/**
 * The Related list of a reference page, ranked by how close two symbols sit in
 * the pruned api-extractor model. Closest first; inside a tier, by name A–Z:
 *
 *   1. parents      what S extends or implements
 *   2. users        functions and variables (components, hooks) whose signature
 *                   references S, and the types that extend S
 *   3. type users   interfaces, types and classes that reference S (e.g. the
 *                   props interfaces with a `config: IChartConfig` member)
 *   4. used types   symbols referenced in S's own signature or members, then
 *                   in its parents' (an inherited `config` still counts)
 *   5. same file    other symbols declared in S's source file
 *   6. guide mates  symbols listed next to S in a guide's api_symbols
 *   7. package      the rest of S's package, filling up to the limit
 *
 * Only symbols with a reference page are linked, S itself never. Indexes are
 * built once for the whole model, not per page.
 */
import { refToSlug, type ApiItem, type ApiPackageJson, type TokenRange } from "./api-model.js";

export interface RelatedInput {
    /** The pruned model, one document per package. */
    docs: ApiPackageJson[];
    /** Top-level symbols that have a reference page (`sdk-ui.foo`). */
    pageSlugs: ReadonlySet<string>;
    /** Slug -> repo-relative source file. */
    sourcePathBySlug: ReadonlyMap<string, string>;
    /** One slug list per guide page, from its api_symbols. */
    guideSymbolGroups: string[][];
    limit?: number;
}

const USER_KINDS = new Set(["Function", "Variable"]);

interface Node {
    name: string;
    kinds: Set<string>;
    parents: Set<string>;
    uses: Set<string>;
}

function refsInRanges(item: ApiItem, ranges: TokenRange[] | undefined, into: Set<string>): void {
    for (const range of ranges ?? []) {
        for (const token of item.excerptTokens?.slice(range.startIndex, range.endIndex) ?? []) {
            const slug = token.canonicalReference && refToSlug(token.canonicalReference);
            if (slug) into.add(slug);
        }
    }
}

function refsDeep(item: ApiItem, into: Set<string>): void {
    for (const token of item.excerptTokens ?? []) {
        const slug = token.canonicalReference && refToSlug(token.canonicalReference);
        if (slug) into.add(slug);
    }
    for (const member of item.members ?? []) refsDeep(member, into);
}

function buildNodes(docs: ApiPackageJson[], pageSlugs: ReadonlySet<string>): Map<string, Node> {
    const nodes = new Map<string, Node>();
    for (const doc of docs) {
        for (const entryPoint of doc.members ?? []) {
            for (const item of entryPoint.members ?? []) {
                const slug = refToSlug(item.canonicalReference);
                if (!slug || !pageSlugs.has(slug)) continue;
                // Overloads share a slug: merge them into one node.
                let node = nodes.get(slug);
                if (!node) {
                    node = { name: item.name, kinds: new Set(), parents: new Set(), uses: new Set() };
                    nodes.set(slug, node);
                }
                node.kinds.add(item.kind);
                const extended = item as ApiItem & { implementsTokenRanges?: TokenRange[] };
                refsInRanges(item, item.extendsTokenRanges, node.parents);
                refsInRanges(item, extended.implementsTokenRanges, node.parents);
                refsDeep(item, node.uses);
            }
        }
    }
    for (const [slug, node] of nodes) {
        for (const set of [node.parents, node.uses]) {
            set.delete(slug);
            for (const s of set) if (!pageSlugs.has(s)) set.delete(s);
        }
    }
    return nodes;
}

function push(map: Map<string, Set<string>>, key: string, value: string): void {
    let set = map.get(key);
    if (!set) map.set(key, (set = new Set()));
    set.add(value);
}

/** Slug -> related slugs, closest first, at most `limit` (default 5, what related.html shows). */
export function computeRelated(input: RelatedInput): Map<string, string[]> {
    const limit = input.limit ?? 5;
    const nodes = buildNodes(input.docs, input.pageSlugs);
    const nameOf = (slug: string) => nodes.get(slug)?.name ?? slug;
    const byName = (a: string, b: string) => nameOf(a).localeCompare(nameOf(b), "en") || a.localeCompare(b);

    // Reverse indexes, once for the whole model.
    const users = new Map<string, Set<string>>();
    const typeUsers = new Map<string, Set<string>>();
    for (const [slug, node] of nodes) {
        const isUser = [...node.kinds].some((k) => USER_KINDS.has(k));
        for (const used of node.uses) push(isUser ? users : typeUsers, used, slug);
        for (const parent of node.parents) push(users, parent, slug);
    }
    const bySource = new Map<string, Set<string>>();
    for (const [slug, path] of input.sourcePathBySlug) if (nodes.has(slug)) push(bySource, path, slug);
    const guideMates = new Map<string, Set<string>>();
    for (const group of input.guideSymbolGroups) {
        const inModel = group.filter((s) => nodes.has(s));
        for (const s of inModel) for (const mate of inModel) push(guideMates, s, mate);
    }
    const byPackage = new Map<string, string[]>();
    for (const slug of nodes.keys()) {
        const pkg = slug.slice(0, slug.indexOf("."));
        byPackage.set(pkg, [...(byPackage.get(pkg) ?? []), slug]);
    }
    for (const list of byPackage.values()) list.sort(byName);

    const related = new Map<string, string[]>();
    for (const [slug, node] of nodes) {
        const out: string[] = [];
        const seen = new Set([slug]);
        const take = (candidates: Iterable<string> | undefined, sorted = false) => {
            if (!candidates || out.length >= limit) return;
            const list = sorted ? [...candidates] : [...candidates].sort(byName);
            for (const c of list) {
                if (out.length >= limit) return;
                if (seen.has(c) || !nodes.has(c)) continue;
                seen.add(c);
                out.push(c);
            }
        };
        take(node.parents);
        take(users.get(slug));
        take(typeUsers.get(slug));
        take(node.uses);
        take([...node.parents].flatMap((p) => [...(nodes.get(p)?.uses ?? [])]));
        const source = input.sourcePathBySlug.get(slug);
        take(source ? bySource.get(source) : undefined);
        take(guideMates.get(slug));
        take(byPackage.get(slug.slice(0, slug.indexOf("."))), true);
        related.set(slug, out);
    }
    return related;
}
