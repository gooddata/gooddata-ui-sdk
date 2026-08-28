// (C) 2026 GoodData Corporation

import {
    type EntitiesApiGetEntityAnalyticalDashboardsRequest,
    FilterContextApi_GetAllEntitiesFilterContexts,
    type JsonApiAnalyticalDashboardOutDocument,
    type JsonApiFilterContextOut,
    type JsonApiFilterContextOutIncludes,
    isAfmObjectIdentifier,
} from "@gooddata/api-client-tiger";
import type {
    IUnavailableDashboardReference,
    SupportedDashboardReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import { type IDashboard, idRef, isIdentifierRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objectTypeToTigerIdType } from "../../../types/refTypeMapping.js";

/**
 * The single replaceable availability mechanism for dashboard references.
 *
 * Contract: a ref present in `data.relationships[<type>]` but absent from `included` (for a type
 * that WAS requested via `include`) means the object exists but is not readable by the current
 * user ("forbidden"). A ref used by the entity's content but absent from `relationships` does not
 * exist ("notFound"). Tiger omits the relationship key altogether when the relation is empty, so
 * for an inspected type an absent key means "no related objects", not "unknown". The entity
 * itself (a dashboard drilling to itself) is never reported: JSON:API does not repeat the primary
 * resource in `included`.
 *
 * Labels (filter display forms) relate to the filter-context entity, not the dashboard, so they
 * are resolved from each filter context's own document (verified on dev-latest). Display forms
 * referenced elsewhere in dashboard content (e.g. drill-to-URL) are not inspected.
 *
 * Nothing outside this module may read `relationships` for availability purposes;
 * replacing the mechanism (explicit 403s, tombstones, permission meta) must only
 * change this module.
 */

type InspectedType = SupportedDashboardReferenceTypes | "filterContext";
type DashboardInclude = NonNullable<EntitiesApiGetEntityAnalyticalDashboardsRequest["include"]>[number];

/**
 * The `include` value under which the dashboard GET links each inspected type; the same key names
 * the relationship in the response, which keeps "inspected iff requested" structural.
 */
const RELATIONSHIP_KEYS = {
    insight: "visualizationObjects",
    dataSet: "datasets",
    dashboardPlugin: "dashboardPlugins",
    filterContext: "filterContexts",
    displayForm: "labels",
    analyticalDashboard: "analyticalDashboards",
} as const satisfies Record<InspectedType, DashboardInclude>;

type RelationshipKey = (typeof RELATIONSHIP_KEYS)[InspectedType];

// in the order the dashboard GET has always requested them (recorded requests match on the URL)
const SIDELOADED_TYPES = ["insight", "dataSet", "dashboardPlugin", "analyticalDashboard"] as const;

/**
 * Side-loads for a dashboard GET that inspect exactly the requested types. Filter contexts are
 * always side-loaded (the dashboard needs them); labels never are (see file header).
 */
export function dashboardSideloadIncludes(types: SupportedDashboardReferenceTypes[]): DashboardInclude[] {
    return [
        RELATIONSHIP_KEYS.filterContext,
        ...SIDELOADED_TYPES.filter((type) => types.includes(type)).map((type) => RELATIONSHIP_KEYS[type]),
    ];
}

interface ILinkage {
    id: string;
    type: string;
}

/** Structural view shared by dashboard and filter-context JSON:API documents. */
interface IJsonApiDocumentLike {
    data: {
        id: string;
        type: string;
        relationships?: Partial<Record<RelationshipKey, { data?: unknown }>>;
        attributes?: { content?: unknown };
    };
    included?: ILinkage[];
}

function isLinkage(value: unknown): value is ILinkage {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as ILinkage).id === "string" &&
        typeof (value as ILinkage).type === "string"
    );
}

function relationshipIds(document: IJsonApiDocumentLike, key: RelationshipKey): Set<string> {
    const data: unknown = document.data.relationships?.[key]?.data;
    return new Set(Array.isArray(data) ? data.filter(isLinkage).map((linkage) => linkage.id) : []);
}

function includedIds(document: IJsonApiDocumentLike, tigerType: string): Set<string> {
    return new Set(
        (document.included ?? []).filter((item) => item.type === tigerType).map((item) => item.id),
    );
}

/**
 * Collects the `{ identifier: { id, type } }` refs from stored content, grouped by tiger type.
 * Content is free-form JSON, so the walk is structural, not schema-bound.
 */
function collectContentRefIds(
    content: unknown,
    result = new Map<string, Set<string>>(),
): Map<string, Set<string>> {
    if (Array.isArray(content)) {
        content.forEach((item) => collectContentRefIds(item, result));
        return result;
    }
    if (typeof content !== "object" || content === null) {
        return result;
    }
    if (isAfmObjectIdentifier(content)) {
        const ids = result.get(content.identifier.type) ?? new Set<string>();
        ids.add(content.identifier.id);
        result.set(content.identifier.type, ids);
    }
    Object.values(content).forEach((value) => collectContentRefIds(value, result));
    return result;
}

function diffInspectedTypes(
    document: IJsonApiDocumentLike,
    inspected: InspectedType[],
): IUnavailableDashboardReference[] {
    const contentRefIds = collectContentRefIds(document.data.attributes?.content);
    const unavailable: IUnavailableDashboardReference[] = [];

    for (const type of inspected) {
        const tigerType = objectTypeToTigerIdType[type];
        const selfId = document.data.type === tigerType ? document.data.id : undefined;
        const related = relationshipIds(document, RELATIONSHIP_KEYS[type]);
        const included = includedIds(document, tigerType);

        for (const id of related) {
            if (id !== selfId && !included.has(id)) {
                unavailable.push({ ref: idRef(id, type), type, reason: "forbidden" });
            }
        }
        for (const id of contentRefIds.get(tigerType) ?? []) {
            if (id !== selfId && !related.has(id) && !included.has(id)) {
                unavailable.push({ ref: idRef(id, type), type, reason: "notFound" });
            }
        }
    }

    return unavailable;
}

/**
 * Resolves which of the requested dashboard references are unavailable and why.
 */
export function resolveUnavailableReferences(
    document: JsonApiAnalyticalDashboardOutDocument,
    types: SupportedDashboardReferenceTypes[],
): IUnavailableDashboardReference[] {
    const inspected: InspectedType[] = ["filterContext", ...types.filter((type) => type !== "displayForm")];
    return diffInspectedTypes(document as IJsonApiDocumentLike, inspected);
}

/**
 * Unavailable references of the effective dashboard: the stored document's diff, keeping only the
 * filter-context entries of contexts the effective dashboard uses — a `filterContextRef` or export
 * override replaces stored contexts, whose availability then does not matter (an override may itself
 * be another stored context). A dashboard without any filter context is how a forbidden stored
 * context looks after conversion, so nothing is dropped in that case.
 */
export function resolveUnavailableDashboardReferences(
    document: JsonApiAnalyticalDashboardOutDocument,
    dashboard: IDashboard,
    types: SupportedDashboardReferenceTypes[],
): IUnavailableDashboardReference[] {
    const unavailable = resolveUnavailableReferences(document, types);
    const contexts = [dashboard.filterContext, ...(dashboard.tabs ?? []).map((tab) => tab.filterContext)];
    if (contexts.every((context) => context === undefined)) {
        return unavailable;
    }
    const inUse = new Set(inspectableFilterContextIds(dashboard));
    return unavailable.filter(
        (entry) =>
            entry.type !== "filterContext" || (isIdentifierRef(entry.ref) && inUse.has(entry.ref.identifier)),
    );
}

/**
 * Resolves which labels (filter display forms) referenced by a filter context are unavailable.
 * The filter context must have been requested with `include: ["labels"]`; `included` is the
 * response's side-loaded items.
 */
export function resolveUnavailableFilterContextReferences(
    context: JsonApiFilterContextOut,
    included: JsonApiFilterContextOutIncludes[] | undefined,
): IUnavailableDashboardReference[] {
    return diffInspectedTypes({ data: context, included } as IJsonApiDocumentLike, ["displayForm"]);
}

/**
 * Labels relate to filter-context entities, not to the dashboard: the dashboard GET side-loads the
 * filter contexts as bare items (no `relationships`), so the existence linkage for filter display
 * forms is reachable only through a direct filter-context GET with `include=labels`, hence this one
 * batched extra request. It inspects the contexts of the effective dashboard, so a `filterContextRef`
 * override is covered; the synthetic export-override context has no entity behind it and is skipped.
 * It would become redundant if the backend emitted `relationships.labels` on the filter-context items
 * inside the dashboard's `included` (not agreed with the backend team — an assumption about a possible
 * change; the diff already handles such documents).
 * This is an enrichment: a failure must not fail the dashboard load, so the affected display forms
 * are left unlisted (see the `unavailable` contract in sdk-backend-spi).
 */
export async function fetchUnavailableFilterDisplayForms(
    authCall: TigerAuthenticatedCallGuard,
    workspaceId: string,
    dashboard: IDashboard,
    types: SupportedDashboardReferenceTypes[],
): Promise<IUnavailableDashboardReference[]> {
    const filterContextIds = inspectableFilterContextIds(dashboard);
    if (!types.includes("displayForm") || filterContextIds.length === 0) {
        return [];
    }
    try {
        const list = await authCall((client) =>
            FilterContextApi_GetAllEntitiesFilterContexts(client.axios, client.basePath, {
                workspaceId,
                filter: filterContextIds.map((id) => `id==${id}`).join(","),
                include: ["labels"],
                size: filterContextIds.length,
            }).then((result) => result.data),
        );
        return list.data.flatMap((context) =>
            resolveUnavailableFilterContextReferences(context, list.included),
        );
    } catch (error) {
        console.warn(
            "Filter context label availability could not be resolved; treating labels as available.",
            error,
        );
        return [];
    }
}

/**
 * Identifiers of the persisted filter contexts the dashboard actually uses (root and tabs; a
 * `filterContextRef` override replaces them all). Only a ref typed `filterContext` names an entity
 * the backend can inspect — the synthetic export-override context is skipped by this rule.
 */
export function inspectableFilterContextIds(dashboard: IDashboard): string[] {
    const contexts = [dashboard.filterContext, ...(dashboard.tabs ?? []).map((tab) => tab.filterContext)];
    const ids = contexts.flatMap((context) =>
        context && isIdentifierRef(context.ref) && context.ref.type === "filterContext"
            ? [context.ref.identifier]
            : [],
    );
    return Array.from(new Set(ids));
}
