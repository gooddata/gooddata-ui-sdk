// (C) 2020-2026 GoodData Corporation

import {
    type AdInsightSavedBody,
    type GdcAdCommandType,
    GdcAdEventType,
    GdcErrorType,
    GdcEventType,
    type ICommandFailedBody,
} from "@gooddata/sdk-embedding";
import { type IInsight } from "@gooddata/sdk-model";

import { BackendToBearConvertors } from "../../convertors/index.js";
import { type IVisualization, isVisualization } from "../../typings/bear/bearTypes.js";

import { adPostEvent } from "./post_event_helper.js";

export function insightSavingInvalidState(postMessageContextId?: string): void {
    const error: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidState,
        errorMessage: "The app is not in a state to process save or save_as command",
    };
    adPostEvent(GdcEventType.AppCommandFailed, error, postMessageContextId);
}

export function insightSavingFailed(postMessageContextId?: string): void {
    const error: ICommandFailedBody = {
        errorCode: GdcErrorType.RuntimeError,
        errorMessage: "Cannot save the insight",
    };
    adPostEvent(GdcEventType.AppCommandFailed, error, postMessageContextId);
}

/**
 * Emit an event to notify outer app that the currently edited insight is saved.
 *
 * Notes:
 * - Keep the whole report object in the event data to keep backward compatibility with parent app
 */
export function insightSaved(
    availableCommands: GdcAdCommandType[],
    reportObjectForSaveEmbeddingMessage: IVisualization | IInsight,
    postMessageContextId?: string,
): void {
    let insightSavedBody: AdInsightSavedBody;

    if (isVisualization(reportObjectForSaveEmbeddingMessage)) {
        const { uri, identifier, title, tags } = reportObjectForSaveEmbeddingMessage.visualizationObject.meta;
        insightSavedBody = {
            availableCommands,
            ...reportObjectForSaveEmbeddingMessage,
            insight: {
                uri,
                identifier,
                title,
            },
            visualizationObject: {
                ...reportObjectForSaveEmbeddingMessage.visualizationObject,
                meta: {
                    ...reportObjectForSaveEmbeddingMessage.visualizationObject.meta,
                    tags: tags?.join(" "),
                },
            },
            // TODO INE: remove cast once embedding types are extended to support arbitrary and match attribute filters
        } as unknown as AdInsightSavedBody;
    } else {
        const { uri, identifier, title } = reportObjectForSaveEmbeddingMessage.insight;
        // due to backwards compability we are using this helper convertInsight instead of the one that we have in AD
        const visualizationObject = BackendToBearConvertors.convertInsight(
            reportObjectForSaveEmbeddingMessage,
            {
                allowNullValuesInAttributeFilters: true,
            },
        );

        insightSavedBody = {
            availableCommands,
            visualizationObject: {
                ...visualizationObject,
                meta: {
                    ...visualizationObject.meta,
                    tags: visualizationObject.meta.tags?.join(" "),
                },
            },
            insight: { uri, identifier, title },
            // TODO INE: remove cast once embedding types are extended to support arbitrary and match attribute filters
        } as unknown as AdInsightSavedBody;
    }

    adPostEvent(GdcAdEventType.InsightSaved, insightSavedBody, postMessageContextId);
}
