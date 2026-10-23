// (C) 2021-2026 GoodData Corporation

import { type IEvent } from "../../../shared/eventing/EventContext.js";
import { EventCategories, Events } from "../../../shared/eventing/events.js";

function metricDefinitionCreatedEvent(): IEvent {
    return {
        action: Events.metricDefinitionCreated,
        category: EventCategories.metricComponent,
    };
}

function editorClickSuggestionDetailLinkEvent(): IEvent {
    return {
        action: Events.editorSuggestionDetailLinkClick,
        category: EventCategories.metricComponent,
    };
}

function editorToggleSuggestionDetailsEvent(): IEvent {
    return {
        action: Events.editorToggleSuggestionDetails,
        category: EventCategories.metricComponent,
    };
}

export const events = {
    metricDefinitionCreatedEvent,
    editorClickSuggestionDetailLinkEvent,
    editorToggleSuggestionDetailsEvent,
};
