// (C) 2021-2026 GoodData Corporation

import { type AnalyticalBackendError } from "@gooddata/sdk-backend-spi";

import { type IEvent } from "../shared/eventing/EventContext.js";
import { EventCategories, Events } from "../shared/eventing/events.js";
import { errorToTrackingData } from "../shared/eventing/functions/errorToTrackingData.js";

function metricDeletedEvent(metricId: string, duration: number): IEvent {
    return {
        action: Events.metricDeleted,
        category: EventCategories.metricComponent,
        label: metricId,
        value: duration,
    };
}

function metricDeleteFailedEvent(error: AnalyticalBackendError): IEvent {
    const [label, value] = errorToTrackingData(error);

    return {
        action: Events.metricDeleteFailed,
        category: EventCategories.metricComponent,
        label,
        value,
    };
}

export const events = {
    metricDeletedEvent,
    metricDeleteFailedEvent,
};
