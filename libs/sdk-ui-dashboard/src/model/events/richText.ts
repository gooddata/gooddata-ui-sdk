// (C) 2021-2024 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";

import { IDashboardEvent } from "./base.js";
import { DashboardContext } from "../types/commonTypes.js";
import { eventGuard } from "./util.js";

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
