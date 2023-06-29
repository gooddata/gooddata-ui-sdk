// (C) 2021-2023 GoodData Corporation
import {
    IInsight,
    ObjRef,
    VisualizationProperties,
    IDashboardAttributeFilter,
    DrillDefinition,
    IInsightWidget,
    IInsightWidgetDefinition,
    ICatalogDateDataset,
    IInsightWidgetConfiguration,
} from "@gooddata/sdk-model";

import { IDashboardEvent } from "./base.js";
import { WidgetDescription, WidgetHeader } from "../types/widgetTypes.js";
import { DashboardContext } from "../types/commonTypes.js";
import { eventGuard } from "./util.js";
import { IExportConfig } from "../types/exportTypes.js";
import { IExportBlobResult } from "@gooddata/sdk-backend-spi";

/**
 * Payload of the {@link DashboardInsightWidgetHeaderChanged} event.
 * @beta
 */
export interface DashboardInsightWidgetHeaderChangedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;
    /**
     * New widget header that is now used on the widget.
     */
    readonly header: WidgetHeader;
}

/**
 * This event is emitted when the header of an insight widget changed. The new value of the header (title)
 * is included in the event.
 *
 * @beta
 */
export interface DashboardInsightWidgetHeaderChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED";
    readonly payload: DashboardInsightWidgetHeaderChangedPayload;
}

export function insightWidgetHeaderChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    header: WidgetHeader,
    correlationId?: string,
): DashboardInsightWidgetHeaderChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetHeaderChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetHeaderChanged = eventGuard<DashboardInsightWidgetHeaderChanged>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetDescriptionChanged} event.
 * @beta
 */
export interface DashboardInsightWidgetDescriptionChangedPayload {
    /**
     * Reference to Insight Widget that was changed.
     */
    readonly ref: ObjRef;
    /**
     * New widget description that is now used on the widget.
     */
    readonly description: WidgetDescription;
}

/**
 * This event is emitted when the description of an insight widget changed. The new value of the description (summary)
 * is included in the event.
 *
 * @beta
 */
export interface DashboardInsightWidgetDescriptionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DESCRIPTION_CHANGED";
    readonly payload: DashboardInsightWidgetDescriptionChangedPayload;
}

export function insightWidgetDescriptionChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    description: WidgetDescription,
    correlationId?: string,
): DashboardInsightWidgetDescriptionChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetDescriptionChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetDescriptionChanged =
    eventGuard<DashboardInsightWidgetDescriptionChanged>("GDC.DASH/EVT.INSIGHT_WIDGET.DESCRIPTION_CHANGED");

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetFilterSettingsChanged} event.
 * @beta
 */
export interface DashboardInsightWidgetFilterSettingsChangedPayload {
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
export interface DashboardInsightWidgetFilterSettingsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED";
    readonly payload: DashboardInsightWidgetFilterSettingsChangedPayload;
}

export function insightWidgetFilterSettingsChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    ignoredAttributeFilters: IDashboardAttributeFilter[],
    dateDatasetForFiltering: ICatalogDateDataset | undefined,
    correlationId?: string,
): DashboardInsightWidgetFilterSettingsChanged {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            ignoredAttributeFilters,
            dateDatasetForFiltering,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetFilterSettingsChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetFilterSettingsChanged =
    eventGuard<DashboardInsightWidgetFilterSettingsChanged>(
        "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetVisPropertiesChanged} event.
 * @beta
 */
export interface DashboardInsightWidgetVisPropertiesChangedPayload {
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
 * axes, etc)
 *
 * @beta
 */
export interface DashboardInsightWidgetVisPropertiesChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED";
    readonly payload: DashboardInsightWidgetVisPropertiesChangedPayload;
}

export function insightWidgetVisPropertiesChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    properties: VisualizationProperties | undefined,
    correlationId?: string,
): DashboardInsightWidgetVisPropertiesChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetVisPropertiesChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetVisPropertiesChanged =
    eventGuard<DashboardInsightWidgetVisPropertiesChanged>("GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED");

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetVisPropertiesChanged} event.
 * @beta
 */
export interface DashboardInsightWidgetVisConfigurationChangedPayload {
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
export interface DashboardInsightWidgetVisConfigurationChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.CONFIGURATION_CHANGED";
    readonly payload: DashboardInsightWidgetVisConfigurationChangedPayload;
}

export function insightWidgetVisConfigurationChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    newConfig: IInsightWidgetConfiguration | undefined,
    oldConfig: IInsightWidgetConfiguration | undefined,
    correlationId?: string,
): DashboardInsightWidgetVisConfigurationChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetVisConfigurationChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetVisConfigurationChanged =
    eventGuard<DashboardInsightWidgetVisConfigurationChanged>(
        "GDC.DASH/EVT.INSIGHT_WIDGET.CONFIGURATION_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetInsightSwitched} event.
 * @beta
 */
export interface DashboardInsightWidgetInsightSwitchedPayload {
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
export interface DashboardInsightWidgetInsightSwitched extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED";
    readonly payload: DashboardInsightWidgetInsightSwitchedPayload;
}

export function insightWidgetInsightChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    insight: IInsight,
    correlationId?: string,
): DashboardInsightWidgetInsightSwitched {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetInsightSwitched}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetInsightSwitched = eventGuard<DashboardInsightWidgetInsightSwitched>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetDrillsModified} event.
 * @beta
 */
export interface DashboardInsightWidgetDrillsModifiedPayload {
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
export interface DashboardInsightWidgetDrillsModified extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED";
    readonly payload: DashboardInsightWidgetDrillsModifiedPayload;
}

export function insightWidgetDrillsModified(
    ctx: DashboardContext,
    ref: ObjRef,
    added: DrillDefinition[],
    updated: DrillDefinition[],
    correlationId?: string,
): DashboardInsightWidgetDrillsModified {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetDrillsModified}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetDrillsModified = eventGuard<DashboardInsightWidgetDrillsModified>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetDrillsRemoved} event.
 * @beta
 */
export interface DashboardInsightWidgetDrillsRemovedPayload {
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
export interface DashboardInsightWidgetDrillsRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED";
    readonly payload: DashboardInsightWidgetDrillsRemovedPayload;
}

export function insightWidgetDrillsRemoved(
    ctx: DashboardContext,
    ref: ObjRef,
    removed: DrillDefinition[],
    correlationId?: string,
): DashboardInsightWidgetDrillsRemoved {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetDrillsRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetDrillsRemoved = eventGuard<DashboardInsightWidgetDrillsRemoved>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetChanged} event.
 * @beta
 */
export interface DashboardInsightWidgetChangedPayload {
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
export interface DashboardInsightWidgetChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.WIDGET_CHANGED";
    readonly payload: DashboardInsightWidgetChangedPayload;
}

export function insightWidgetChanged(
    ctx: DashboardContext,
    insightWidget: IInsightWidget | IInsightWidgetDefinition,
    correlationId?: string,
): DashboardInsightWidgetChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetChanged = eventGuard<DashboardInsightWidgetChanged>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.WIDGET_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetExportRequested} event.
 * @beta
 */
export interface DashboardInsightWidgetExportRequestedPayload {
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
export interface DashboardInsightWidgetExportRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_REQUESTED";
    readonly payload: DashboardInsightWidgetExportRequestedPayload;
}

/**
 * @beta
 */
export function insightWidgetExportRequested(
    ctx: DashboardContext,
    ref: ObjRef,
    config: IExportConfig,
    correlationId?: string,
): DashboardInsightWidgetExportRequested {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetExportRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetExportRequested = eventGuard<DashboardInsightWidgetExportRequested>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_REQUESTED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetExportResolved} event.
 * @beta
 */
export interface DashboardInsightWidgetExportResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    resultUri: string;
    /**
     * Collection of information used to download the resulting file.
     */
    result: IExportBlobResult;
}

/**
 * This event is emitted after export of an insight widget is resolved.
 *
 * @beta
 */
export interface DashboardInsightWidgetExportResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED";
    readonly payload: DashboardInsightWidgetExportResolvedPayload;
}

/**
 * @beta
 */
export function insightWidgetExportResolved(
    ctx: DashboardContext,
    result: IExportBlobResult,
    correlationId?: string,
): DashboardInsightWidgetExportResolved {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetExportResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetExportResolved = eventGuard<DashboardInsightWidgetExportResolved>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetRefreshed} event.
 * @beta
 */
export interface DashboardInsightWidgetRefreshedPayload {
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
export interface DashboardInsightWidgetRefreshed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.REFRESHED";
    readonly payload: DashboardInsightWidgetRefreshedPayload;
}

/**
 * @beta
 */
export function insightWidgetRefreshed(
    ctx: DashboardContext,
    insight: IInsight,
    correlationId?: string,
): DashboardInsightWidgetRefreshed {
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetRefreshed}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardInsightWidgetRefreshed = eventGuard<DashboardInsightWidgetRefreshed>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.REFRESHED",
);
