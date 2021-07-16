// (C) 2021 GoodData Corporation

import { IDashboardCommand } from "./base";
import { ObjRef, VisualizationProperties } from "@gooddata/sdk-model";
import { WidgetFilterSettings, WidgetHeader } from "../types/widgetTypes";
import { InsightDrillDefinition } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export interface ChangeInsightWidgetHeader extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER";
    readonly payload: {
        /**
         * Reference to Insight Widget whose header to change.
         */
        readonly ref: ObjRef;

        /**
         * Header to use for the Insight widget. Contents of the provided header will be used as-is and will be
         * used to replace the current header values.
         */
        readonly header: WidgetHeader;
    };
}

/**
 * Creates the ChangeInsightWidgetHeader command. Dispatching this command will result in change of the Insight widget's
 * header which (now) includes title.
 *
 * @param ref - reference of the insight widget to modify
 * @param header - new header to use
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeInsightWidgetHeader(
    ref: ObjRef,
    header: WidgetHeader,
    correlationId?: string,
): ChangeInsightWidgetHeader {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER",
        correlationId,
        payload: {
            ref,
            header,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface ChangeInsightWidgetFilterSettings extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS";
    readonly payload: {
        /**
         * Reference to Insight Widget whose filter settings to change.
         */
        readonly ref: ObjRef;

        /**
         * Filter settings to apply for the widget. The settings are used as-is and
         * replace current widget settings.
         */
        readonly settings: WidgetFilterSettings;
    };
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command. Dispatching this command will result in change of Insight widget's
 * filter settings; this includes change of data set used for date filter, disabling date filtering, ignoring
 * attribute filters that are defined on the dashboard for the widget.
 *
 * @param ref - reference of the insight widget to modify
 * @param settings - new filter settings to apply
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeInsightWidgetFilterSettings(
    ref: ObjRef,
    settings: WidgetFilterSettings,
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            settings,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface ChangeInsightWidgetVisProperties extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES";
    readonly payload: {
        /**
         * Reference to Insight Widget whose visualization properties to change.
         */
        readonly ref: ObjRef;

        /**
         * Visualization properties to use for the insight that is rendered by the widget.
         *
         * These will replace the existing visualization properties.
         */
        readonly properties: VisualizationProperties;
    };
}

/**
 *
 * Creates the ChangeInsightWidgetVisProperties command. Dispatching this command will result is modification
 * of the visualization properties that are effective for the particular insight widget.
 *
 * Through visualization properties, you can modify how particular visualization looks and behaves (enable/disable
 * tooltips, legend, change axes, enable zooming)
 *
 * @param ref - reference of the insight widget to modify
 * @param properties - new properties to set
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeInsightWidgetVisProperties(
    ref: ObjRef,
    properties: VisualizationProperties,
    correlationId?: string,
): ChangeInsightWidgetVisProperties {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES",
        correlationId,
        payload: {
            ref,
            properties,
        },
    };
}

//
//
//

/**
 * XXX: don't think this is needed right away. should definitely allow such flexibility though. Would allow
 *  to switch between insights that are of different vis type but show same data.
 *
 * @alpha
 */
export interface ChangeInsightWidgetInsight extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT";
    readonly payload: {
        /**
         * Reference to Insight Widget whose insight to change.
         */
        readonly ref: ObjRef;

        /**
         * Reference to the new insight to use inside the widget.
         */
        readonly insightRef: ObjRef;

        /**
         * Optionally specify new visualization properties to use for the insight. If none specified,
         * the properties already included in the widget will be used.
         *
         * Note: if you don't want to use any custom visualization properties for the new insight, then
         * pass empty object.
         */
        readonly visualizationProperties?: VisualizationProperties;
    };
}

/**
 * Creates the ChangeInsightWidgetInsight command. Dispatching this command will result in change of what
 * insight is rendered inside particular insight widget - while keeping all the other setup the same (filtering,
 * drilling).
 *
 * @param ref - reference to insight widget whose insight should be changed
 * @param insightRef - reference to the new insight to use in the widget
 * @param visualizationProperties - optionally specify visualization properties to use. Undefined value means keeping the existing properties on record in the widget
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeInsightWidgetInsight(
    ref: ObjRef,
    insightRef: ObjRef,
    visualizationProperties?: VisualizationProperties,
    correlationId?: string,
): ChangeInsightWidgetInsight {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT",
        correlationId,
        payload: {
            ref,
            insightRef,
            visualizationProperties,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface ModifyDrillsForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS";
    readonly payload: {
        /**
         * Reference to Insight Widget whose drill items should be modified.
         */
        readonly ref: ObjRef;

        /**
         * New drill definitions. The drills are defined per measure in insight and there can
         * be exactly one drill definition for insight measure.
         *
         * The newly provided items will be matches to existing items by the measure they are linked to. The
         * definition of drill for that measure will be modified.
         *
         * Note: this can do upsert. if you specify drill for a measure and there is no existing drill for it,
         * then the new definition will be used.
         */
        readonly drills: InsightDrillDefinition[];
    };
}

/**
 * Creates the ModifyDrillsForInsightWidget command. Dispatching the created command will add or modify a new drill for
 * the insight widget.
 *
 * Drill can be setup for particular measure - meaning elements in the insight will be clickable. Exactly one drill
 * can be specified for a measure.
 *
 * What happens on click depends on the context in which the dashboard lives:
 *
 * -  When in KPI Dashboard (embedded or not) the defined action is actually triggered and done - it may open a new tab,
 *    open overlay with insight, navigate to a new dashboard and carry over the filters.
 * -  When the dashboard is embedded using Dashboard component, an event will be emitted describing the defined
 *    drill action.
 *
 * @param ref - reference to insight widget whose drills should be modified
 * @param drill - drill to add or modify.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function modifyDrillForInsightWidget(
    ref: ObjRef,
    drill: InsightDrillDefinition,
    correlationId?: string,
): ModifyDrillsForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS",
        correlationId,
        payload: {
            ref,
            drills: [drill],
        },
    };
}

//
//
//

/**
 * @alpha
 */
export type RemoveDrillsSelector = ObjRef[] | "*";

/**
 * @alpha
 */
export interface RemoveDrillsForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS";
    readonly payload: {
        /**
         * Reference to Insight Widget whose drill items should be removed.
         */
        readonly ref: ObjRef;

        /**
         * Specify measures whose drills to remove or '*' to remove all defined drills.
         */
        readonly measures?: RemoveDrillsSelector;
    };
}

/**
 * Creates the RemoveDrillsForInsightWidget command. Dispatching the created command will remove insight widget's
 * drill definition for the provided measure.
 *
 *
 * @param ref - reference of insight widget whose drill should be removed
 * @param measure - measure whose drill definition should be removed
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function removeDrillForInsightWidget(
    ref: ObjRef,
    measure: ObjRef,
    correlationId?: string,
): RemoveDrillsForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS",
        correlationId,
        payload: {
            ref,
            measures: [measure],
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface RefreshInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH";
    readonly payload: {
        /**
         * Reference to Insight Widget to refresh.
         */
        readonly ref: ObjRef;
    };
}

/**
 * Creates the RefreshInsightWidget command. Dispatching this command will result in re-calculation of the widget's
 * insight and re-render.
 *
 * @param ref - reference to the Insight widget to refresh
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function refreshInsightWidget(ref: ObjRef, correlationId?: string): RefreshInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH",
        correlationId,
        payload: {
            ref,
        },
    };
}
