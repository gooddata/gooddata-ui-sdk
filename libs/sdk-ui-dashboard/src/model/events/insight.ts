// (C) 2021 GoodData Corporation

import { DashboardEventBody, IDashboardEvent } from "./base";
import { IInsight, ObjRef, VisualizationProperties } from "@gooddata/sdk-model";
import { WidgetHeader } from "../types/widgetTypes";
import { DashboardContext } from "../types/commonTypes";
import {
    DrillDefinition,
    ICatalogDateDataset,
    IDashboardAttributeFilter,
    IInsightWidget,
    IInsightWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * This event is emitted when the header of an insight widget changed. The new value of the header (title)
 * is included in the event.
 *
 * @alpha
 */
export interface DashboardInsightWidgetHeaderChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED";
    readonly payload: {
        /**
         * Reference to Insight Widget that was changed.
         */
        readonly ref: ObjRef;

        /**
         * New widget header that is now used on the widget.
         */
        readonly header: WidgetHeader;
    };
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

//
//
//

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
    readonly payload: {
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
    };
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

//
//
//

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
    readonly payload: {
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
    };
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

//
//
//

/**
 * This event is emitted when the insight rendered inside an insight widget gets switched for another one.
 *
 * That essentially means the insight widget now renders a different visualization
 *
 * @alpha
 */
export interface DashboardInsightWidgetInsightSwitched extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED";
    readonly payload: {
        /**
         * Reference to Insight Widget that was changed.
         */
        readonly ref: ObjRef;

        /**
         * The new insight that is now rendered for the widget.
         */
        readonly insight: IInsight;
    };
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

//
//
//

/**
 * This event is emitted when the insight widget's drill definitions change. The change may include
 * addition or change of drill definition for one or more drillable measures.
 *
 * @alpha
 */
export interface DashboardInsightWidgetDrillsModified extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED";
    readonly payload: {
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
    };
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

//
//
//

/**
 * This event is emitted when the insight widget's drill definitions are removed. The measures for which
 * the drill definitions were set up will no longer be clickable.
 *
 * @alpha
 */
export interface DashboardInsightWidgetDrillsRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED";
    readonly payload: {
        /**
         * Reference to Insight Widget that was changed.
         */
        readonly ref: ObjRef;

        /**
         * Drill definitions that were removed.
         */
        readonly removed: DrillDefinition[];
    };
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

//
//
//

/**
 * This event is emitted after any change to Insight Widget configuration. It contains the entire new state of the
 * Insight Widget.
 *
 * @alpha
 */
export interface DashboardInsightWidgetChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.WIDGET_CHANGED";
    readonly payload: {
        /**
         * The entire definition of the insight widget after the change.
         */
        insightWidget: IInsightWidget | IInsightWidgetDefinition;
    };
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

//
//
//

/**
 * This event is emitted after execution of an insight widget fails.
 *
 * @alpha
 */
export interface DashboardInsightWidgetExecutionFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXECUTION_FAILED";
    readonly payload: {
        error: GoodDataSdkError;
    };
}

/**
 * @alpha
 */
export function insightWidgetExecutionFailed(
    error: GoodDataSdkError,
    correlationId?: string,
): DashboardEventBody<DashboardInsightWidgetExecutionFailed> {
    return {
        type: "GDC.DASH/EVT.INSIGHT_WIDGET.EXECUTION_FAILED",
        correlationId,
        payload: {
            error,
        },
    };
}
