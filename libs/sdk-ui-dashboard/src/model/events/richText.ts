// (C) 2021-2025 GoodData Corporation

import {
    type ICatalogDateDataset,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type ObjRef,
} from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link DashboardRichTextWidgetContentChanged} event.
 * @beta
 */
export interface DashboardRichTextWidgetContentChangedPayload {
    /**
     * Reference to changed rich text widget.
     */
    readonly ref: ObjRef;

    /**
     * New value of the rich text widget content.
     */
    readonly content: string;
}

/**
 * This event is emitted when the dashboard's rich text widget content is changed.
 *
 * @beta
 */
export interface DashboardRichTextWidgetContentChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RICH_TEXT_WIDGET.CONTENT_CHANGED";
    readonly payload: DashboardRichTextWidgetContentChangedPayload;
}

/**
 * @internal
 */
export function richTextWidgetContentChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    content: string,
    correlationId?: string,
): DashboardRichTextWidgetContentChanged {
    return {
        type: "GDC.DASH/EVT.RICH_TEXT_WIDGET.CONTENT_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            content,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardRichTextWidgetContentChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardRichTextWidgetContentChanged = eventGuard<DashboardRichTextWidgetContentChanged>(
    "GDC.DASH/EVT.RICH_TEXT_WIDGET.CONTENT_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardRichTextWidgetFilterSettingsChanged} event.
 * @beta
 */
export interface DashboardRichTextWidgetFilterSettingsChangedPayload {
    /**
     * Reference to RichText Widget that was changed.
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
 * This event is emitted when the RichText widget's filter settings change.
 *
 * Filter settings influence what date dataset to use for filter or which of the dashboard's attribute filters
 * should be used for the widget. A change of filter settings means the RichText rendered in the widget will
 * be re-rendered.
 *
 * @beta
 */
export interface DashboardRichTextWidgetFilterSettingsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED";
    readonly payload: DashboardRichTextWidgetFilterSettingsChangedPayload;
}

/**
 * @internal
 */
export function richTextWidgetFilterSettingsChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    ignoredAttributeFilters: IDashboardAttributeFilter[],
    dateDatasetForFiltering: ICatalogDateDataset | undefined,
    correlationId?: string,
    ignoredDateFilters?: IDashboardDateFilter[],
): DashboardRichTextWidgetFilterSettingsChanged {
    return {
        type: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
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
 * Tests whether the provided object is an instance of {@link DashboardInsightWidgetFilterSettingsChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardRichTextWidgetFilterSettingsChanged =
    eventGuard<DashboardRichTextWidgetFilterSettingsChanged>(
        "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
    );
