// (C) 2021-2026 GoodData Corporation

import { type IEvent } from "../eventing/EventContext.js";
import { EventCategories, Events } from "../eventing/events.js";

function metricTooltipDisplayedEvent(): IEvent {
    return {
        action: Events.metricTooltipDisplayed,
        category: EventCategories.metricList,
    };
}

function userClickOnMetricInTooltipEvent(): IEvent {
    return {
        action: Events.metricOpenFromTooltip,
        category: EventCategories.metricList,
    };
}

export const events = {
    metricTooltipDisplayedEvent,
    userClickOnMetricInTooltipEvent,
};
