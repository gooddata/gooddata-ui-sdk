// (C) 2021-2026 GoodData Corporation

import { type IEvent } from "../../shared/eventing/EventContext.js";
import { EventCategories, Events } from "../../shared/eventing/events.js";

function metricNameCreatedEvent(): IEvent {
    return {
        action: Events.metricNameCreated,
        category: EventCategories.metricComponent,
    };
}

function metricIdCreatedEvent(): IEvent {
    return {
        action: Events.metricIdCreated,
        category: EventCategories.metricComponent,
    };
}

function metricIdEditEvent(): IEvent {
    return {
        action: Events.metricIdEdit,
        category: EventCategories.metricComponent,
    };
}

function metricDescriptionAddedEvent(): IEvent {
    return {
        action: Events.metricDescriptionAdded,
        category: EventCategories.metricComponent,
    };
}

export const events = {
    metricNameCreatedEvent,
    metricIdCreatedEvent,
    metricIdEditEvent,
    metricDescriptionAddedEvent,
};
