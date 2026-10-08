// (C) 2026 GoodData Corporation

import {
    type EntitiesApiGetEntityAnalyticalDashboardsRequest,
    type FilterContextApiGetAllEntitiesFilterContextsRequest,
    FilterContextApi_GetAllEntitiesFilterContexts,
    type JsonApiAnalyticalDashboardOutDocument,
    type JsonApiFilterContextOut,
    type RestrictedObject,
    isAfmObjectIdentifier,
} from "@gooddata/api-client-tiger";
import type {
    IUnavailableDashboardReference,
    SupportedDashboardReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import {
    type IDashboard,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemValidateElementsBy,
    idRef,
    isComputedAttributeRef,
    isDashboardAttributeFilterItem,
    isDashboardMeasureValueFilter,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import {
    getForbiddenReferences,
    getRelationshipIds,
} from "../../../convertors/fromBackend/RestrictedReferencesConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objectTypeToTigerIdType } from "../../../types/refTypeMapping.js";

/**
 * The single replaceable availability mechanism for dashboard references.
 *
 * Contract: Tiger lists references withheld from `included` under document-level
 * `meta.restricted`; those are "forbidden". A ref used by the entity's content but absent from
 * `relationships` does not exist ("notFound"). Tiger omits the relationship key altogether when
 * the relation is empty, so for an inspected type an absent key means "no related objects", not
 * "unknown". Missing `meta.restricted` means no permission filtering applies (or the backend does
 * not support the signal), and must not be inferred from a relationship/include mismatch. The
 * entity itself (a dashboard drilling to itself) is never reported: JSON:API does not repeat the
 * primary resource in `included`.
 *
 * Filter display forms, computed attributes and metrics are resolved from each filter context's own
 * document.
 * Labels referenced directly by dashboard content (including saved custom URL dependencies) are
 * inspected here.
 *
 * Dependencies embedded in rich text are extracted by the backend on save; custom URL dependencies
 * are materialized as structured refs by the frontend. Existing dashboards must be saved again (or
 * backfilled) before newly supported dependencies are linked. Missing restriction metadata alone
 * must never be interpreted as a permission denial.
 *
 * Reading `meta.restricted` against relationships is shared with automations in
 * `RestrictedReferencesConverter`; nothing else may interpret the raw availability metadata or
 * relationships.
 */

type InspectedType = SupportedDashboardReferenceTypes | "filterContext";
type DashboardInclude = NonNullable<EntitiesApiGetEntityAnalyticalDashboardsRequest["include"]>[number];
type FilterContextInclude = NonNullable<
    FilterContextApiGetAllEntitiesFilterContextsRequest["include"]
>[number];

/**
 * The `include` value under which the dashboard GET links each type it can link; the same key names
 * the relationship in the response, which keeps "inspected iff requested" structural.
 */
const DASHBOARD_RELATIONSHIP_KEYS = {
    insight: "visualizationObjects",
    dataSet: "datasets",
    dashboardPlugin: "dashboardPlugins",
    filterContext: "filterContexts",
    displayForm: "labels",
    measure: "metrics",
    computedAttribute: "computedAttributes",
    analyticalDashboard: "analyticalDashboards",
} as const satisfies Partial<Record<InspectedType, DashboardInclude>>;

type DashboardInspectedType = keyof typeof DASHBOARD_RELATIONSHIP_KEYS;

/** The same for the filter-context GET, which links the objects the filters use. */
const FILTER_CONTEXT_RELATIONSHIP_KEYS = {
    displayForm: "labels",
    computedAttribute: "computedAttributes",
    measure: "metrics",
    fact: "facts",
} as const satisfies Partial<Record<InspectedType, FilterContextInclude>>;

type FilterContextInspectedType = keyof typeof FILTER_CONTEXT_RELATIONSHIP_KEYS;

type RelationshipKeys = Partial<Record<InspectedType, DashboardInclude | FilterContextInclude>>;
type RelationshipKey = DashboardInclude | FilterContextInclude;

/** Structural view shared by dashboard and filter-context JSON:API documents. */
interface IJsonApiDocumentLike {
    data: {
        id: string;
        type: string;
        relationships?: Partial<Record<RelationshipKey, { data?: unknown }>>;
        attributes?: { content?: unknown };
    };
    meta?: {
        restricted?: RestrictedObject[];
    };
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

function diffInspectedTypes<T extends InspectedType>(
    document: IJsonApiDocumentLike,
    relationshipKeys: Record<T, RelationshipKey> & RelationshipKeys,
    inspected: T[],
): IUnavailableDashboardReference[] {
    const contentRefIds = collectContentRefIds(document.data.attributes?.content);
    const unavailable: IUnavailableDashboardReference[] = [];

    for (const type of inspected) {
        const tigerType = objectTypeToTigerIdType[type];
        const selfId = document.data.type === tigerType ? document.data.id : undefined;
        const related = getRelationshipIds(document.data.relationships, relationshipKeys[type]);

        unavailable.push(...getForbiddenReferences(type, related, document.meta?.restricted ?? [], selfId));
        for (const id of contentRefIds.get(tigerType) ?? []) {
            if (id !== selfId && !related.has(id)) {
                unavailable.push({
                    ref: idRef(id, type),
                    type,
                    reason: "notFound",
                });
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
    const inspected = ["filterContext", ...types].filter(
        (type): type is DashboardInspectedType => type in DASHBOARD_RELATIONSHIP_KEYS,
    );
    return diffInspectedTypes(document as IJsonApiDocumentLike, DASHBOARD_RELATIONSHIP_KEYS, inspected);
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
 * Resolves which filter display forms, computed attributes, metrics and facts referenced by a filter
 * context are unavailable. Each inspected type must have been requested as an include (`labels`,
 * `computedAttributes`, `metrics`, `facts`) so the response contains both relationship linkages and
 * document-level `meta.restricted` for it.
 */
export function resolveUnavailableFilterContextReferences(
    context: JsonApiFilterContextOut,
    restricted: RestrictedObject[] | undefined,
    inspected: FilterContextInspectedType[],
): IUnavailableDashboardReference[] {
    return diffInspectedTypes(
        { data: context, meta: { restricted } } as IJsonApiDocumentLike,
        FILTER_CONTEXT_RELATIONSHIP_KEYS,
        inspected,
    );
}

/**
 * Filter labels, computed attributes, metrics and facts relate to their filter-context entities: the
 * dashboard GET side-loads the filter contexts as bare items (no `relationships`), so the existence
 * linkage for filter objects is reachable only through a direct filter-context GET with `include=labels`
 * (and `computedAttributes`, `metrics`, `facts`), hence this one batched extra request. Types other than
 * labels are included only when a filter uses them (metric value filters, filters on computed
 * attributes, metrics and facts limiting a filter's values), so other dashboards never request them.
 * It inspects the contexts of the effective dashboard, so a `filterContextRef` override is covered;
 * the synthetic export-override context has no entity behind it and is skipped.
 * It would become redundant if the backend emitted `relationships.labels` on the filter-context items
 * inside the dashboard's `included` (not agreed with the backend team — an assumption about a possible
 * change; the diff already handles such documents).
 * This is an enrichment: a failure must not fail the dashboard load, so the affected filter objects
 * are left unlisted (see the `unavailable` contract in sdk-backend-spi).
 */
export async function fetchUnavailableFilterDisplayForms(
    authCall: TigerAuthenticatedCallGuard,
    workspaceId: string,
    dashboard: IDashboard,
    types: SupportedDashboardReferenceTypes[],
): Promise<IUnavailableDashboardReference[]> {
    const filterContextIds = inspectableFilterContextIds(dashboard);
    const used = filterObjectTypes(dashboard);
    const inspected = (Object.keys(FILTER_CONTEXT_RELATIONSHIP_KEYS) as FilterContextInspectedType[]).filter(
        (type) => types.includes(type) && used.has(type),
    );
    if (inspected.length === 0 || filterContextIds.length === 0) {
        return [];
    }
    try {
        const list = await authCall((client) =>
            FilterContextApi_GetAllEntitiesFilterContexts(client.axios, client.basePath, {
                workspaceId,
                filter: filterContextIds.map((id) => `id==${id}`).join(","),
                include: inspected.map((type) => FILTER_CONTEXT_RELATIONSHIP_KEYS[type]),
                size: filterContextIds.length,
            }).then((result) => result.data),
        );
        return list.data.flatMap((context) =>
            resolveUnavailableFilterContextReferences(context, list.meta?.restricted, inspected),
        );
    } catch (error) {
        console.warn(
            "Filter context reference availability could not be resolved; treating the references as available.",
            error,
        );
        return [];
    }
}

/**
 * The filter-context object types the dashboard's filters use: labels always; computed attributes of
 * attribute filters built on them; metrics of metric value filters; metrics and facts that limit an
 * attribute filter's values.
 */
function filterObjectTypes(dashboard: IDashboard): Set<FilterContextInspectedType> {
    const used = new Set<FilterContextInspectedType>(["displayForm"]);
    const contexts = [dashboard.filterContext, ...(dashboard.tabs ?? []).map((tab) => tab.filterContext)];
    for (const filter of contexts.flatMap((context) => context?.filters ?? [])) {
        if (isDashboardMeasureValueFilter(filter)) {
            used.add("measure");
        }
        if (!isDashboardAttributeFilterItem(filter)) {
            continue;
        }
        if (isComputedAttributeRef(dashboardAttributeFilterItemDisplayForm(filter))) {
            used.add("computedAttribute");
        }
        for (const ref of dashboardAttributeFilterItemValidateElementsBy(filter) ?? []) {
            if (isIdentifierRef(ref) && (ref.type === "measure" || ref.type === "fact")) {
                used.add(ref.type);
            }
        }
    }
    return used;
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
