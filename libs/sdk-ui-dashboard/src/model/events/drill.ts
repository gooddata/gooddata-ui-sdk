// (C) 2021-2023 GoodData Corporation
import {
    IInsight,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToLegacyDashboard,
    FilterContextItem,
} from "@gooddata/sdk-model";
import { ExplicitDrill } from "@gooddata/sdk-ui";

import { DashboardContext, FiltersInfo } from "../types/commonTypes.js";
import { IDashboardEvent } from "./base.js";
import {
    IDashboardDrillEvent,
    IDrillDownDefinition,
    DashboardDrillContext,
    IDashboardFilter,
} from "../../types.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardDrillRequested} event.
 * @alpha
 */
export interface DashboardDrillRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Context in which the drill interaction was triggered (widget and insight details - if available).
     */
    readonly drillContext: DashboardDrillContext;
}

/**
 * This event is emitted on start of the resolution of the {@link Drill} command.
 * It contains details about all possible drill definitions that are available for this particular drill interaction
 *
 * @alpha
 */
export interface DashboardDrillRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.REQUESTED";
    readonly payload: DashboardDrillRequestedPayload;
}

/**
 * @alpha
 */
export function drillRequested(
    ctx: DashboardContext,
    drillEvent: IDashboardDrillEvent,
    drillContext: DashboardDrillContext,
    correlationId?: string,
): DashboardDrillRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillContext,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillRequested = eventGuard<DashboardDrillRequested>("GDC.DASH/EVT.DRILL.REQUESTED");

/**
 * Payload of the {@link DashboardDrillResolved} event.
 * @alpha
 */
export interface DashboardDrillResolvedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Context in which the drill interaction was triggered (widget and insight details - if available).
     */
    readonly drillContext: DashboardDrillContext;
}

/**
 * A general drill event that is emitted each time any dashboard drill is resolved.
 * It contains only valid drillDefinitions for this particular drill interaction,
 * so you can select and dispatch relevant more granular drill command(s).
 *
 * This is general dashboard drill event with details about all possible more granular drill interactions that can follow.
 * Reason for this general drill event is that it may happen that multiple drill interactions are possible for one drill event.
 *
 * Example: some attribute on the insight has drill down set and also widget has drill to insight set. Then this event will be dispatched with both
 * {@link @gooddata/sdk-ui-ext#IDrillDownDefinition} and {@link @gooddata/sdk-backend-spi#IDrillToInsight} definitions.
 *
 * - This must be always the first event that occurs after the drill interaction, and must be dispatched before more granular drill events.
 * - Specific drill commands that can follow this general drill event are: {@link DrillDown}, {@link DrillToInsight}, {@link DrillToDashboard},
 *   {@link DrillToCustomUrl}, {@link DrillToAttributeUrl}, {@link DrillToLegacyDashboard}
 *
 * @alpha
 */
export interface DashboardDrillResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.RESOLVED";
    readonly payload: DashboardDrillResolvedPayload;
}

/**
 * @alpha
 */
export function drillResolved(
    ctx: DashboardContext,
    drillEvent: IDashboardDrillEvent,
    drillContext: DashboardDrillContext,
    correlationId?: string,
): DashboardDrillResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.RESOLVED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillContext,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillResolved = eventGuard<DashboardDrillResolved>("GDC.DASH/EVT.DRILL.RESOLVED");

//
//
//

/**
 * Payload of the {@link DashboardDrillDownRequested} event.
 * @alpha
 */
export interface DashboardDrillDownRequestedPayload {
    /**
     * Drill down definition that was applied.
     */
    readonly drillDefinition: IDrillDownDefinition;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * The target insight to apply drill down on.
     */
    readonly insight: IInsight;
}

/**
 * This event is emitted on start of the resolution of the {@link DrillDown} command.
 * It contains the target insight to apply the drill down on (result of the drill down application
 * depends on the particular visualization type).
 *
 * @alpha
 */
export interface DashboardDrillDownRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.REQUESTED";
    readonly payload: DashboardDrillDownRequestedPayload;
}

/**
 * @alpha
 */
export function drillDownRequested(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillDownDefinition,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillDownRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.REQUESTED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillDownRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillDownRequested = eventGuard<DashboardDrillDownRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_DOWN.REQUESTED",
);

/**
 * Payload of the {@link DashboardDrillDownResolved} event.
 * @alpha
 */
export interface DashboardDrillDownResolvedPayload {
    /**
     * Drill down definition that was applied.
     */
    readonly drillDefinition: IDrillDownDefinition;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Target insight with the drill down definition applied.
     */
    readonly insight: IInsight;
}

/**
 * This event is emitted as a result of the {@link DrillDown} command.
 * It contains the target insight with the drill down definition applied (result of the drill down application
 * depends on the particular visualization type).
 *
 * In the default dashboard implementation this event also opens drill dialog with the insight
 * that has this particular drill down definition applied.
 *
 * @alpha
 */
export interface DashboardDrillDownResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED";
    readonly payload: DashboardDrillDownResolvedPayload;
}

/**
 * @alpha
 */
export function drillDownResolved(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillDownDefinition,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillDownResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillDownResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillDownResolved = eventGuard<DashboardDrillDownResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link DashboardDrillToInsightRequested} event.
 * @alpha
 */
export interface DashboardDrillToInsightRequestedPayload {
    /**
     * Drill definition with the target insight.
     */
    readonly drillDefinition: IDrillToInsight;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Target insight with the drill intersection filters applied.
     */
    readonly insight: IInsight;
}

/**
 * This event is emitted on start of the resolution of the {@link DrillToInsight} command.
 * It contains the target insight to apply drill intersection filters on.
 *
 * @alpha
 */
export interface DashboardDrillToInsightRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.REQUESTED";
    readonly payload: DashboardDrillToInsightRequestedPayload;
}

/**
 * @alpha
 */
export function drillToInsightRequested(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillToInsight,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToInsightRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.REQUESTED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToInsightRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToInsightRequested = eventGuard<DashboardDrillToInsightRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.REQUESTED",
);

/**
 * Payload of the {@link DashboardDrillToInsightResolved} event.
 * @alpha
 */
export interface DashboardDrillToInsightResolvedPayload {
    /**
     * Drill definition with the target insight.
     */
    readonly drillDefinition: IDrillToInsight;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Target insight with the drill intersection filters applied.
     */
    readonly insight: IInsight;
}

/**
 * This event is emitted as a result of the {@link DrillToInsight} command.
 * It contains the target insight with the drill intersection filters applied.
 *
 * In the default dashboard implementation this event also opens drill dialog with the insight
 * that has the drill intersection filters applied.
 *
 * @alpha
 */
export interface DashboardDrillToInsightResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED";
    readonly payload: DashboardDrillToInsightResolvedPayload;
}

/**
 * @alpha
 */
export function drillToInsightResolved(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillToInsight,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToInsightResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToInsightResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToInsightResolved = eventGuard<DashboardDrillToInsightResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link DashboardDrillToDashboardRequested} event.
 * @alpha
 */
export interface DashboardDrillToDashboardRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     *  Drill definition with the target dashboard.
     */
    readonly drillDefinition: IDrillToDashboard;
}

/**
 * This event is emitted on start of the resolution of the {@link DrillToDashboard} command.
 *
 * @alpha
 */
export interface DashboardDrillToDashboardRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.REQUESTED";
    readonly payload: DashboardDrillToDashboardRequestedPayload;
}

/**
 * @alpha
 */
export function drillToDashboardRequested(
    ctx: DashboardContext,
    drillDefinition: IDrillToDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToDashboardRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToDashboardRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToDashboardRequested = eventGuard<DashboardDrillToDashboardRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.REQUESTED",
);

/**
 * Payload of the {@link DashboardDrillToDashboardResolved} event.
 * @alpha
 */
export interface DashboardDrillToDashboardResolvedPayload {
    /**
     * Drill intersection filters that can be applied to the target dashboard.
     */
    readonly filters: (IDashboardFilter | FilterContextItem)[];
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     *  Drill definition with the target dashboard.
     */
    readonly drillDefinition: IDrillToDashboard;
}

/**
 * This event is emitted as a result of the {@link DrillToDashboard} command.
 * It contains the drill intersection filters that can be applied to the target dashboard.
 *
 * There is a factory function to create default event handler for drill to same dashboard - see {@link newDrillToSameDashboardHandler}.
 *
 * @alpha
 */
export interface DashboardDrillToDashboardResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED";
    readonly payload: DashboardDrillToDashboardResolvedPayload;
}

/**
 * @alpha
 */
export function drillToDashboardResolved(
    ctx: DashboardContext,
    filters: (IDashboardFilter | FilterContextItem)[],
    drillDefinition: IDrillToDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToDashboardResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        ctx,
        correlationId,
        payload: {
            filters,
            drillDefinition,
            drillEvent,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToDashboardResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToDashboardResolved = eventGuard<DashboardDrillToDashboardResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link DashboardDrillToCustomUrlRequested} event.
 * @alpha
 */
export interface DashboardDrillToCustomUrlRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the custom url that was resolved.
     */
    readonly drillDefinition: IDrillToCustomUrl;
}

/**
 * This event is emitted on start of the resolution of the {@link DrillToCustomUrl} command.
 *
 * @alpha
 */
export interface DashboardDrillToCustomUrlRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.REQUESTED";
    readonly payload: DashboardDrillToCustomUrlRequestedPayload;
}

/**
 * @alpha
 */
export function drillToCustomUrlRequested(
    ctx: DashboardContext,
    drillDefinition: IDrillToCustomUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToCustomUrlRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToCustomUrlRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToCustomUrlRequested = eventGuard<DashboardDrillToCustomUrlRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.REQUESTED",
);

/**
 * Payload of the {@link DashboardDrillToCustomUrlResolved} event.
 * @alpha
 */
export interface DashboardDrillToCustomUrlResolvedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the custom url that was resolved.
     */
    readonly drillDefinition: IDrillToCustomUrl;
    /**
     * Resolved custom url.
     */
    readonly url: string;
    /**
     * Information about filters used on the dashboard.
     */
    readonly filtersInfo: FiltersInfo;
}

/**
 * This event is emitted as a result of the {@link DrillToCustomUrl} command.
 * It contains resolved custom url from the drill definition.
 *
 * @alpha
 */
export interface DashboardDrillToCustomUrlResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED";
    readonly payload: DashboardDrillToCustomUrlResolvedPayload;
}

/**
 * @alpha
 */
export function drillToCustomUrlResolved(
    ctx: DashboardContext,
    url: string,
    drillDefinition: IDrillToCustomUrl,
    drillEvent: IDashboardDrillEvent,
    filtersInfo: FiltersInfo,
    correlationId?: string,
): DashboardDrillToCustomUrlResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
        ctx,
        correlationId,
        payload: {
            url,
            drillEvent,
            drillDefinition,
            filtersInfo,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToCustomUrlResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToCustomUrlResolved = eventGuard<DashboardDrillToCustomUrlResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link DashboardDrillToAttributeUrlRequested} event.
 * @alpha
 */
export interface DashboardDrillToAttributeUrlRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the attribute url that was resolved.
     */
    readonly drillDefinition: IDrillToAttributeUrl;
}

/**
 * This event is emitted on start of the resolution of the {@link DrillToAttributeUrl} command.
 *
 * @alpha
 */
export interface DashboardDrillToAttributeUrlRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.REQUESTED";
    readonly payload: DashboardDrillToAttributeUrlRequestedPayload;
}

/**
 * @alpha
 */
export function drillToAttributeUrlRequested(
    ctx: DashboardContext,
    drillDefinition: IDrillToAttributeUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToAttributeUrlRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToAttributeUrlRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToAttributeUrlRequested = eventGuard<DashboardDrillToAttributeUrlRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.REQUESTED",
);

/**
 * Payload of the {@link DashboardDrillToAttributeUrlResolved} event.
 * @alpha
 */
export interface DashboardDrillToAttributeUrlResolvedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the attribute url that was resolved.
     */
    readonly drillDefinition: IDrillToAttributeUrl;
    /**
     * Resolved attribute url.
     */
    readonly url: string;
    /**
     * Information about filters used on the dashboard.
     */
    readonly filtersInfo: FiltersInfo;
    /**
     * drill is implicit generated on the fly base on metadata model or configured by user
     */
    readonly isImplicit: boolean;
}

/**
 * This event is emitted as a result of the {@link DrillToAttributeUrl} command.
 * It contains resolved attribute url from the drill definition.
 *
 * @alpha
 */
export interface DashboardDrillToAttributeUrlResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED";
    readonly payload: DashboardDrillToAttributeUrlResolvedPayload;
}

/**
 * @alpha
 */
export function drillToAttributeUrlResolved(
    ctx: DashboardContext,
    url: string,
    drillDefinition: IDrillToAttributeUrl,
    drillEvent: IDashboardDrillEvent,
    filtersInfo: FiltersInfo,
    isImplicit: boolean,
    correlationId?: string,
): DashboardDrillToAttributeUrlResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
            url,
            filtersInfo,
            isImplicit,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToAttributeUrlResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToAttributeUrlResolved = eventGuard<DashboardDrillToAttributeUrlResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link DashboardDrillToLegacyDashboardRequested} event.
 * @alpha
 */
export interface DashboardDrillToLegacyDashboardRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the drill information.
     */
    readonly drillDefinition: IDrillToLegacyDashboard;
}

/**
 * This event is emitted on start of the resolution of the {@link DrillToLegacyDashboard} command.
 *
 * @alpha
 */
export interface DashboardDrillToLegacyDashboardRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.REQUESTED";
    readonly payload: DashboardDrillToLegacyDashboardRequestedPayload;
}

/**
 * @alpha
 */
export function drillToLegacyDashboardRequested(
    ctx: DashboardContext,
    drillDefinition: IDrillToLegacyDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToLegacyDashboardRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToLegacyDashboardRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToLegacyDashboardRequested =
    eventGuard<DashboardDrillToLegacyDashboardRequested>(
        "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.REQUESTED",
    );

/**
 * Payload of the {@link DashboardDrillToLegacyDashboardResolved} event.
 * @alpha
 */
export interface DashboardDrillToLegacyDashboardResolvedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the drill information.
     */
    readonly drillDefinition: IDrillToLegacyDashboard;
}

/**
 * This event is emitted as a result of the {@link DrillToLegacyDashboard} command.
 *
 * Drill to legacy dashboard can be configured for Kpi widgets only.
 *
 * @alpha
 */
export interface DashboardDrillToLegacyDashboardResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED";
    readonly payload: DashboardDrillToLegacyDashboardResolvedPayload;
}

/**
 * @alpha
 */
export function drillToLegacyDashboardResolved(
    ctx: DashboardContext,
    drillDefinition: IDrillToLegacyDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToLegacyDashboardResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillToLegacyDashboardResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToLegacyDashboardResolved = eventGuard<DashboardDrillToLegacyDashboardResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link DashboardDrillableItemsChanged} event.
 * @alpha
 */
export interface DashboardDrillableItemsChangedPayload {
    /**
     * Drillable items that was set.
     */
    readonly drillableItems: ExplicitDrill[];
}

/**
 * This event is emitted as a result of the {@link ChangeDrillableItems} command, if drillable items was successfully changed.
 *
 * @alpha
 */
export interface DashboardDrillableItemsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILLABLE_ITEMS.CHANGED";
    readonly payload: DashboardDrillableItemsChangedPayload;
}

/**
 * @alpha
 */
export function drillableItemsChanged(
    ctx: DashboardContext,
    drillableItems: ExplicitDrill[],
    correlationId?: string,
): DashboardDrillableItemsChanged {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILLABLE_ITEMS.CHANGED",
        ctx,
        correlationId,
        payload: {
            drillableItems,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDrillableItemsChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillableItemsChanged = eventGuard<DashboardDrillableItemsChanged>(
    "GDC.DASH/EVT.DRILL.DRILLABLE_ITEMS.CHANGED",
);
