// (C) 2020-2026 GoodData Corporation

import {
    type AdInsightRenderedBody,
    type GdcAdCommandType,
    GdcAdEventType,
    type IObjectMeta,
} from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

/**
 * Emit an event to notify outer app that the insight is rendered.
 */
export function insightRendered(
    availableCommands: GdcAdCommandType[],
    insight: IObjectMeta,
    errorMessage?: string,
): void {
    const insightRenderedBody: AdInsightRenderedBody = {
        availableCommands,
        insight,
        errorMessage,
    };
    adPostEvent(GdcAdEventType.InsightRendered, insightRenderedBody);
}
