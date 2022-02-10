// (C) 2021-2022 GoodData Corporation

import { IDashboardCommand } from "./base";
import { isObjRef, ObjRef, ObjRefInScope, VisualizationProperties } from "@gooddata/sdk-model";
import { FilterOpReplaceAll, WidgetFilterOperation, WidgetHeader } from "../types/widgetTypes";
import { InsightDrillDefinition } from "@gooddata/sdk-backend-spi";
import { IExportConfig } from "../types/exportTypes";

/**
 * Payload of the {@link ChangeInsightWidgetHeader} command.
 * @alpha
 */
export interface ChangeInsightWidgetHeaderPayload {
    /**
     * Reference to Insight Widget whose header to change.
     */
    readonly ref: ObjRef;

    /**
     * Header to use for the Insight widget. Contents of the provided header will be used as-is and will be
     * used to replace the current header values.
     */
    readonly header: WidgetHeader;
}

/**
 * @alpha
 */
export interface ChangeInsightWidgetHeader extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER";
    readonly payload: ChangeInsightWidgetHeaderPayload;
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
 * Payload of the {@link ChangeInsightWidgetFilterSettings} command.
 * @alpha
 */
export interface ChangeInsightWidgetFilterSettingsPayload {
    /**
     * Reference to Insight Widget whose filter settings to change.
     */
    readonly ref: ObjRef;

    /**
     * Filter operation to apply.
     */
    readonly operation: WidgetFilterOperation;
}

/**
 * @alpha
 */
export interface ChangeInsightWidgetFilterSettings extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS";
    readonly payload: ChangeInsightWidgetFilterSettingsPayload;
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpReplaceAll} operation.
 *
 * Dispatching this command will result in replacement of Insight widget's filter settings; this includes change of
 * data set used for date filter, disabling date filtering, ignoring attribute filters that are defined on the dashboard for the widget.
 *
 * @param ref - reference of the insight widget to modify
 * @param settings - new filter settings to apply
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function replaceInsightWidgetFilterSettings(
    ref: ObjRef,
    settings: Omit<FilterOpReplaceAll, "type">,
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "replace",
                ...settings,
            },
        },
    };
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpEnableDateFilter} operation.
 *
 * Dispatching this command will result in change of Insight widget's date filter setting. The date filtering will
 * be enabled and the provided date data set will be used for date-filtering widget's insight.
 *
 * @param ref - reference of the insight widget to modify
 * @param dateDataset - date data set to use for filtering the insight
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function enableInsightWidgetDateFilter(
    ref: ObjRef,
    dateDataset: ObjRef,
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "enableDateFilter",
                dateDataset,
            },
        },
    };
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpDisableDateFilter} operation.
 *
 * Dispatching this command will result in change of Insight widget's date filter setting. The date filtering will
 * be disabled.
 *
 * @param ref - reference of the insight widget to modify
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function disableInsightWidgetDateFilter(
    ref: ObjRef,
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "disableDateFilter",
            },
        },
    };
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpReplaceAttributeIgnores} operation.
 *
 * Dispatching this command will result in replacement of Insight widget's attribute filter ignore-list. Those attribute filters
 * that use the provided displayForms for filtering will be ignored by the widget.
 *
 * @param ref - reference of the insight widget to modify
 * @param displayForms - refs of display forms used by attribute filters that should be ignored
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function replaceInsightWidgetIgnoredFilters(
    ref: ObjRef,
    displayForms?: ObjRef[],
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "replaceAttributeIgnores",
                displayFormRefs: displayForms ?? [],
            },
        },
    };
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpIgnoreAttributeFilter} operation.
 *
 * Dispatching this command will result in addition of one or more filters into Insight widget's attribute filter ignore-list.
 * Those attribute filters that use the provided displayForms for filtering will be ignored by the widget on top of any
 * other filters that are already ignored.
 *
 * Ignored attribute filters are not passed down to the insight and will not be used to filter that insight.
 *
 * The operation is idempotent - trying to ignore an attribute filter multiple times will have no effect.
 *
 * @param ref - reference of the insight widget to modify
 * @param oneOrMoreDisplayForms - one or more refs of display forms used by attribute filters that should be added to the ignore-list
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function ignoreFilterOnInsightWidget(
    ref: ObjRef,
    oneOrMoreDisplayForms: ObjRef | ObjRef[],
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    const displayFormRefs = isObjRef(oneOrMoreDisplayForms) ? [oneOrMoreDisplayForms] : oneOrMoreDisplayForms;

    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "ignoreAttributeFilter",
                displayFormRefs,
            },
        },
    };
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpUnignoreAttributeFilter} operation.
 *
 * Dispatching this command will result in removal of one or more filters from Insight widget's attribute filter ignore-list.
 * Ignored attribute filters are not passed down to the insight and will not be used to filter that insight.
 *
 * The operation is idempotent - trying to unignore an attribute filter multiple times will have no effect.
 *
 * @param ref - reference of the insight widget to modify
 * @param oneOrMoreDisplayForms - one or more refs of display forms used by attribute filters that should be removed from the ignore-list
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function unignoreFilterOnInsightWidget(
    ref: ObjRef,
    oneOrMoreDisplayForms: ObjRef | ObjRef[],
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    const displayFormRefs = isObjRef(oneOrMoreDisplayForms) ? [oneOrMoreDisplayForms] : oneOrMoreDisplayForms;

    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "unignoreAttributeFilter",
                displayFormRefs,
            },
        },
    };
}

//
//
//

/**
 * Payload of the {@link ChangeInsightWidgetVisProperties} command.
 * @alpha
 */
export interface ChangeInsightWidgetVisPropertiesPayload {
    /**
     * Reference to Insight Widget whose visualization properties to change.
     */
    readonly ref: ObjRef;

    /**
     * Visualization properties to use for the insight that is rendered by the widget.
     *
     * These will replace the existing visualization properties. To clear any widget-level properties
     * currently in effect for the widget, set the properties to `undefined`.
     */
    readonly properties: VisualizationProperties | undefined;
}

/**
 * @alpha
 */
export interface ChangeInsightWidgetVisProperties extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES";
    readonly payload: ChangeInsightWidgetVisPropertiesPayload;
}

/**
 *
 * Creates the ChangeInsightWidgetVisProperties command. Dispatching this command will result is modification
 * of the visualization properties that are effective for the particular insight widget.
 *
 * Through visualization properties, you can modify how particular visualization looks and behaves (enable/disable
 * tooltips, legend, change axes, enable zooming).
 *
 * If you want to clear any widget-level properties, set properties to `undefined`.
 *
 * @param ref - reference of the insight widget to modify
 * @param properties - new properties to set, undefined to clear any widget level visualization properties
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeInsightWidgetVisProperties(
    ref: ObjRef,
    properties: VisualizationProperties | undefined,
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
 * Payload of the {@link ChangeInsightWidgetInsight} command.
 * @alpha
 */
export interface ChangeInsightWidgetInsightPayload {
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
}

/**
 * XXX: don't think this is needed right away. should definitely allow such flexibility though. Would allow
 *  to switch between insights that are of different vis type but show same data.
 *
 * @alpha
 */
export interface ChangeInsightWidgetInsight extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT";
    readonly payload: ChangeInsightWidgetInsightPayload;
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
 * Payload of the {@link ModifyDrillsForInsightWidget} command.
 * @alpha
 */
export interface ModifyDrillsForInsightWidgetPayload {
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
}

/**
 * @alpha
 */
export interface ModifyDrillsForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS";
    readonly payload: ModifyDrillsForInsightWidgetPayload;
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
 * @param drills - drills to add or modify.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function modifyDrillsForInsightWidget(
    ref: ObjRef,
    drills: InsightDrillDefinition[],
    correlationId?: string,
): ModifyDrillsForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS",
        correlationId,
        payload: {
            ref,
            drills,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export type RemoveDrillsSelector = ObjRefInScope[] | "*";

/**
 * Type guard resolved all drill selector
 *
 * @alpha
 */
export function isAllDrillSelector(obj: RemoveDrillsSelector): obj is "*" {
    return obj === "*";
}

/**
 * Payload of the {@link RemoveDrillsForInsightWidget} command.
 * @alpha
 */
export interface RemoveDrillsForInsightWidgetPayload {
    /**
     * Reference to Insight Widget whose drill items should be removed.
     */
    readonly ref: ObjRef;

    /**
     * Specify measure or attribute localIdentifiers whose drills to remove or '*' to remove all defined drills.
     */
    readonly origins: RemoveDrillsSelector;
}

/**
 * @alpha
 */
export interface RemoveDrillsForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS";
    readonly payload: RemoveDrillsForInsightWidgetPayload;
}

/**
 * Creates the RemoveDrillsForInsightWidget command. Dispatching the created command will remove insight widget's
 * drill definition for the provided measure.
 *
 *
 * @param ref - reference of insight widget whose drill should be removed
 * @param origins - measure or attribute localIdentifiers whose drill definitions should be removed
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function removeDrillsForInsightWidget(
    ref: ObjRef,
    origins: RemoveDrillsSelector,
    correlationId?: string,
): RemoveDrillsForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS",
        correlationId,
        payload: {
            ref,
            origins,
        },
    };
}

//
//
//

/**
 * Payload of the {@link RefreshInsightWidget} command.
 * @alpha
 */
export interface RefreshInsightWidgetPayload {
    /**
     * Reference to Insight Widget to refresh.
     */
    readonly ref: ObjRef;
}

/**
 * @alpha
 */
export interface RefreshInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH";
    readonly payload: RefreshInsightWidgetPayload;
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

//
//
//

/**
 * Payload of the {@link ExportInsightWidget} command.
 * @alpha
 */
export interface ExportInsightWidgetPayload {
    /**
     * Reference to Insight Widget to export.
     */
    readonly ref: ObjRef;
    /**
     * Options for the export.
     */
    readonly config: IExportConfig;
}

/**
 * @alpha
 */
export interface ExportInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT";
    readonly payload: ExportInsightWidgetPayload;
}

/**
 * Creates the ExportInsightWidget command. Dispatching this command will result in exporting of the widget to a CSV of XLSX file.
 *
 * @param ref - reference to the Insight widget to refresh
 * @param config - configuration of the export operation
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function exportInsightWidget(
    ref: ObjRef,
    config: IExportConfig,
    correlationId?: string,
): ExportInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT",
        correlationId,
        payload: {
            config,
            ref,
        },
    };
}
