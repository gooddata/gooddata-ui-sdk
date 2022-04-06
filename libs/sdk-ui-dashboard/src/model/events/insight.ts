// (C) 2021-2022 GoodData Corporation
import {
    IInsight,
    ObjRef,
    VisualizationProperties,
    IDashboardAttributeFilter,
    DrillDefinition,
    IInsightWidget,
    IInsightWidgetDefinition,
    ICatalogDateDataset,
} from "@gooddata/sdk-model";

import { IDashboardEvent } from "./base";
import { WidgetHeader } from "../types/widgetTypes";
import { DashboardContext } from "../types/commonTypes";
import { eventGuard } from "./util";
import { IExportConfig } from "../types/exportTypes";

/**
 * Payload of the {@link DashboardInsightWidgetHeaderChanged} event.
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardInsightWidgetHeaderChanged = eventGuard<DashboardInsightWidgetHeaderChanged>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetFilterSettingsChanged} event.
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardInsightWidgetVisPropertiesChanged =
    eventGuard<DashboardInsightWidgetVisPropertiesChanged>("GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED");

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetInsightSwitched} event.
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardInsightWidgetInsightSwitched = eventGuard<DashboardInsightWidgetInsightSwitched>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetDrillsModified} event.
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardInsightWidgetDrillsModified = eventGuard<DashboardInsightWidgetDrillsModified>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetDrillsRemoved} event.
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardInsightWidgetDrillsRemoved = eventGuard<DashboardInsightWidgetDrillsRemoved>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetChanged} event.
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardInsightWidgetChanged = eventGuard<DashboardInsightWidgetChanged>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.WIDGET_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetExportRequested} event.
 * @alpha
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
 * @alpha
 */
export interface DashboardInsightWidgetExportRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_REQUESTED";
    readonly payload: DashboardInsightWidgetExportRequestedPayload;
}

/**
 * @alpha
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
 * @alpha
 */
export const isDashboardInsightWidgetExportRequested = eventGuard<DashboardInsightWidgetExportRequested>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_REQUESTED",
);

//
//
//

/**
 * Payload of the {@link DashboardInsightWidgetExportResolved} event.
 * @alpha
 */
export interface DashboardInsightWidgetExportResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    resultUri: string;
}

/**
 * This event is emitted after export of an insight widget is resolved.
 *
 * @alpha
 */
export interface DashboardInsightWidgetExportResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED";
    readonly payload: DashboardInsightWidgetExportResolvedPayload;
}

/**
 * @alpha
 */
export function insightWidgetExportResolved(
    ctx: DashboardContext,
    resultUri: string,
    correlationId?: string,
): DashboardInsightWidgetExportResolved {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
        ctx,
        correlationId,
        payload: {
            resultUri,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetExportResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardInsightWidgetExportResolved = eventGuard<DashboardInsightWidgetExportResolved>(
    "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
);
