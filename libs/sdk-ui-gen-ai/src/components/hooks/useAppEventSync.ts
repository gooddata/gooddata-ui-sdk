// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

import {
    type IAiAssistantAppEvent,
    isAiAssistantDashboardSavedAppEvent,
    isAiAssistantPublisherDocumentSavedAppEvent,
} from "@gooddata/sdk-pluggable-application-model";

import { dashboardSavedAction, publisherDocumentSavedAction } from "../../store/messages/messagesSlice.js";

/**
 * An application event delivered to the chat. `seq` grows with every delivery, so the same event sent
 * again is acted on again and the chat knows which deliveries it has seen.
 */
export interface ISequencedAppEvent {
    seq: number;
    event: IAiAssistantAppEvent;
}

type AppEventAction =
    | ReturnType<typeof publisherDocumentSavedAction>
    | ReturnType<typeof dashboardSavedAction>;

function toAction(event: IAiAssistantAppEvent): AppEventAction | undefined {
    if (isAiAssistantPublisherDocumentSavedAppEvent(event)) {
        return publisherDocumentSavedAction(event.payload);
    }
    if (isAiAssistantDashboardSavedAppEvent(event)) {
        return dashboardSavedAction(event.payload);
    }
    return undefined;
}

/**
 * Tells the chat store about the events of the application the chat runs beside, once per delivery
 * and in delivery order. Events the chat does not know are ignored.
 */
export function useAppEventSync(
    dispatch: ((action: AppEventAction) => void) | null,
    appEvents: ReadonlyArray<ISequencedAppEvent>,
) {
    const lastSeq = useRef(0);

    useEffect(() => {
        if (!dispatch) {
            return;
        }
        for (const { seq, event } of appEvents) {
            if (seq <= lastSeq.current) {
                continue;
            }
            lastSeq.current = seq;
            const action = toAction(event);
            if (action) {
                dispatch(action);
            }
        }
    }, [dispatch, appEvents]);
}
