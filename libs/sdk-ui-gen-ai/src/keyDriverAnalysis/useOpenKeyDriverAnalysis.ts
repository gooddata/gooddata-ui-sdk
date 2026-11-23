// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { type IDrillEvent } from "@gooddata/sdk-ui";
import { type IKdaDefinition } from "@gooddata/sdk-ui-dashboard";

import { useGenAiDispatcher } from "../hooks/useGenAiDispatcher.js";
import { setKeyDriverAnalysisAction } from "../store/chatWindow/chatWindowSlice.js";
import {
    storeKdaReturnFocusFromActiveElement,
    storeKdaReturnFocusFromDrillContext,
    storeKdaReturnFocusFromElement,
} from "../utils/kdaReturnFocus.js";

/**
 * Focus restoration options for opening Key Driver Analysis from a custom drill menu.
 *
 * @internal
 */
export interface IOpenKeyDriverAnalysisOptions {
    /** Original drill event, used to restore focus to a chart data point. */
    drillEvent?: IDrillEvent;
    /**
     * Element focused when the drill fired, before a menu took focus.
     * Used for table cells or when no chart data point is available.
     */
    returnFocusTo?: HTMLElement;
}

/**
 * Returns a stable callback that opens the Key Driver Analysis dialog with a definition.
 *
 * @remarks
 * Use inside {@link GenAiStore} and mount one {@link GenAiKeyDriverAnalysis} under the same store.
 * This hook requests the dialog; it does not mount it or enable the backend feature.
 * Without focus options, closing the dialog restores keyboard focus to the element active on opening.
 *
 * @returns A callback accepting the definition and optional drill focus context.
 * @internal
 */
export function useOpenKeyDriverAnalysis(): (
    definition: IKdaDefinition,
    options?: IOpenKeyDriverAnalysisOptions,
) => void {
    const dispatch = useGenAiDispatcher();

    return useCallback(
        (definition: IKdaDefinition, options?: IOpenKeyDriverAnalysisOptions) => {
            if (options?.returnFocusTo) {
                storeKdaReturnFocusFromElement(options.returnFocusTo);
            } else {
                storeKdaReturnFocusFromActiveElement();
            }
            if (options?.drillEvent && options.drillEvent.drillContext.type !== "table") {
                storeKdaReturnFocusFromDrillContext(options.drillEvent.drillContext);
            }
            dispatch(setKeyDriverAnalysisAction({ keyDriverAnalysis: definition }));
        },
        [dispatch],
    );
}
