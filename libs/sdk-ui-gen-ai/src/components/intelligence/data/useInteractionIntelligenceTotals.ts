// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useSelector } from "react-redux";

import { interactionTraceByResponseIdSelector } from "../../../store/messages/messagesSelectors.js";

import { deriveInteractionIntelligenceTotals } from "./deriveInteractionIntelligenceFromSteps.js";
import type { IInteractionIntelligenceTotals } from "./types.js";

/**
 * The turn-level totals (duration/tokens) for one response, read straight out of the stored
 * interaction steps without resolving categories or building any detail rows. `undefined` until
 * the response has steps — the inline trigger renders nothing until then.
 * @internal
 */
export function useInteractionIntelligenceTotals(
    responseId: string,
): IInteractionIntelligenceTotals | undefined {
    const trace = useSelector((state: Parameters<typeof interactionTraceByResponseIdSelector>[0]) =>
        interactionTraceByResponseIdSelector(state, responseId),
    );

    return useMemo(() => {
        if (!responseId || trace.steps.length === 0) {
            return undefined;
        }
        return deriveInteractionIntelligenceTotals(trace);
    }, [responseId, trace]);
}
