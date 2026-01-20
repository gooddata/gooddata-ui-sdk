// (C) 2021-2026 GoodData Corporation

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
 * Payload of the {@link IDashboardRichTextWidgetContentChanged} event.
 * @beta
 */
export interface IDashboardRichTextWidgetContentChangedPayload {
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
export interface IDashboardRichTextWidgetContentChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RICH_TEXT_WIDGET.CONTENT_CHANGED";
    readonly payload: IDashboardRichTextWidgetContentChangedPayload;
}

/**
 * @internal
 */
export function richTextWidgetContentChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    content: string,
    correlationId?: string,
): IDashboardRichTextWidgetContentChanged {
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
 * Tests whether the provided object is an instance of {@link IDashboardRichTextWidgetContentChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardRichTextWidgetContentChanged = eventGuard<IDashboardRichTextWidgetContentChanged>(
    "GDC.DASH/EVT.RICH_TEXT_WIDGET.CONTENT_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardRichTextWidgetFilterSettingsChanged} event.
 * @beta
 */
export interface IDashboardRichTextWidgetFilterSettingsChangedPayload {
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
export interface IDashboardRichTextWidgetFilterSettingsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED";
    readonly payload: IDashboardRichTextWidgetFilterSettingsChangedPayload;
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
): IDashboardRichTextWidgetFilterSettingsChanged {
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
 * Tests whether the provided object is an instance of {@link IDashboardInsightWidgetFilterSettingsChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardRichTextWidgetFilterSettingsChanged =
    eventGuard<IDashboardRichTextWidgetFilterSettingsChanged>(
        "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
    );
