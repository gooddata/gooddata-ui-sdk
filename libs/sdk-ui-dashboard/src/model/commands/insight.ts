// (C) 2021-2025 GoodData Corporation

import { IDashboardCommand } from "./base.js";
import {
    isObjRef,
    ObjRef,
    LocalIdRef,
    VisualizationProperties,
    InsightDrillDefinition,
    IInsightWidgetConfiguration,
    IDrillDownReference,
    IInsightWidget,
    IInsight,
} from "@gooddata/sdk-model";
import {
    FilterOpReplaceAll,
    WidgetFilterOperation,
    WidgetHeader,
    WidgetDescription,
} from "../types/widgetTypes.js";
import { IExportConfig } from "../types/exportTypes.js";

/**
 * Payload of the {@link ChangeInsightWidgetHeader} command.
 * @beta
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
 * @beta
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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
 * @beta
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
 * @beta
 */
export interface ChangeInsightWidgetFilterSettings extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS";
    readonly payload: ChangeInsightWidgetFilterSettingsPayload;
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpReplaceAll} operation.
 *
 * Dispatching this command will result in replacement of Insight widget's filter settings; this includes change of
 * data set used for common date filter, disabling common date filtering, ignoring attribute/date filters that are defined on the dashboard for the widget.
 *
 * @param ref - reference of the insight widget to modify
 * @param settings - new filter settings to apply
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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
 * @param dateDataset - date data set to use for filtering the insight, if "default" is provided, the default date dataset will be resolved and used
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function enableInsightWidgetDateFilter(
    ref: ObjRef,
    dateDataset: ObjRef | "default",
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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
 * @beta
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
 * @beta
 */
export interface ChangeInsightWidgetVisProperties extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES";
    readonly payload: ChangeInsightWidgetVisPropertiesPayload;
}

/**
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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
 * Payload of the {@link ChangeInsightWidgetVisConfiguration} command.
 * @public
 */
export interface ChangeInsightWidgetVisConfigurationPayload {
    /**
     * Reference to Insight Widget whose visualization configuration to change.
     */
    readonly ref: ObjRef;

    /**
     * Visualization configuration to use for the insight that is rendered by the widget.
     *
     * These will replace the existing visualization configuration. To clear any widget-level configuration
     * currently in effect for the widget, set the configuration to `undefined`.
     */
    readonly config: IInsightWidgetConfiguration | undefined;
}

/**
 * @public
 */
export interface ChangeInsightWidgetVisConfiguration extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_CONFIGURATION";
    readonly payload: ChangeInsightWidgetVisConfigurationPayload;
}

/**
 *
 * Creates the ChangeInsightWidgetVisConfiguration command. Dispatching this command will result is modification
 * of the visualization configuration that are effective for the particular insight widget.
 *
 * Through visualization configuration, you can modify how particular visualization behaves
 *
 * If you want to clear any widget-level configuration, set config to `undefined`.
 *
 * @param ref - reference of the insight widget to modify
 * @param config - new configuration to set, undefined to clear any widget level visualization config
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function changeInsightWidgetVisConfiguration(
    ref: ObjRef,
    config: IInsightWidgetConfiguration | undefined,
    correlationId?: string,
): ChangeInsightWidgetVisConfiguration {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_CONFIGURATION",
        correlationId,
        payload: {
            ref,
            config,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ChangeInsightWidgetInsight} command.
 * @beta
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
     * Specify new visualization properties to use for the insight. If none specified,
     * the properties already included in the widget will be used.
     *
     * @remarks
     * Note: if you don't want to use any custom visualization properties for the new insight, then
     * pass empty object.
     */
    readonly visualizationProperties?: VisualizationProperties;
}

/**
 * XXX: don't think this is needed right away. should definitely allow such flexibility though. Would allow
 *  to switch between insights that are of different vis type but show same data.
 *
 * @beta
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
 * @param visualizationProperties - specify visualization properties to use. Undefined value means keeping the existing properties on record in the widget
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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
 * @beta
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

    /**
     * Specify which drill down localIdentifier and its hierarchy should be removed.
     */
    readonly blacklistHierarchiesToUpdate?: IDrillDownReference[];
}

/**
 * @beta
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function modifyDrillsForInsightWidget(
    ref: ObjRef,
    drills: InsightDrillDefinition[],
    blacklistHierarchiesToUpdate?: IDrillDownReference[],
    correlationId?: string,
): ModifyDrillsForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS",
        correlationId,
        payload: {
            ref,
            drills,
            blacklistHierarchiesToUpdate,
        },
    };
}

/**
 * @beta
 */
export interface AttributeHierarchyModified extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ATTRIBUTE_HIERARCHY_MODIFIED";
}

/**
 * Creates the AttributeHierarchyModified command , dispatching this command will result on reset of catalog.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function attributeHierarchyModified(correlationId?: string): AttributeHierarchyModified {
    return {
        type: "GDC.DASH/CMD.ATTRIBUTE_HIERARCHY_MODIFIED",
        correlationId,
    };
}

//
//
//

/**
 * @beta
 */
export type RemoveDrillsSelector = LocalIdRef[] | "*";

/**
 * Type guard resolved all drill selector
 *
 * @beta
 */
export function isAllDrillSelector(obj: RemoveDrillsSelector): obj is "*" {
    return obj === "*";
}

/**
 * Payload of the {@link RemoveDrillsForInsightWidget} command.
 * @beta
 */
export interface RemoveDrillsForInsightWidgetPayload {
    /**
     * Reference to Insight Widget whose drill items should be removed.
     */
    readonly ref: ObjRef;

    /**
     * Specify drill localIdentifiers whose drills to remove or '*' to remove all defined drills.
     */
    readonly localIdentifiers: RemoveDrillsSelector;
}

/**
 * @beta
 */
export interface RemoveDrillsForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS";
    readonly payload: RemoveDrillsForInsightWidgetPayload;
}

/**
 * Creates the RemoveDrillsForInsightWidget command. Dispatching the created command will remove insight widget's
 * drill definition for the provided measure.
 *
 * @param ref - reference of insight widget whose drill should be removed
 * @param localIdentifiers - drill localIdentifiers whose drill definitions should be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function removeDrillsForInsightWidget(
    ref: ObjRef,
    localIdentifiers: RemoveDrillsSelector,
    correlationId?: string,
): RemoveDrillsForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS",
        correlationId,
        payload: {
            ref,
            localIdentifiers,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface RemoveDrillDownForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILL_DOWN";
    readonly payload: RemoveDrillDownForInsightWidgetPayload;
}

/**
 * Payload of the {@link RemoveDrillDownForInsightWidget} command.
 * @alpha
 */
export interface RemoveDrillDownForInsightWidgetPayload {
    /**
     * Reference to Insight Widget whose drill items should be removed.
     */
    readonly ref: ObjRef;

    /**
     * Specify drill localIdentifier and its hierarchy should be removed.
     * Ignored intersection attributes for specified herarchies will be removed as well.
     */
    readonly blacklistHierarchies: IDrillDownReference[];
}

/**
 * Creates the RemoveDrillDownForInsightWidget command. Dispatching the created command will remove insight widget's
 * drill definition for the provided measure.
 *
 * @param ref - reference of insight widget whose drill should be removed
 * @param blacklistHierarchies - drill localIdentifiers and its hierarchy should be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function removeDrillDownForInsightWidget(
    ref: ObjRef,
    blacklistHierarchies: IDrillDownReference[],
    correlationId?: string,
): RemoveDrillDownForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILL_DOWN",
        correlationId,
        payload: {
            ref,
            blacklistHierarchies,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface AddDrillDownForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.ADD_DRILL_DOWN";
    readonly payload: AddDrillDownForInsightWidgetPayload;
}

/**
 * Payload of the {@link AddDrillDownForInsightWidget} command.
 * @alpha
 */
export interface AddDrillDownForInsightWidgetPayload {
    /**
     * Reference to Insight Widget whose drill items should be added.
     */
    readonly ref: ObjRef;

    /**
     * Specify drill localIdentifier and its hierarchy should be added.
     */
    readonly attributeIdentifier: ObjRef;

    /**
     * Specify drill down hierarchy localIdentifier that should be added.
     */
    readonly drillDownIdentifier: string;

    /**
     * Specify drill down hierarchy reference that should be added.
     */
    readonly drillDownAttributeHierarchyRef: ObjRef;

    /**
     * Specify local identifiers of attributes that should be ignored in drill intersection.
     */
    readonly intersectionIgnoredAttributes: string[];
}

/**
 * Creates the AddDrillDownForInsightWidget command. Dispatching the created command will create insight widget's
 * drill definition for the provided measure.
 *
 * @param ref - reference of insight widget whose drill should be created
 * @param attributeIdentifier - drill localIdentifier that should be added.
 * @param drillDownIdentifier - drill down hierarchy localIdentifier that should be added.
 * @param drillDownAttributeHierarchyRef - drill down hierarchy reference that should be added.
 * @param intersectionIgnoredAttributes - specify local identifiers of attributes that should be ignored in drill intersection during drill down.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function addDrillDownForInsightWidget(
    ref: ObjRef,
    attributeIdentifier: ObjRef,
    drillDownIdentifier: string,
    drillDownAttributeHierarchyRef: ObjRef,
    intersectionIgnoredAttributes: string[] = [],
    correlationId?: string,
): AddDrillDownForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.ADD_DRILL_DOWN",
        correlationId,
        payload: {
            ref,
            attributeIdentifier,
            drillDownIdentifier,
            drillDownAttributeHierarchyRef,
            intersectionIgnoredAttributes,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface ModifyDrillDownForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILL_DOWN";
    readonly payload: ModifyDrillDownForInsightWidgetPayload;
}

/**
 * Payload of the {@link ModifyDrillDownForInsightWidget} command.
 * @alpha
 */
export interface ModifyDrillDownForInsightWidgetPayload {
    /**
     * Reference to Insight Widget whose drill items should be modified.
     */
    readonly ref: ObjRef;

    /**
     * Specify drill localIdentifier and its hierarchy should be modified.
     */
    readonly attributeIdentifier: ObjRef;

    /**
     * Specify drill attribute hierarchy ref to be modified.
     */
    readonly attributeHierarchyRef: ObjRef;

    /**
     * Specify hierarchies that should be added to the ignored hierarchies of the widget.
     * If no blacklistHierarchies are provided, ignored hierarchies keep unchanged.
     */
    readonly blacklistHierarchies: IDrillDownReference[];

    /**
     * Specify local identifiers of attributes that should be ignored in drill intersection
     * during drill down.
     * If no intersectionIgnoredAttributes are provided, ignored attributes keep unchanged.
     */
    readonly intersectionIgnoredAttributes?: string[];
}

/**
 * Creates the ModifyDrillDownForInsightWidget command. Dispatching the created command will update insight widget's
 * drill definition for the provided measure.
 *
 * @param ref - reference of insight widget whose drill should be modified
 * @param attributeIdentifier - drill localIdentifier and its hierarchy should be modified.
 * @param attributeHierarchyRef - drill attribute hierarchy ref to be modified.
 * @param blacklistHierarchies - drill localIdentifiers and its hierarchy should be modified
 * @param intersectionIgnoredAttributes - specify local identifiers of attributes that should be ignored in drill intersection during drill down.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function modifyDrillDownForInsightWidget(
    ref: ObjRef,
    attributeIdentifier: ObjRef,
    attributeHierarchyRef: ObjRef,
    blacklistHierarchies: IDrillDownReference[],
    intersectionIgnoredAttributes?: string[],
    correlationId?: string,
): ModifyDrillDownForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILL_DOWN",
        correlationId,
        payload: {
            ref,
            attributeIdentifier,
            attributeHierarchyRef,
            blacklistHierarchies,
            intersectionIgnoredAttributes,
        },
    };
}
/**
 * Payload of the {@link RefreshInsightWidget} command.
 * @beta
 */
export interface RefreshInsightWidgetPayload {
    /**
     * Reference to Insight Widget to refresh.
     */
    readonly ref: ObjRef;
}

/**
 * @beta
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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
 * @beta
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
 * @beta
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
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

/**
 * Payload of the {@link ExportRawInsightWidget} command.
 * @alpha
 */
export interface ExportRawInsightWidgetPayload {
    /**
     * Reference to Insight Widget to export.
     */
    readonly ref: ObjRef;

    /**
     * Reference to Insight Widget to export.
     */
    readonly widget: IInsightWidget;

    /**
     * Reference to Insight definition to export.
     */
    readonly insight: IInsight;

    /**
     * Reference to Insight title to export.
     */
    readonly filename: string;
}

/**
 * @alpha
 */
export interface ExportRawInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_RAW";
    readonly payload: ExportRawInsightWidgetPayload;
}
/**
 * Creates the ExportRawInsightWidget command. Dispatching this command will result in exporting of the widget to a CSV.
 *
 * @param insight - insight to export
 * @param filename - filename of the exported file
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function exportRawInsightWidget(
    ref: ObjRef,
    widget: IInsightWidget,
    insight: IInsight,
    filename: string,
    correlationId?: string,
): ExportRawInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_RAW",
        correlationId,
        payload: {
            ref,
            widget,
            insight,
            filename,
        },
    };
}

/**
 * Payload of the {@link ExportSlidesInsightWidget} command.
 * @alpha
 */
export interface ExportSlidesInsightWidgetPayload {
    /**
     * Reference to Insight to export.
     */
    readonly ref: ObjRef;

    /**
     * Reference to Insight title to export.
     */
    readonly filename: string;

    /**
     * Type of export to perform.
     */
    readonly exportType: "pdf" | "pptx";
}

/**
 * @alpha
 */
export interface ExportSlidesInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_SLIDES";
    readonly payload: ExportSlidesInsightWidgetPayload;
}
/**
 * Creates the ExportSlidesInsightWidget command. Dispatching this command will result in exporting of the widget to a slides type (pdf, pptx).
 *
 * @param ref - reference to the Insight to export
 * @param filename - filename of the exported file
 * @param exportType - type of export to perform
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function exportSlidesInsightWidget(
    ref: ObjRef,
    filename: string,
    exportType: "pdf" | "pptx",
    correlationId?: string,
): ExportSlidesInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_SLIDES",
        correlationId,
        payload: {
            ref,
            filename,
            exportType,
        },
    };
}

/**
 * Payload of the {@link ExportImageInsightWidget} command.
 * @alpha
 */
export interface ExportImageInsightWidgetPayload {
    /**
     * Reference to Insight to export.
     */
    readonly ref: ObjRef;

    /**
     * Reference to Insight title to export.
     */
    readonly filename: string;
}

/**
 * @alpha
 */
export interface ExportImageInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_IMAGE";
    readonly payload: ExportImageInsightWidgetPayload;
}
/**
 * Creates the ExportImageInsightWidget command. Dispatching this command will result in exporting of the widget to a image.
 *
 * @param ref - reference to the Insight to export
 * @param filename - filename of the exported file
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function exportImageInsightWidget(
    ref: ObjRef,
    filename: string,
    correlationId?: string,
): ExportImageInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_IMAGE",
        correlationId,
        payload: {
            ref,
            filename,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ChangeInsightWidgetDescription} command.
 * @beta
 */
export interface ChangeInsightWidgetDescriptionPayload {
    /**
     * Reference to Insight Widget whose description to change.
     */
    readonly ref: ObjRef;

    /**
     * Description to use for the Insight widget. Contents of the provided description will be used as-is and will be
     * used to replace the current description values.
     */
    readonly description: WidgetDescription;
}

/**
 * @beta
 */
export interface ChangeInsightWidgetDescription extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_DESCRIPTION";
    readonly payload: ChangeInsightWidgetDescriptionPayload;
}

/**
 * Creates the ChangeInsightWidgetDescription command. Dispatching this command will result in change of the Insight widget's
 * description.
 *
 * @param ref - reference of the insight widget to modify
 * @param description - new description to use
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function changeInsightWidgetDescription(
    ref: ObjRef,
    description: WidgetDescription,
    correlationId?: string,
): ChangeInsightWidgetDescription {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_DESCRIPTION",
        correlationId,
        payload: {
            ref,
            description,
        },
    };
}

//
//
//

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpIgnoreDateFilter} operation.
 *
 * Dispatching this command will result in addition of one or more filters into Insight widget's date filter ignore-list.
 * Those date filters that use the provided date data sets for filtering will be ignored by the widget on top of any
 * other filters that are already ignored.
 *
 * Ignored date filters are not passed down to the insight and will not be used to filter that insight.
 *
 * The operation is idempotent - trying to ignore an date filter multiple times will have no effect.
 *
 * @param ref - reference of the insight widget to modify
 * @param oneOrMoreDataSets - one or more refs of date dataSets used by date filters that should be added to the ignore-list
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function ignoreDateFilterOnInsightWidget(
    ref: ObjRef,
    oneOrMoreDataSets: ObjRef | ObjRef[],
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    const dateDataSetRefs = isObjRef(oneOrMoreDataSets) ? [oneOrMoreDataSets] : oneOrMoreDataSets;

    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "ignoreDateFilter",
                dateDataSetRefs,
            },
        },
    };
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link FilterOpUnignoreDateFilter} operation.
 *
 * Dispatching this command will result in removal of one or more filters from Insight widget's date filter ignore-list.
 * Ignored date filters are not passed down to the insight and will not be used to filter that insight.
 *
 * The operation is idempotent - trying to unignore an date filter multiple times will have no effect.
 *
 * @param ref - reference of the insight widget to modify
 * @param oneOrMoreDataSets - one or more refs of date data sets used by date filters that should be removed from the ignore-list
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function unignoreDateFilterOnInsightWidget(
    ref: ObjRef,
    oneOrMoreDataSets: ObjRef | ObjRef[],
    correlationId?: string,
): ChangeInsightWidgetFilterSettings {
    const dateDataSetRefs = isObjRef(oneOrMoreDataSets) ? [oneOrMoreDataSets] : oneOrMoreDataSets;

    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "unignoreDateFilter",
                dateDataSetRefs,
            },
        },
    };
}

/**
 * Payload of the {@link ChangeInsightWidgetIgnoreCrossFiltering} command.
 * @alpha
 */
export interface ChangeInsightWidgetIgnoreCrossFilteringPayload {
    /**
     * Reference to Insight Widget whose ignore cross-filtering setting to change.
     */
    readonly ref: ObjRef;

    /**
     * Value for the ignore cross-filtering setting.
     */
    readonly ignoreCrossFiltering: boolean;
}

/**
 * @alpha
 */
export interface ChangeInsightWidgetIgnoreCrossFiltering extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_IGNORE_CROSS_FILTERING";
    readonly payload: ChangeInsightWidgetIgnoreCrossFilteringPayload;
}

/**
 * Creates the ChangeInsightWidgetCrossFiltering command. Dispatching this command will result in change of the Insight widget's
 * cross-filtering setting.
 *
 * @param ref - reference of the insight widget to modify
 * @param value - new value to use
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeInsightWidgetIgnoreCrossFiltering(
    ref: ObjRef,
    ignoreCrossFiltering: boolean,
    correlationId?: string,
): ChangeInsightWidgetIgnoreCrossFiltering {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_IGNORE_CROSS_FILTERING",
        correlationId,
        payload: {
            ref,
            ignoreCrossFiltering,
        },
    };
}
