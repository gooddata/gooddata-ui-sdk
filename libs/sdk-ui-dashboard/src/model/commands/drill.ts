// (C) 2021-2022 GoodData Corporation
import { IDashboardCommand } from "./base.js";
import {
    IInsight,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToLegacyDashboard,
    ICrossFiltering,
} from "@gooddata/sdk-model";
import { ExplicitDrill } from "@gooddata/sdk-ui";
import { DashboardDrillContext, IDashboardDrillEvent, IDrillDownDefinition } from "../../types.js";

/**
 * Payload of the {@link Drill} command.
 * @alpha
 */
export interface DrillPayload {
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
 * @alpha
 */
export interface Drill extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL";
    readonly payload: DrillPayload;
}

/**
 * Creates the {@link Drill} command.
 * Dispatching this command will result into dispatching {@link DashboardDrillResolved} event.
 *
 * This is general dashboard drill command with details about all possible more granular drill interactions that can follow.
 * Reason for this general drill command is that it may happen that multiple drill interactions are possible for one drill event.
 *
 * Example: some attribute on the insight has drill down set and also widget has drill to insight set. Then this command must be dispatched with both
 * {@link @gooddata/sdk-ui-ext#IDrillDownDefinition} and {@link @gooddata/sdk-backend-spi#IDrillToInsight} definitions.
 *
 * - This must be always the first command that occurs after the drill interaction and must be dispatched before more granular drill commands.
 * - Specific drill commands that can follow this general drill command are: {@link DrillDown}, {@link DrillToInsight}, {@link DrillToDashboard},
 *   {@link DrillToCustomUrl}, {@link DrillToAttributeUrl}, {@link DrillToLegacyDashboard}
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
    drillContext: DashboardDrillContext,
    correlationId?: string,
): Drill {
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
 * Payload of the {@link DrillDown} command.
 * @alpha
 */
export interface DrillDownPayload {
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
export interface DrillDown extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_DOWN";
    readonly payload: DrillDownPayload;
}

/**
 * Creates the {@link DrillDown} command.
 * Dispatching this command will result into applying drill down definition to the provided insight (result of the drill down application
 * depends on the particular visualization type) and dispatching {@link DashboardDrillDownResolved} event that will contain it.
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
): DrillDown {
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
 * Payload of the {@link DrillToInsight} command.
 * @alpha
 */
export interface DrillToInsightPayload {
    /**
     * Drill definition with the target insight.
     */
    readonly drillDefinition: IDrillToInsight;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface DrillToInsight extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT";
    readonly payload: DrillToInsightPayload;
}

/**
 * Creates the {@link DrillToInsight} command.
 * Dispatching this command will result into applying the drill intersection filters to the target insight
 * and dispatching {@link DashboardDrillToInsightResolved} event that will contain it.
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
    drillDefinition: IDrillToInsight,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToInsight {
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
 * Payload of the {@link DrillToDashboard} command.
 * @alpha
 */
export interface DrillToDashboardPayload {
    /**
     * Drill definition with the target dashboard.
     */
    readonly drillDefinition: IDrillToDashboard;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface DrillToDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD";
    readonly payload: DrillToDashboardPayload;
}

/**
 * Creates the {@link DrillToDashboard} command.
 * Dispatching this command will result into getting the drill intersection filters that can be applied to the target dashboard
 * and dispatching {@link DashboardDrillToDashboardResolved} event that will contain them.
 *
 * @alpha
 * @param drillDefinition - drill definition with the target dashboard.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns drill to dashboard command
 */
export function drillToDashboard(
    drillDefinition: IDrillToDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToDashboard {
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
 * Payload of the {@link DrillToCustomUrl} command.
 * @alpha
 */
export interface DrillToCustomUrlPayload {
    /**
     * Drill definition with the custom url to resolve.
     */
    readonly drillDefinition: IDrillToCustomUrl;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface DrillToCustomUrl extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL";
    readonly payload: DrillToCustomUrlPayload;
}

/**
 * Creates the {@link DrillToCustomUrl} command.
 * Dispatching this command will result into resolving the target url
 * and dispatching {@link DashboardDrillToCustomUrlResolved} event that will contain it.
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
    drillDefinition: IDrillToCustomUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToCustomUrl {
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
 * Payload of the {@link DrillToAttributeUrl} command.
 * @alpha
 */
export interface DrillToAttributeUrlPayload {
    /**
     * Drill definition with the attribute url to resolve.
     */
    readonly drillDefinition: IDrillToAttributeUrl;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface DrillToAttributeUrl extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL";
    readonly payload: DrillToAttributeUrlPayload;
}

/**
 * Creates the {@link DrillToAttributeUrl} command.
 * Dispatching this command will result into resolving the target attribute url
 * and dispatching {@link DashboardDrillToAttributeUrlResolved} event that will contain it.
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
    drillDefinition: IDrillToAttributeUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToAttributeUrl {
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
 * Payload of the {@link DrillToLegacyDashboard} command.
 * @alpha
 */
export interface DrillToLegacyDashboardPayload {
    /**
     * Drill definition with the target dashboard.
     */
    readonly drillDefinition: IDrillToLegacyDashboard;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface DrillToLegacyDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD";
    readonly payload: DrillToLegacyDashboardPayload;
}

/**
 * Creates the {@link DrillToLegacyDashboard} command.
 * Dispatching this command will result into dispatching {@link DashboardDrillToLegacyDashboardResolved} event.
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
    drillDefinition: IDrillToLegacyDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToLegacyDashboard {
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
 * Payload of the {@link ChangeDrillableItems} command.
 * @alpha
 */
export interface ChangeDrillableItemsPayload {
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
export interface ChangeDrillableItems extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILLABLE_ITEMS.CHANGE";
    readonly payload: ChangeDrillableItemsPayload;
}

/**
 * Creates the {@link ChangeDrillableItems} command.
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
): ChangeDrillableItems {
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
 * Payload of the {@link CrossFiltering} command.
 * @alpha
 */
export interface CrossFilteringPayload {
    /**
     * Insight from which the cross-filtering is coming.
     */
    readonly insight: IInsight;
    /**
     * Cross-filtering definition to apply.
     */
    readonly drillDefinition: ICrossFiltering;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
}

/**
 * @alpha
 */
export interface CrossFiltering extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.CROSS_FILTERING";
    readonly payload: CrossFilteringPayload;
}

/**
 * Creates the {@link CrossFiltering} command.
 * Dispatching this command will result into applying intersection attribute filters to the dashboard and insight will ignore these filters further
 * Eventually a {@link DashboardCrossFilteringResolved} event will be dispatched at the end.
 *
 * @alpha
 * @param insight - insight from which the cross filtering is coming.
 * @param drillDefinition - drill definition to apply.
 * @param drillEvent - original drill event, that triggered this particular drill interaction.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns cross filtering command
 */
export function crossFiltering(
    insight: IInsight,
    drillDefinition: ICrossFiltering,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): CrossFiltering {
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
 * @alpha
 */
export type DashboardDrillCommand =
    | Drill
    | DrillDown
    | DrillToAttributeUrl
    | DrillToCustomUrl
    | DrillToDashboard
    | DrillToInsight
    | DrillToLegacyDashboard
    | CrossFiltering;
