// (C) 2021-2026 GoodData Corporation

import { type IEvent } from "../../../shared/eventing/EventContext.js";
import { EventCategories, Events } from "../../../shared/eventing/events.js";

function howToCreateClickEvent(): IEvent {
    return {
        action: Events.howToCreateClick,
        category: EventCategories.metricComponent,
    };
}

export const events = {
    howToCreateClickEvent,
};
