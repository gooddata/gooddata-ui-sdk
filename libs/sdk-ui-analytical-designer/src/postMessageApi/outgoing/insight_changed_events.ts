// (C) 2020-2026 GoodData Corporation

import { type AdInsightChangedBody, type GdcAdCommandType, GdcAdEventType } from "@gooddata/sdk-embedding";
import { type IInsightDefinition } from "@gooddata/sdk-model";

import { adPostEvent } from "./post_event_helper.js";

export function insightChanged(availableCommands: GdcAdCommandType[], insight: IInsightDefinition): void {
    const data: AdInsightChangedBody = {
        definition: insight,
        availableCommands,
    };
    adPostEvent(GdcAdEventType.InsightChanged, data);
}
