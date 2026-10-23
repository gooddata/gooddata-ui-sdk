// (C) 2021-2026 GoodData Corporation

import { type AnalyticalBackendError } from "@gooddata/sdk-backend-spi";

import { type IEvent } from "../shared/eventing/EventContext.js";
import { EventCategories, Events } from "../shared/eventing/events.js";
import { errorToTrackingData } from "../shared/eventing/functions/errorToTrackingData.js";

function metricSavedAndClosedEvent(
    metricId: string,
    maql: string,
    duration: number,
    isNewMetric?: boolean,
): IEvent {
    const maqlSize = maql.length;
    const maqlLineCount = maql.split("\n").length;

    return {
        action: isNewMetric ? Events.metricSavedAndClosed : Events.metricEditedAndClosed,
        category: EventCategories.metricComponent,
        label: metricId,
        value: duration,
        variables: {
            maqlSize,
            maqlLineCount,
        },
    };
}

function metricSaveFailedEvent(error: AnalyticalBackendError): IEvent {
    const [label, value] = errorToTrackingData(error);

    return {
        action: Events.metricSaveFailed,
        category: EventCategories.metricComponent,
        label,
        value,
    };
}

function metricSaveAsNewFailedEvent(error: AnalyticalBackendError): IEvent {
    const [label, value] = errorToTrackingData(error);

    return {
        action: Events.metricSaveAsNewFailed,
        category: EventCategories.metricComponent,
        label,
        value,
    };
}

function metricClosedWithoutSaveEvent(): IEvent {
    return {
        action: Events.metricClosedWithoutSave,
        category: EventCategories.metricComponent,
    };
}

function metricDeleteClickEvent(metricId: string): IEvent {
    return {
        action: Events.metricDeleteClick,
        category: EventCategories.metricComponent,
        label: metricId,
    };
}

export const events = {
    metricSavedAndClosedEvent,
    metricSaveFailedEvent,
    metricSaveAsNewFailedEvent,
    metricClosedWithoutSaveEvent,
    metricDeleteClickEvent,
};
