// (C) 2026 GoodData Corporation

import type {
    IUnavailableDashboardReference,
    SupportedDashboardReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import type { IDashboard } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

const BASE_TYPES: SupportedDashboardReferenceTypes[] = ["insight", "dataSet"];
const ALL_TYPES: SupportedDashboardReferenceTypes[] = [
    "insight",
    "dataSet",
    "displayForm",
    "analyticalDashboard",
    "measure",
];
const ENRICHED_TYPES: SupportedDashboardReferenceTypes[] = ["displayForm", "analyticalDashboard", "measure"];

/**
 * Whether the partial-rendering switch is known before the first request: hosts that supply
 * `settings` (our dashboards app does) decide it up front; otherwise the switch arrives with the
 * settings fetched in parallel with the dashboard.
 */
function isPartialRenderingKnownUpfront(ctx: DashboardContext): boolean {
    return Boolean(ctx.config?.settings?.enableDashboardPartialRendering);
}

/**
 * Reference types to request with a dashboard load.
 *
 * @remarks
 * Display-form, drill-target and rich text reference availability costs extra side-loads, so those
 * types are included only when partial rendering is enabled.
 *
 * @param partialRenderingEnabled - whether the `enableDashboardPartialRendering` switch is on
 * @internal
 */
export function getDashboardLoadReferenceTypes(
    partialRenderingEnabled: boolean,
): SupportedDashboardReferenceTypes[] {
    return [...(partialRenderingEnabled ? ALL_TYPES : BASE_TYPES)];
}

/**
 * Reference types for the dashboard load; the extra types need the switch known before the first request.
 */
export function dashboardLoadReferenceTypes(ctx: DashboardContext): SupportedDashboardReferenceTypes[] {
    return getDashboardLoadReferenceTypes(isPartialRenderingKnownUpfront(ctx));
}

/**
 * Completes the availability of display forms, drill targets and rich text references when the dashboard load could not
 * request it (the switch was not known up front), with one more dashboard GET. The extra request is an
 * enrichment: its failure keeps the base result. A persisted dashboard body may differ from the stored
 * one, which is all the backend can inspect, so — like its insights — its availability is left to the
 * caller-provided `config.references`.
 */
export async function loadUnavailableReferences(
    ctx: DashboardContext,
    dashboard: IDashboard,
    baseUnavailable: IUnavailableDashboardReference[] | undefined,
    partialRenderingEnabled: boolean,
    hasPersistedDashboard: boolean,
): Promise<IUnavailableDashboardReference[]> {
    if (!partialRenderingEnabled) {
        return [];
    }
    const base = baseUnavailable ?? [];
    if (hasPersistedDashboard || isPartialRenderingKnownUpfront(ctx)) {
        return base;
    }
    try {
        const extra = await ctx.backend
            .workspace(ctx.workspace)
            .dashboards()
            .getDashboardReferencedObjects(dashboard, ENRICHED_TYPES);
        return [...base, ...(extra.unavailable ?? [])];
    } catch (error) {
        console.warn("Unable to resolve display form and drill target availability.", error);
        return base;
    }
}
