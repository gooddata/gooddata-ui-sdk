// (C) 2021-2026 GoodData Corporation

import {
    type IDrillDownReference,
    type IInsight,
    type IInsightWidget,
    type IInsightWidgetConfiguration,
    type InsightDrillDefinition,
    type LocalIdRef,
    type ObjRef,
    type VisualizationProperties,
    isObjRef,
} from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";
import { type IExportConfig } from "../types/exportTypes.js";
import {
    type IFilterOpReplaceAll,
    type IWidgetDescription,
    type IWidgetFilterOperation,
    type IWidgetHeader,
} from "../types/widgetTypes.js";

/**
 * Payload of the {@link IChangeInsightWidgetHeader} command.
 * @beta
 */
export interface IChangeInsightWidgetHeaderPayload {
    /**
     * Reference to Insight Widget whose header to change.
     */
    readonly ref: ObjRef;

    /**
     * Header to use for the Insight widget. Contents of the provided header will be used as-is and will be
     * used to replace the current header values.
     */
    readonly header: IWidgetHeader;
}

/**
 * @beta
 */
export interface IChangeInsightWidgetHeader extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER";
    readonly payload: IChangeInsightWidgetHeaderPayload;
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
    header: IWidgetHeader,
    correlationId?: string,
): IChangeInsightWidgetHeader {
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
 * Payload of the {@link IChangeInsightWidgetFilterSettings} command.
 * @beta
 */
export interface IChangeInsightWidgetFilterSettingsPayload {
    /**
     * Reference to Insight Widget whose filter settings to change.
     */
    readonly ref: ObjRef;

    /**
     * Filter operation to apply.
     */
    readonly operation: IWidgetFilterOperation;
}

/**
 * @beta
 */
export interface IChangeInsightWidgetFilterSettings extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS";
    readonly payload: IChangeInsightWidgetFilterSettingsPayload;
}

/**
 * Creates the ChangeInsightWidgetFilterSettings command for {@link IFilterOpReplaceAll} operation.
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
    settings: Omit<IFilterOpReplaceAll, "type">,
    correlationId?: string,
): IChangeInsightWidgetFilterSettings {
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
 * Creates the ChangeInsightWidgetFilterSettings command for {@link IFilterOpEnableDateFilter} operation.
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
): IChangeInsightWidgetFilterSettings {
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
 * Creates the ChangeInsightWidgetFilterSettings command for {@link IFilterOpDisableDateFilter} operation.
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
): IChangeInsightWidgetFilterSettings {
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
 * Creates the ChangeInsightWidgetFilterSettings command for {@link IFilterOpReplaceAttributeIgnores} operation.
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
): IChangeInsightWidgetFilterSettings {
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
 * Creates the ChangeInsightWidgetFilterSettings command for {@link IFilterOpIgnoreAttributeFilter} operation.
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
): IChangeInsightWidgetFilterSettings {
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
 * Creates the ChangeInsightWidgetFilterSettings command for {@link IFilterOpUnignoreAttributeFilter} operation.
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
): IChangeInsightWidgetFilterSettings {
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
 * Payload of the {@link IChangeInsightWidgetVisProperties} command.
 * @beta
 */
export interface IChangeInsightWidgetVisPropertiesPayload {
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
export interface IChangeInsightWidgetVisProperties extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES";
    readonly payload: IChangeInsightWidgetVisPropertiesPayload;
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
): IChangeInsightWidgetVisProperties {
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
export type ChangeInsightWidgetVisConfigurationPayload = {
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
};

/**
 * @public
 */
export type ChangeInsightWidgetVisConfiguration = IDashboardCommand & {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_CONFIGURATION";
    readonly payload: ChangeInsightWidgetVisConfigurationPayload;
};

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
 * Payload of the {@link IChangeInsightWidgetInsight} command.
 * @beta
 */
export interface IChangeInsightWidgetInsightPayload {
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
export interface IChangeInsightWidgetInsight extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT";
    readonly payload: IChangeInsightWidgetInsightPayload;
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
): IChangeInsightWidgetInsight {
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
 * Payload of the {@link IModifyDrillsForInsightWidget} command.
 * @beta
 */
export interface IModifyDrillsForInsightWidgetPayload {
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
export interface IModifyDrillsForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS";
    readonly payload: IModifyDrillsForInsightWidgetPayload;
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
 * @param blacklistHierarchiesToUpdate -
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
): IModifyDrillsForInsightWidget {
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
export interface IAttributeHierarchyModified extends IDashboardCommand {
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
export function attributeHierarchyModified(correlationId?: string): IAttributeHierarchyModified {
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
 * Payload of the {@link IRemoveDrillsForInsightWidget} command.
 * @beta
 */
export interface IRemoveDrillsForInsightWidgetPayload {
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
export interface IRemoveDrillsForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS";
    readonly payload: IRemoveDrillsForInsightWidgetPayload;
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
): IRemoveDrillsForInsightWidget {
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
export interface IRemoveDrillDownForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILL_DOWN";
    readonly payload: IRemoveDrillDownForInsightWidgetPayload;
}

/**
 * Payload of the {@link IRemoveDrillDownForInsightWidget} command.
 * @alpha
 */
export interface IRemoveDrillDownForInsightWidgetPayload {
    /**
     * Reference to Insight Widget whose drill items should be removed.
     */
    readonly ref: ObjRef;

    /**
     * Specify drill localIdentifier and its hierarchy should be removed.
     * Ignored intersection attributes for specified hierarchies will be removed as well.
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
): IRemoveDrillDownForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILL_DOWN",
        correlationId,
        payload: {
            ref,
            blacklistHierarchies,
        },
    };
}

/**
 * @alpha
 */
export interface IRemoveDrillToUrlForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILL_TO_URL";
    readonly payload: IRemoveDrillToUrlForInsightWidgetPayload;
}

/**
 * @alpha
 */
export interface IRemoveDrillToUrlForInsightWidgetPayload {
    /**
     * Reference to Insight Widget whose drill items should be removed.
     */
    readonly ref: ObjRef;

    /**
     * Specify attribute display forms which should be ignored.
     */
    readonly blacklistAttributes: ObjRef[];
}

/**
 * Creates the RemoveDrillToUrlForInsightWidget command. Dispatching the created command will remove insight widget's
 * drill definition for the provided attribute.
 *
 * @param ref - reference of insight widget whose drill should be removed
 * @param blacklistAttributes - displayForm refs of drill to url attributes which should be removed.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function removeDrillToUrlForInsightWidget(
    ref: ObjRef,
    blacklistAttributes: ObjRef[],
    correlationId?: string,
): IRemoveDrillToUrlForInsightWidget {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILL_TO_URL",
        correlationId,
        payload: { ref, blacklistAttributes },
    };
}

//
//
//

/**
 * @alpha
 */
export interface IAddDrillDownForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.ADD_DRILL_DOWN";
    readonly payload: IAddDrillDownForInsightWidgetPayload;
}

/**
 * Payload of the {@link IAddDrillDownForInsightWidget} command.
 * @alpha
 */
export interface IAddDrillDownForInsightWidgetPayload {
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
): IAddDrillDownForInsightWidget {
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
export interface IModifyDrillDownForInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILL_DOWN";
    readonly payload: IModifyDrillDownForInsightWidgetPayload;
}

/**
 * Payload of the {@link IModifyDrillDownForInsightWidget} command.
 * @alpha
 */
export interface IModifyDrillDownForInsightWidgetPayload {
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
): IModifyDrillDownForInsightWidget {
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
 * Payload of the {@link IRefreshInsightWidget} command.
 * @beta
 */
export interface IRefreshInsightWidgetPayload {
    /**
     * Reference to Insight Widget to refresh.
     */
    readonly ref: ObjRef;
}

/**
 * @beta
 */
export interface IRefreshInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH";
    readonly payload: IRefreshInsightWidgetPayload;
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
export function refreshInsightWidget(ref: ObjRef, correlationId?: string): IRefreshInsightWidget {
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
 * Payload of the {@link IExportInsightWidget} command.
 * @beta
 */
export interface IExportInsightWidgetPayload {
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
export interface IExportInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT";
    readonly payload: IExportInsightWidgetPayload;
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
): IExportInsightWidget {
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
 * Payload of the {@link IExportRawInsightWidget} command.
 * @alpha
 */
export interface IExportRawInsightWidgetPayload {
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
export interface IExportRawInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_RAW";
    readonly payload: IExportRawInsightWidgetPayload;
}
/**
 * Creates the ExportRawInsightWidget command. Dispatching this command will result in exporting of the widget to a CSV.
 *
 * @param ref -
 * @param widget -
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
): IExportRawInsightWidget {
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
 * Payload of the {@link IExportSlidesInsightWidget} command.
 * @alpha
 */
export interface IExportSlidesInsightWidgetPayload {
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
export interface IExportSlidesInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_SLIDES";
    readonly payload: IExportSlidesInsightWidgetPayload;
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
): IExportSlidesInsightWidget {
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
 * Payload of the {@link IExportImageInsightWidget} command.
 * @alpha
 */
export interface IExportImageInsightWidgetPayload {
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
export interface IExportImageInsightWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_IMAGE";
    readonly payload: IExportImageInsightWidgetPayload;
}
/**
 * Creates the ExportImageInsightWidget command. Dispatching this command will result in exporting of the widget to an image.
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
): IExportImageInsightWidget {
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
 * Payload of the {@link IChangeInsightWidgetDescription} command.
 * @beta
 */
export interface IChangeInsightWidgetDescriptionPayload {
    /**
     * Reference to Insight Widget whose description to change.
     */
    readonly ref: ObjRef;

    /**
     * Description to use for the Insight widget. Contents of the provided description will be used as-is and will be
     * used to replace the current description values.
     */
    readonly description: IWidgetDescription;
}

/**
 * @beta
 */
export interface IChangeInsightWidgetDescription extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_DESCRIPTION";
    readonly payload: IChangeInsightWidgetDescriptionPayload;
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
    description: IWidgetDescription,
    correlationId?: string,
): IChangeInsightWidgetDescription {
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
 * Creates the ChangeInsightWidgetFilterSettings command for {@link IFilterOpIgnoreDateFilter} operation.
 *
 * Dispatching this command will result in addition of one or more filters into Insight widget's date filter ignore-list.
 * Those date filters that use the provided date data sets for filtering will be ignored by the widget on top of any
 * other filters that are already ignored.
 *
 * Ignored date filters are not passed down to the insight and will not be used to filter that insight.
 *
 * The operation is idempotent - trying to ignore a date filter multiple times will have no effect.
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
): IChangeInsightWidgetFilterSettings {
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
 * Creates the ChangeInsightWidgetFilterSettings command for {@link IFilterOpUnignoreDateFilter} operation.
 *
 * Dispatching this command will result in removal of one or more filters from Insight widget's date filter ignore-list.
 * Ignored date filters are not passed down to the insight and will not be used to filter that insight.
 *
 * The operation is idempotent - trying to unignore a date filter multiple times will have no effect.
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
): IChangeInsightWidgetFilterSettings {
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
 * Payload of the {@link IChangeInsightWidgetIgnoreCrossFiltering} command.
 * @alpha
 */
export interface IChangeInsightWidgetIgnoreCrossFilteringPayload {
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
export interface IChangeInsightWidgetIgnoreCrossFiltering extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_IGNORE_CROSS_FILTERING";
    readonly payload: IChangeInsightWidgetIgnoreCrossFilteringPayload;
}

/**
 * Creates the ChangeInsightWidgetCrossFiltering command. Dispatching this command will result in change of the Insight widget's
 * cross-filtering setting.
 *
 * @param ref - reference of the insight widget to modify
 * @param ignoreCrossFiltering -
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeInsightWidgetIgnoreCrossFiltering(
    ref: ObjRef,
    ignoreCrossFiltering: boolean,
    correlationId?: string,
): IChangeInsightWidgetIgnoreCrossFiltering {
    return {
        type: "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_IGNORE_CROSS_FILTERING",
        correlationId,
        payload: {
            ref,
            ignoreCrossFiltering,
        },
    };
}
