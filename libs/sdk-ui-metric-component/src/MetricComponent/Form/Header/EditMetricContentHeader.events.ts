// (C) 2021-2026 GoodData Corporation

import { type IEvent } from "../../../shared/eventing/EventContext.js";
import { EventCategories, Events } from "../../../shared/eventing/events.js";

function metricUsageClick(): IEvent {
    return {
        action: Events.metricUsageClick,
        category: EventCategories.metricComponent,
    };
}

export const events = {
    metricUsageClick,
};
