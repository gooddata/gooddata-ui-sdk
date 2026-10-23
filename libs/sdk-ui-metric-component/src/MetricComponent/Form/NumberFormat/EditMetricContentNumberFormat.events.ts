// (C) 2021-2026 GoodData Corporation

import { type IEvent } from "../../../shared/eventing/EventContext.js";
import { EventCategories, Events } from "../../../shared/eventing/events.js";

function metricFormatChangedEvent(format: string): IEvent {
    return {
        action: Events.metricFormatChanged,
        category: EventCategories.metricComponent,
        label: format,
    };
}

export const events = {
    metricFormatChangedEvent,
};
