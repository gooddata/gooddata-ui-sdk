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
];

/**
 * Whether the partial-rendering switch is known before the first request: hosts that supply
 * `settings` (our dashboards app does) decide it up front; otherwise the switch arrives with the
 * settings fetched in parallel with the dashboard.
 */
function isPartialRenderingKnownUpfront(ctx: DashboardContext): boolean {
    return Boolean(ctx.config?.settings?.enableDashboardPartialRendering);
}

/**
 * Reference types for the dashboard load. Display-form and drill-target availability needs extra
 * side-loads, so they are requested with the dashboard only when the switch is already known to be on.
 */
export function dashboardLoadReferenceTypes(ctx: DashboardContext): SupportedDashboardReferenceTypes[] {
    return isPartialRenderingKnownUpfront(ctx) ? ALL_TYPES : BASE_TYPES;
}

/**
 * Completes the availability of display forms and drill targets when the dashboard load could not
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
            .getDashboardReferencedObjects(dashboard, ["displayForm", "analyticalDashboard"]);
        return [...base, ...(extra.unavailable ?? [])];
    } catch (error) {
        console.warn("Unable to resolve display form and drill target availability.", error);
        return base;
    }
}
