// (C) 2026 GoodData Corporation

/**
 * Every built-in dashboard event and command, from the `DashboardEvents` and
 * `DashboardCommands` unions in the pruned model. The generator merges each
 * entry into its api_refs.json record; the theme's `dashboard-catalog`
 * shortcode renders them as tables on the events and dispatch guides.
 *
 * Only union members with a reference page are listed, so @alpha ones drop out
 * with the rest of the unpublished API.
 */
import { refToSlug, type ApiItem, type ApiPackageJson, type TokenRange } from "./api-model.js";
import { summaryFromDocComment } from "./tsdoc.js";

const DASHBOARD = "@gooddata/sdk-ui-dashboard";
const UNIONS = { DashboardEvents: "event", DashboardCommands: "command" } as const;
const TYPE_STRING = /readonly type:\s*"([^"]+)"/;

export interface CatalogHelper {
    title: string;
    /** Absent when the function has no page of its own (its slug clashes with another symbol's). */
    slug?: string;
}

export interface CatalogEntry {
    catalog: "event" | "command";
    /** The `type` string, e.g. `GDC.DASH/EVT.SAVED`. */
    event_type?: string;
    summary: string;
    /** Events: their `is…` type guards. Commands: the factory functions that create them. */
    helpers: CatalogHelper[];
}

/** The first sentence: a table cell, not the reference page. */
export function firstSentence(summary: string): string {
    return /^.+?[.!?](?=\s|$)/.exec(summary)?.[0] ?? summary;
}

const text = (item: ApiItem) => (item.excerptTokens ?? []).map((t) => t.text).join("");

function typeString(item: ApiItem): string | undefined {
    return (
        TYPE_STRING.exec(text(item))?.[1] ??
        (item.members ?? []).map((m) => TYPE_STRING.exec(text(m))?.[1]).find(Boolean)
    );
}

function returnRefs(item: ApiItem): { slugs: string[]; isGuard: boolean } {
    const range = (item as ApiItem & { returnTypeTokenRange?: TokenRange }).returnTypeTokenRange;
    const tokens = range ? (item.excerptTokens ?? []).slice(range.startIndex, range.endIndex) : [];
    const slugs = tokens.flatMap((t) => {
        const slug = t.canonicalReference && refToSlug(t.canonicalReference);
        return slug ? [slug] : [];
    });
    return { slugs, isGuard: tokens.some((t) => /\bis\s*$/.test(t.text)) };
}

/** Slug -> catalog entry for every published dashboard event and command. */
export function buildDashboardCatalog(
    docs: ApiPackageJson[],
    pageSlugs: ReadonlySet<string>,
): Map<string, CatalogEntry> {
    const catalog = new Map<string, CatalogEntry>();
    const doc = docs.find((d) => d.name === DASHBOARD);
    if (!doc) return catalog;
    const items = doc.members.flatMap((entryPoint) => entryPoint.members ?? []);
    // By full canonicalReference: `ChangeDateFilterSelection:type` and the
    // `changeDateFilterSelection:function` that creates it share a slug.
    const byRef = new Map(items.map((i) => [i.canonicalReference, i]));

    for (const [union, kind] of Object.entries(UNIONS)) {
        const unionItem = items.find((i) => i.name === union);
        for (const token of unionItem?.excerptTokens ?? []) {
            const slug = token.canonicalReference && refToSlug(token.canonicalReference);
            const member = slug && byRef.get(token.canonicalReference!);
            if (!slug || !member || !pageSlugs.has(slug) || catalog.has(slug)) continue;
            catalog.set(slug, {
                catalog: kind,
                ...(typeString(member) ? { event_type: typeString(member) } : {}),
                summary: firstSentence(summaryFromDocComment(member.docComment)),
                helpers: [],
            });
        }
    }

    // Guards for events, factories for commands: functions whose return type names the entry.
    const helperSummary = new Map<string, string>();
    for (const item of items) {
        if (item.kind !== "Function") continue;
        const { slugs, isGuard } = returnRefs(item);
        const ownSlug = refToSlug(item.canonicalReference);
        for (const slug of slugs) {
            const entry = catalog.get(slug);
            if (!entry || isGuard !== (entry.catalog === "event")) continue;
            if (entry.helpers.some((h) => h.title === `${item.name}()`)) continue;
            const linkable = ownSlug && ownSlug !== slug && pageSlugs.has(ownSlug) && !catalog.has(ownSlug);
            entry.helpers.push({ title: `${item.name}()`, ...(linkable ? { slug: ownSlug } : {}) });
            helperSummary.set(`${item.name}()`, firstSentence(summaryFromDocComment(item.docComment)));
        }
    }
    for (const entry of catalog.values()) {
        entry.helpers.sort((a, b) => a.title.localeCompare(b.title, "en"));
        // Many command types carry no doc comment of their own; their factory usually says what they do.
        if (!entry.summary && entry.catalog === "command") {
            entry.summary = entry.helpers.map((h) => helperSummary.get(h.title)).find(Boolean) ?? "";
        }
    }
    return catalog;
}
