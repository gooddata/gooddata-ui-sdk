// (C) 2021-2026 GoodData Corporation

import { type IEvent } from "../../shared/eventing/EventContext.js";
import { EventCategories, Events } from "../../shared/eventing/events.js";

function metricSavedAsNewEvent(metricId: string, duration: number): IEvent {
    return {
        action: Events.metricSavedAsNew,
        category: EventCategories.metricComponent,
        label: metricId,
        value: duration,
    };
}

function metricConflictedIdEvent(metricId = ""): IEvent {
    return {
        action: Events.metricConflictedId,
        category: EventCategories.metricComponent,
        label: metricId,
    };
}

export const events = {
    metricSavedAsNewEvent,
    metricConflictedIdEvent,
};
