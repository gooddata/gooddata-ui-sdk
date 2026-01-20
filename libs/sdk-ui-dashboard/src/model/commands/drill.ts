// (C) 2021-2026 GoodData Corporation

import {
    type FilterContextItem,
    type ICrossFiltering as ICrossFilteringModel,
    type IDrillToAttributeUrl as IDrillToAttributeUrlModel,
    type IDrillToCustomUrl as IDrillToCustomUrlModel,
    type IDrillToDashboard as IDrillToDashboardModel,
    type IDrillToInsight as IDrillToInsightModel,
    type IDrillToLegacyDashboard as IDrillToLegacyDashboardModel,
    type IInsight,
    type IKeyDriveAnalysis,
} from "@gooddata/sdk-model";
import { type ExplicitDrill } from "@gooddata/sdk-ui";

import { type IDashboardCommand } from "./base.js";
import {
    type IDashboardDrillContext,
    type IDashboardDrillEvent,
    type IDrillDownDefinition,
} from "../../types.js";
import { type IDashboardKeyDriverCombinationItem } from "../events/drill.js";

/**
 * Payload of the {@link IDrill} command.
 * @alpha
 */
export interface IDrillPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Context in which the drill interaction was triggered (widget and insight details - if available).
     */
    readonly drillContext: IDashboardDrillContext;
}

/**
 * @alpha
 */
export interface IDrill extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL";
    readonly payload: IDrillPayload;
}

/**
 * Creates the {@link IDrill} command.
 * Dispatching this command will result into dispatching {@link IDashboardDrillResolved} event.
 *
 * This is general dashboard drill command with details about all possible more granular drill interactions that can follow.
 * Reason for this general drill command is that it may happen that multiple drill interactions are possible for one drill event.
 *
 * Example: some attribute on the insight has drill down set and also widget has drill to insight set. Then this command must be dispatched with both
 * {@link @gooddata/sdk-ui-ext#IDrillDownDefinition} and {@link @gooddata/sdk-backend-spi#IDrillToInsight} definitions.
 *
 * - This must be always the first command that occurs after the drill interaction and must be dispatched before more granular drill commands.
 * - Specific drill commands that can follow this general drill command are: {@link IDrillDown}, {@link IDrillToInsight}, {@link IDrillToDashboard},
 *   {@link IDrillToCustomUrl}, {@link IDrillToAttributeUrl}, {@link IDrillToLegacyDashboard}
 *
 *
 * @alpha
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param drillContext - context in which the drill interaction was triggered (widget and insight details - if available).
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns drill command
 */
export function drill(
    drillEvent: IDashboardDrillEvent,
    drillContext: IDashboardDrillContext,
    correlationId?: string,
): IDrill {
    return {
        type: "GDC.DASH/CMD.DRILL",
        correlationId,
        payload: {
            drillEvent,
            drillContext,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IDrillDown} command.
 * @alpha
 */
export interface IDrillDownPayload {
    /**
     * Insight to which the drill down should be applied.
     */
    readonly insight: IInsight;
    /**
     * Drill down definition to apply.
     */
    readonly drillDefinition: IDrillDownDefinition;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface IDrillDown extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_DOWN";
    readonly payload: IDrillDownPayload;
}

/**
 * Creates the {@link IDrillDown} command.
 * Dispatching this command will result into applying drill down definition to the provided insight (result of the drill down application
 * depends on the particular visualization type) and dispatching {@link IDashboardDrillDownResolved} event that will contain it.
 *
 * In the default dashboard implementation dispatching this command will also result into opening drill dialog with the insight
 * that has this particular drill down definition applied.
 *
 * @alpha
 * @param insight - insight to which the drill down should be applied.
 * @param drillDefinition - drill definition to apply.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns drill down command
 */
export function drillDown(
    insight: IInsight,
    drillDefinition: IDrillDownDefinition,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDrillDown {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_DOWN",
        correlationId,
        payload: {
            insight,
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IDrillToInsight} command.
 * @alpha
 */
export interface IDrillToInsightPayload {
    /**
     * Drill definition with the target insight.
     */
    readonly drillDefinition: IDrillToInsightModel;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface IDrillToInsight extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT";
    readonly payload: IDrillToInsightPayload;
}

/**
 * Creates the {@link IDrillToInsight} command.
 * Dispatching this command will result into applying the drill intersection filters to the target insight
 * and dispatching {@link IDashboardDrillToInsightResolved} event that will contain it.
 *
 * In the default dashboard implementation this command will also result into opening the drill dialog with the target insight
 * that has the drill intersection filters applied.
 *
 * @alpha
 * @param drillDefinition - drill definition with the target insight.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns drill to insight command
 */
export function drillToInsight(
    drillDefinition: IDrillToInsightModel,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDrillToInsight {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IDrillToDashboard} command.
 * @alpha
 */
export interface IDrillToDashboardPayload {
    /**
     * Drill definition with the target dashboard.
     */
    readonly drillDefinition: IDrillToDashboardModel;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface IDrillToDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD";
    readonly payload: IDrillToDashboardPayload;
}

/**
 * Creates the {@link IDrillToDashboard} command.
 * Dispatching this command will result into getting the drill intersection filters that can be applied to the target dashboard
 * and dispatching {@link IDashboardDrillToDashboardResolved} event that will contain them.
 *
 * @alpha
 * @param drillDefinition - drill definition with the target dashboard.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns drill to dashboard command
 */
export function drillToDashboard(
    drillDefinition: IDrillToDashboardModel,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDrillToDashboard {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IDrillToCustomUrl} command.
 * @alpha
 */
export interface IDrillToCustomUrlPayload {
    /**
     * Drill definition with the custom url to resolve.
     */
    readonly drillDefinition: IDrillToCustomUrlModel;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface IDrillToCustomUrl extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL";
    readonly payload: IDrillToCustomUrlPayload;
}

/**
 * Creates the {@link IDrillToCustomUrl} command.
 * Dispatching this command will result into resolving the target url
 * and dispatching {@link IDashboardDrillToCustomUrlResolved} event that will contain it.
 *
 * Custom url can contain various identifier or attribute title placeholders, see:
 * {@link https://help.gooddata.com/pages/viewpage.action?pageId=86794855}
 *
 * @alpha
 * @param drillDefinition - drill definition with the target url to resolve.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns drill to custom url command
 * @alpha
 */
export function drillToCustomUrl(
    drillDefinition: IDrillToCustomUrlModel,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDrillToCustomUrl {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IDrillToAttributeUrl} command.
 * @alpha
 */
export interface IDrillToAttributeUrlPayload {
    /**
     * Drill definition with the attribute url to resolve.
     */
    readonly drillDefinition: IDrillToAttributeUrlModel;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface IDrillToAttributeUrl extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL";
    readonly payload: IDrillToAttributeUrlPayload;
}

/**
 * Creates the {@link IDrillToAttributeUrl} command.
 * Dispatching this command will result into resolving the target attribute url
 * and dispatching {@link IDashboardDrillToAttributeUrlResolved} event that will contain it.
 *
 * For more details, see: {@link https://help.gooddata.com/pages/viewpage.action?pageId=86794855}
 *
 * @alpha
 * @param drillDefinition - drill definition with the target attribute url to resolve.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns drill to attribute url command
 * @alpha
 */
export function drillToAttributeUrl(
    drillDefinition: IDrillToAttributeUrlModel,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDrillToAttributeUrl {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IDrillToLegacyDashboard} command.
 * @alpha
 */
export interface IDrillToLegacyDashboardPayload {
    /**
     * Drill definition with the target dashboard.
     */
    readonly drillDefinition: IDrillToLegacyDashboardModel;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface IDrillToLegacyDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD";
    readonly payload: IDrillToLegacyDashboardPayload;
}

/**
 * Creates the {@link IDrillToLegacyDashboard} command.
 * Dispatching this command will result into dispatching {@link IDashboardDrillToLegacyDashboardResolved} event.
 *
 * Drill to legacy dashboard can be configured for Kpi widgets only.
 *
 * @alpha
 * @param drillDefinition - drill definition with the target dashboard.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns drill to legacy dashboard command
 * @alpha
 */
export function drillToLegacyDashboard(
    drillDefinition: IDrillToLegacyDashboardModel,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDrillToLegacyDashboard {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IChangeDrillableItems} command.
 * @alpha
 */
export interface IChangeDrillableItemsPayload {
    /**
     * Additional items that can enable drilling of the widgets.
     * If the item (identifier/uri/predicate) matches attribute or measure in the widget, widget drilling will be enabled.
     *
     * @remarks
     * Note: These items has lower priority than the configured widget drills or drill down.
     *       You can disable configured widget drills and drill down by setting {@link DashboardConfig} disableDefaultDrills property to true.
     */
    readonly drillableItems: ExplicitDrill[];
}

/**
 * @alpha
 */
export interface IChangeDrillableItems extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILLABLE_ITEMS.CHANGE";
    readonly payload: IChangeDrillableItemsPayload;
}

/**
 * Creates the {@link IChangeDrillableItems} command.
 * Dispatching this command will result into enabling drilling of the widgets, if they match some of the drillable item definition/predicate.
 *
 * @alpha
 * @param drillableItems - reference to the drillable items or predicates that enables insight/kpi drilling.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns change drillable items command
 */
export function changeDrillableItems(
    drillableItems: ExplicitDrill[],
    correlationId?: string,
): IChangeDrillableItems {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILLABLE_ITEMS.CHANGE",
        correlationId,
        payload: {
            drillableItems,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ICrossFiltering} command.
 * @beta
 */
export interface ICrossFilteringPayload {
    /**
     * Insight from which the cross-filtering is coming.
     */
    readonly insight: IInsight;
    /**
     * Cross-filtering definition to apply.
     */
    readonly drillDefinition: ICrossFilteringModel;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @beta
 */
export interface ICrossFiltering extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.CROSS_FILTERING";
    readonly payload: ICrossFilteringPayload;
}

/**
 * Creates the {@link ICrossFiltering} command.
 * Dispatching this command will result into applying intersection attribute filters to the dashboard and insight will ignore these filters further
 * Eventually a {@link IDashboardCrossFilteringResolved} event will be dispatched at the end.
 *
 * @beta
 * @param insight - insight from which the cross filtering is coming.
 * @param drillDefinition - drill definition to apply.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns cross filtering command
 */
export function crossFiltering(
    insight: IInsight,
    drillDefinition: ICrossFilteringModel,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): ICrossFiltering {
    return {
        type: "GDC.DASH/CMD.DRILL.CROSS_FILTERING",
        correlationId,
        payload: {
            insight,
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IKeyDriverAnalysis} command.
 * @beta
 */
export interface IKeyDriverAnalysisPayload {
    /**
     * Key driver item to analyze.
     */
    readonly keyDriveItem: IDashboardKeyDriverCombinationItem;
    /**
     * Key driver analysis definition to apply.
     */
    readonly drillDefinition: IKeyDriveAnalysis;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Filters to apply.
     */
    readonly filters: FilterContextItem[];
}

/**
 * @beta
 */
export interface IKeyDriverAnalysis extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.KEY_DRIVER_ANALYSIS";
    readonly payload: IKeyDriverAnalysisPayload;
}

/**
 * Creates the {@link IKeyDriverAnalysis} command.
 * Dispatching this command will result into applying intersection attribute filters to the dashboard and insight will ignore these filters further
 * Eventually a {@link IDashboardKeyDriverAnalysisResolved} event will be dispatched at the end.
 *
 * @beta
 * @param drillDefinition - drill definition to apply.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param filters - filters to apply.
 * @param keyDriveItem - key driver item to analyze.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns cross filtering command
 */
export function keyDriverAnalysis(
    drillDefinition: IKeyDriveAnalysis,
    drillEvent: IDashboardDrillEvent,
    filters: FilterContextItem[],
    keyDriveItem: IDashboardKeyDriverCombinationItem,
    correlationId?: string,
): IKeyDriverAnalysis {
    return {
        type: "GDC.DASH/CMD.DRILL.KEY_DRIVER_ANALYSIS",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
            keyDriveItem,
            filters,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export type DashboardDrillCommand =
    | IDrill
    | IDrillDown
    | IDrillToAttributeUrl
    | IDrillToCustomUrl
    | IDrillToDashboard
    | IDrillToInsight
    | IDrillToLegacyDashboard
    | ICrossFiltering
    | IKeyDriverAnalysis;
