// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useSelector } from "react-redux";

import { interactionTraceByResponseIdSelector } from "../../../store/messages/messagesSelectors.js";

import { deriveInteractionIntelligenceFromSteps } from "./deriveInteractionIntelligenceFromSteps.js";
import type { IInteractionIntelligence } from "./types.js";

/**
 * The Interaction Intelligence render model for one response, or `undefined` when `enabled` is
 * false or the response has no trace. Nothing is fetched — the trace streamed in with the
 * response's own messages and is read straight out of the store.
 * @internal
 */
export function useInteractionIntelligenceData(
    responseId: string,
    enabled: boolean,
): IInteractionIntelligence | undefined {
    const trace = useSelector((state: Parameters<typeof interactionTraceByResponseIdSelector>[0]) =>
        interactionTraceByResponseIdSelector(state, responseId),
    );

    return useMemo(() => {
        if (!enabled || trace.steps.length === 0) {
            return undefined;
        }
        return deriveInteractionIntelligenceFromSteps(responseId, trace);
    }, [responseId, enabled, trace]);
}
