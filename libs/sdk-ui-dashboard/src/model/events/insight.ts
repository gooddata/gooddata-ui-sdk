// (C) 2021-2026 GoodData Corporation

import { type IExportResult } from "@gooddata/sdk-backend-spi";
import {
    type DrillDefinition,
    type ICatalogDateDataset,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDrillDownReference,
    type IInsight,
    type IInsightWidget,
    type IInsightWidgetConfiguration,
    type IInsightWidgetDefinition,
    type ObjRef,
    type VisualizationProperties,
} from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";
import { type IExportConfig } from "../types/exportTypes.js";
import { type IWidgetDescription, type IWidgetHeader } from "../types/widgetTypes.js";

/**
 * Payload of the {@link IDashboardInsightWidgetHeaderChanged} event.
 * @beta
 */
export interface IDashboardInsightWidgetHeaderChangedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;
    /**
     * New widget header that is now used on the widget.
     */
    readonly header: IWidgetHeader;
}

/**
 * This event is emitted when the header of an insight widget changed. The new value of the header (title)
 * is included in the event.
 *
 * @beta
 */
export interface IDashboardInsightWidgetHeaderChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED";
    readonly payload: IDashboardInsightWidgetHeaderChangedPayload;
}

export function insightWidgetHeaderChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    header: IWidgetHeader,
    correlationId?: string,
): IDashboardInsightWidgetHeaderChanged {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            header,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetHeaderChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetHeaderChanged = eventGuard<IDashboardInsightWidgetHeaderChanged>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetDescriptionChanged} event.
 * @beta
 */
export interface IDashboardInsightWidgetDescriptionChangedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;
    /**
     * New widget description that is now used on the widget.
     */
    readonly description: IWidgetDescription;
}

/**
 * This event is emitted when the description of an insight widget changed. The new value of the description (summary)
 * is included in the event.
 *
 * @beta
 */
export interface IDashboardInsightWidgetDescriptionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DESCRIPTION_CHANGED";
    readonly payload: IDashboardInsightWidgetDescriptionChangedPayload;
}

export function insightWidgetDescriptionChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    description: IWidgetDescription,
    correlationId?: string,
): IDashboardInsightWidgetDescriptionChanged {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.DESCRIPTION_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            description,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetDescriptionChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetDescriptionChanged =
    eventGuard<IDashboardInsightWidgetDescriptionChanged>("GDC.DASH/EVT.INSIGHT_WIDGET.DESCRIPTION_CHANGED");

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetFilterSettingsChanged} event.
 * @beta
 */
export interface IDashboardInsightWidgetFilterSettingsChangedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * Attribute filters that are ignored for the widget.
     *
     * If empty, then all attribute filters defined for the dashboard are in effect.
     */
    readonly ignoredAttributeFilters: IDashboardAttributeFilter[];

    /**
     * Date filters with dimension that are ignored for the widget.
     *
     * If empty, then all date filters defined for the dashboard are in effect.
     */
    readonly ignoredDateFilters?: IDashboardDateFilter[];

    /**
     * Date dataset used for date filtering.
     *
     * If undefined, then dashboard's date filter is not in effect for the widget.
     */
    readonly dateDatasetForFiltering?: ICatalogDateDataset;
}

/**
 * This event is emitted when the insight widget's filter settings change.
 *
 * Filter settings influence what date dataset to use for filter or which of the dashboard's attribute filters
 * should be used for the widget. A change of filter settings means the insight rendered in the widget will
 * be re-rendered.
 *
 * @beta
 */
export interface IDashboardInsightWidgetFilterSettingsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED";
    readonly payload: IDashboardInsightWidgetFilterSettingsChangedPayload;
}

export function insightWidgetFilterSettingsChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    ignoredAttributeFilters: IDashboardAttributeFilter[],
    dateDatasetForFiltering: ICatalogDateDataset | undefined,
    correlationId?: string,
    ignoredDateFilters?: IDashboardDateFilter[],
): IDashboardInsightWidgetFilterSettingsChanged {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            ignoredAttributeFilters,
            ignoredDateFilters,
            dateDatasetForFiltering,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetFilterSettingsChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetFilterSettingsChanged =
    eventGuard<IDashboardInsightWidgetFilterSettingsChanged>(
        "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetVisPropertiesChanged} event.
 * @beta
 */
export interface IDashboardInsightWidgetVisPropertiesChangedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * New visualization properties that are now in effect for the insight widget. These properties
     * will be merged with the properties defined on the insight itself. They will influence how the
     * insight visually appears.
     *
     * Will be undefined if there are no widget-level visualization properties set for the particular
     * insight widget.
     */
    readonly properties: VisualizationProperties | undefined;
}

/**
 * This event is emitted when the insight widget's visualization properties change.
 *
 * The properties specified influence how the insight rendered in the widget appears visually (legend, tooltips,
 * axes, etc.)
 *
 * @beta
 */
export interface IDashboardInsightWidgetVisPropertiesChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED";
    readonly payload: IDashboardInsightWidgetVisPropertiesChangedPayload;
}

export function insightWidgetVisPropertiesChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    properties: VisualizationProperties | undefined,
    correlationId?: string,
): IDashboardInsightWidgetVisPropertiesChanged {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            properties,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetVisPropertiesChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetVisPropertiesChanged =
    eventGuard<IDashboardInsightWidgetVisPropertiesChanged>("GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED");

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetVisPropertiesChanged} event.
 * @beta
 */
export interface IDashboardInsightWidgetVisConfigurationChangedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * New visualization config that are now in effect for the insight widget. These config
     * will be merged with the config defined on the insight itself. They will influence how the
     * insight visually appears.
     *
     * Will be undefined if there are no widget-level visualization config set for the particular
     * insight widget.
     */
    readonly newConfig: IInsightWidgetConfiguration | undefined;
    /**
     * Previous visualization config to detect what has been changed if this info needed.
     */
    readonly oldConfig: IInsightWidgetConfiguration | undefined;
}

/**
 * This event is emitted when the insight widget's visualization configuration change.
 *
 * The configuration specified influence how the insight rendered in the widget appears visually
 *
 * @beta
 */
export interface IDashboardInsightWidgetVisConfigurationChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.CONFIGURATION_CHANGED";
    readonly payload: IDashboardInsightWidgetVisConfigurationChangedPayload;
}

export function insightWidgetVisConfigurationChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    newConfig: IInsightWidgetConfiguration | undefined,
    oldConfig: IInsightWidgetConfiguration | undefined,
    correlationId?: string,
): IDashboardInsightWidgetVisConfigurationChanged {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.CONFIGURATION_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            newConfig,
            oldConfig,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetVisConfigurationChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetVisConfigurationChanged =
    eventGuard<IDashboardInsightWidgetVisConfigurationChanged>(
        "GDC.DASH/EVT.INSIGHT_WIDGET.CONFIGURATION_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetInsightSwitched} event.
 * @beta
 */
export interface IDashboardInsightWidgetInsightSwitchedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * The new insight that is now rendered for the widget.
     */
    readonly insight: IInsight;
}

/**
 * This event is emitted when the insight rendered inside an insight widget gets switched for another one.
 *
 * That essentially means the insight widget now renders a different visualization
 *
 * @beta
 */
export interface IDashboardInsightWidgetInsightSwitched extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED";
    readonly payload: IDashboardInsightWidgetInsightSwitchedPayload;
}

export function insightWidgetInsightChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    insight: IInsight,
    correlationId?: string,
): IDashboardInsightWidgetInsightSwitched {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
        ctx,
        correlationId,
        payload: {
            ref,
            insight,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetInsightSwitched}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetInsightSwitched = eventGuard<IDashboardInsightWidgetInsightSwitched>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
);

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetDrillsModified} event.
 * @beta
 */
export interface IDashboardInsightWidgetDrillsModifiedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * Drill definitions that were newly added. There will be at most one drill definition for drillable
     * measure.
     */
    readonly added: DrillDefinition[];

    /**
     * Drill definitions that were updated. For each measure that was already set up with a drill definition,
     * there will be the new drill definition.
     */
    readonly updated: DrillDefinition[];
}

/**
 * This event is emitted when the insight widget's drill definitions change. The change may include
 * addition or change of drill definition for one or more drillable measures.
 *
 * @beta
 */
export interface IDashboardInsightWidgetDrillsModified extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED";
    readonly payload: IDashboardInsightWidgetDrillsModifiedPayload;
}

export function insightWidgetDrillsModified(
    ctx: DashboardContext,
    ref: ObjRef,
    added: DrillDefinition[],
    updated: DrillDefinition[],
    correlationId?: string,
): IDashboardInsightWidgetDrillsModified {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
        ctx,
        correlationId,
        payload: {
            ref,
            added,
            updated,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetDrillsModified}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetDrillsModified = eventGuard<IDashboardInsightWidgetDrillsModified>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
);

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetDrillsRemoved} event.
 * @beta
 */
export interface IDashboardInsightWidgetDrillsRemovedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * Drill definitions that were removed.
     */
    readonly removed: DrillDefinition[];
}

/**
 * This event is emitted when the insight widget's drill definitions are removed. The measures for which
 * the drill definitions were set up will no longer be clickable.
 *
 * @beta
 */
export interface IDashboardInsightWidgetDrillsRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED";
    readonly payload: IDashboardInsightWidgetDrillsRemovedPayload;
}

export function insightWidgetDrillsRemoved(
    ctx: DashboardContext,
    ref: ObjRef,
    removed: DrillDefinition[],
    correlationId?: string,
): IDashboardInsightWidgetDrillsRemoved {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
        ctx,
        correlationId,
        payload: {
            ref,
            removed,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetDrillsRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetDrillsRemoved = eventGuard<IDashboardInsightWidgetDrillsRemoved>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
);

//
//
//

/**
 * @alpha
 */
export interface IDashboardInsightWidgetDrillDownRemovedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * Drill down references that were removed.
     */
    readonly removed: IDrillDownReference[];
}

/**
 * @alpha
 */
export interface IDashboardInsightWidgetDrillDownRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILL_DOWN_REMOVED";
    readonly payload: IDashboardInsightWidgetDrillDownRemovedPayload;
}

/**
 * @alpha
 */
export function insightWidgetDrillDownRemoved(
    ctx: DashboardContext,
    ref: ObjRef,
    removed: IDrillDownReference[],
    correlationId?: string,
): IDashboardInsightWidgetDrillDownRemoved {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILL_DOWN_REMOVED",
        ctx,
        correlationId,
        payload: {
            ref,
            removed,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface IDashboardInsightWidgetDrillDownAddedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * Reference to attribute hierarchy that were added.
     */
    readonly attributeHierarchyRef: ObjRef;

    /**
     * Reference to attribute that were added.
     */
    readonly attribute: ObjRef;
}

/**
 * @alpha
 */
export interface IDashboardInsightWidgetDrillDownAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILL_DOWN_ADDED";
    readonly payload: IDashboardInsightWidgetDrillDownAddedPayload;
}

/**
 * @alpha
 */
export function insightWidgetDrillDownAdded(
    ctx: DashboardContext,
    ref: ObjRef,
    attributeHierarchyRef: ObjRef,
    attribute: ObjRef,
    correlationId?: string,
): IDashboardInsightWidgetDrillDownAdded {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILL_DOWN_ADDED",
        ctx,
        correlationId,
        payload: {
            ref,
            attributeHierarchyRef,
            attribute,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface IDashboardInsightWidgetDrillDownModifiedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * Drill down references that were updated.
     */
    readonly updated: IDrillDownReference[];
}

/**
 * This event is emitted when the insight widget's drill definitions change. The change may include
 * addition or change of drill definition for one or more drillable measures.
 *
 * @alpha
 */
export interface IDashboardInsightWidgetDrillDownModified extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILL_DOWN_MODIFIED";
    readonly payload: IDashboardInsightWidgetDrillDownModifiedPayload;
}

export function insightWidgetDrillDownModified(
    ctx: DashboardContext,
    ref: ObjRef,
    updated: IDrillDownReference[],
    correlationId?: string,
): IDashboardInsightWidgetDrillDownModified {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILL_DOWN_MODIFIED",
        ctx,
        correlationId,
        payload: {
            ref,
            updated,
        },
    };
}

//
//
//

/**
 * This event is emitted when Attribute Hierarchies have been updated/deleted.
 *
 * @beta
 */
export interface IAttributeHierarchyModifiedEvent extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_HIERARCHY_MODIFIED";
}

export function attributeHierarchyModifiedEvent(
    ctx: DashboardContext,
    correlationId?: string,
): IAttributeHierarchyModifiedEvent {
    return {
        type: "GDC.DASH/EVT.ATTRIBUTE_HIERARCHY_MODIFIED",
        ctx,
        correlationId,
    };
}

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetChanged} event.
 * @beta
 */
export interface IDashboardInsightWidgetChangedPayload {
    /**
     * The entire definition of the insight widget after the change.
     */
    insightWidget: IInsightWidget | IInsightWidgetDefinition;
}

/**
 * This event is emitted after any change to Insight Widget configuration. It contains the entire new state of the
 * Insight Widget.
 *
 * @beta
 */
export interface IDashboardInsightWidgetChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.WIDGET_CHANGED";
    readonly payload: IDashboardInsightWidgetChangedPayload;
}

export function insightWidgetChanged(
    ctx: DashboardContext,
    insightWidget: IInsightWidget | IInsightWidgetDefinition,
    correlationId?: string,
): IDashboardInsightWidgetChanged {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.WIDGET_CHANGED",
        ctx,
        correlationId,
        payload: {
            insightWidget,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetChanged = eventGuard<IDashboardInsightWidgetChanged>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.WIDGET_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetExportRequested} event.
 * @beta
 */
export interface IDashboardInsightWidgetExportRequestedPayload {
    /**
     * Reference to the Insight to be exported.
     */
    readonly ref: ObjRef;
    /**
     * Additional configuration of the export.
     */
    readonly config: IExportConfig;
}

/**
 * This event is emitted after export of an insight widget is requested.
 *
 * @beta
 */
export interface IDashboardInsightWidgetExportRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_REQUESTED";
    readonly payload: IDashboardInsightWidgetExportRequestedPayload;
}

/**
 * @beta
 */
export function insightWidgetExportRequested(
    ctx: DashboardContext,
    ref: ObjRef,
    config: IExportConfig,
    correlationId?: string,
): IDashboardInsightWidgetExportRequested {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_REQUESTED",
        ctx,
        correlationId,
        payload: {
            ref,
            config,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetExportRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetExportRequested = eventGuard<IDashboardInsightWidgetExportRequested>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_REQUESTED",
);

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetExportResolved} event.
 * @beta
 */
export interface IDashboardInsightWidgetExportResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    resultUri: string;
    /**
     * Collection of information used to download the resulting file.
     */
    result: IExportResult;
}

/**
 * This event is emitted after export of an insight widget is resolved.
 *
 * @beta
 */
export interface IDashboardInsightWidgetExportResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED";
    readonly payload: IDashboardInsightWidgetExportResolvedPayload;
}

/**
 * @beta
 */
export function insightWidgetExportResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): IDashboardInsightWidgetExportResolved {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
        ctx,
        correlationId,
        payload: {
            resultUri: result.uri,
            result,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetExportResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetExportResolved = eventGuard<IDashboardInsightWidgetExportResolved>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardInsightWidgetRefreshed} event.
 * @beta
 */
export interface IDashboardInsightWidgetRefreshedPayload {
    /**
     * The new value of the insight.
     */
    insight: IInsight;
}

/**
 * This event is emitted after an insight widget is refreshed.
 *
 * @beta
 */
export interface IDashboardInsightWidgetRefreshed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.REFRESHED";
    readonly payload: IDashboardInsightWidgetRefreshedPayload;
}

/**
 * @beta
 */
export function insightWidgetRefreshed(
    ctx: DashboardContext,
    insight: IInsight,
    correlationId?: string,
): IDashboardInsightWidgetRefreshed {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.REFRESHED",
        ctx,
        correlationId,
        payload: {
            insight,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetRefreshed}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetRefreshed = eventGuard<IDashboardInsightWidgetRefreshed>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.REFRESHED",
);

/**
 * Payload of the {@link IDashboardInsightWidgetIgnoreCrossFilteringChanged} event.
 * @alpha
 */
export interface IDashboardInsightWidgetIgnoreCrossFilteringChangedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;

    /**
     * New value for ignore cross-filters widget setting.
     */
    readonly ignoreCrossFiltering: boolean;
}

/**
 * This event is emitted when the insight widgets ignore cross-filters setting changes.
 *
 * The configuration specified influence how the insight is filtered
 *
 * @alpha
 */
export interface IDashboardInsightWidgetIgnoreCrossFilteringChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.IGNORE_CROSS_FILTERING_CHANGED";
    readonly payload: IDashboardInsightWidgetIgnoreCrossFilteringChangedPayload;
}

export function insightWidgetIgnoreCrossFilteringChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    ignoreCrossFiltering: boolean,
    correlationId?: string,
): IDashboardInsightWidgetIgnoreCrossFilteringChanged {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.IGNORE_CROSS_FILTERING_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            ignoreCrossFiltering,
        },
    };
}
