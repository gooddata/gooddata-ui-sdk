// (C) 2026 GoodData Corporation

import {
    type AdExportFinishedBody,
    type AdFilterContextChangedBody,
    type AdInsightChangedBody,
    type AdInsightRenderedBody,
    type AdInsightSavedBody,
    GdcAdEventType,
    GdcEventType,
    type IAdAvailableCommands,
    type ICommandFailedBody,
} from "@gooddata/sdk-embedding";

import { type IAdInsightOpenedBody } from "../postMessageApi/outgoing/open_insight_events.js";

import { type IAdOutgoingEvent } from "./hostBridge.js";

/**
 * Typed callbacks for the AD events that carry a public payload type, plus a catch-all with the raw
 * @gooddata/sdk-embedding contract payload. All fire from the same host-adapter delivery.
 */
export interface IAdEmbeddedCallbacks {
    onInsightSaved?: (data: AdInsightSavedBody, contextId?: string) => void;
    onInsightEditingCancelled?: () => void;
    onInsightOpened?: (data: IAdInsightOpenedBody) => void;
    onInsightRendered?: (data: AdInsightRenderedBody) => void;
    onInsightChanged?: (data: AdInsightChangedBody) => void;
    onClearFinished?: (data: IAdAvailableCommands, contextId?: string) => void;
    onClearInsightFinished?: (data: IAdAvailableCommands, contextId?: string) => void;
    onUndoFinished?: (data: IAdAvailableCommands, contextId?: string) => void;
    onRedoFinished?: (data: IAdAvailableCommands, contextId?: string) => void;
    onExportFinished?: (data: AdExportFinishedBody, contextId?: string) => void;
    onFilterContextChanged?: (data: AdFilterContextChangedBody) => void;
    onSetFilterContextFinished?: (data: IAdAvailableCommands, contextId?: string) => void;
    onRemoveFilterContextFinished?: (data: IAdAvailableCommands, contextId?: string) => void;
    onAppCommandFailed?: (data: ICommandFailedBody, contextId?: string) => void;
    onAttributeHierarchyModified?: () => void;
    /** Fires when AD cannot start, with the error that stopped it. */
    onError?: (error: unknown) => void;
    /** Catch-all: fires for every outgoing AD event, before the typed callback. */
    onEvent?: (event: IAdOutgoingEvent) => void;
}

/** Delivers an AD event to the catch-all callback, then to its typed callback. */
export function deliverEventToCallbacks(
    event: IAdOutgoingEvent,
    callbacks: IAdEmbeddedCallbacks | undefined,
): void {
    if (!callbacks) {
        return;
    }
    callbacks.onEvent?.(event);
    switch (event.name) {
        case GdcAdEventType.InsightSaved as string:
            // the name check IS the discriminant for the event payload
            callbacks.onInsightSaved?.(event.data as AdInsightSavedBody, event.contextId);
            break;
        case GdcAdEventType.InsightEditingCancelled as string:
            callbacks.onInsightEditingCancelled?.();
            break;
        case GdcAdEventType.InsightOpened as string:
            callbacks.onInsightOpened?.(event.data as IAdInsightOpenedBody);
            break;
        case GdcAdEventType.InsightRendered as string:
            callbacks.onInsightRendered?.(event.data as AdInsightRenderedBody);
            break;
        case GdcAdEventType.InsightChanged as string:
            callbacks.onInsightChanged?.(event.data as AdInsightChangedBody);
            break;
        case GdcAdEventType.ClearFinished as string:
            callbacks.onClearFinished?.(event.data as IAdAvailableCommands, event.contextId);
            break;
        case GdcAdEventType.ClearInsightFinished as string:
            callbacks.onClearInsightFinished?.(event.data as IAdAvailableCommands, event.contextId);
            break;
        case GdcAdEventType.UndoFinished as string:
            callbacks.onUndoFinished?.(event.data as IAdAvailableCommands, event.contextId);
            break;
        case GdcAdEventType.RedoFinished as string:
            callbacks.onRedoFinished?.(event.data as IAdAvailableCommands, event.contextId);
            break;
        case GdcAdEventType.ExportFinished as string:
            callbacks.onExportFinished?.(event.data as AdExportFinishedBody, event.contextId);
            break;
        case GdcAdEventType.FilterContextChanged as string:
            callbacks.onFilterContextChanged?.(event.data as AdFilterContextChangedBody);
            break;
        case GdcAdEventType.SetFilterContextFinished as string:
            callbacks.onSetFilterContextFinished?.(event.data as IAdAvailableCommands, event.contextId);
            break;
        case GdcAdEventType.RemoveFilterContextFinished as string:
            callbacks.onRemoveFilterContextFinished?.(event.data as IAdAvailableCommands, event.contextId);
            break;
        case GdcEventType.AppCommandFailed as string:
            callbacks.onAppCommandFailed?.(event.data as ICommandFailedBody, event.contextId);
            break;
        case GdcAdEventType.AttributeHierarchyModified as string:
            callbacks.onAttributeHierarchyModified?.();
            break;
        default:
            break;
    }
}
