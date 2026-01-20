// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type MessageDescriptor, defineMessages } from "react-intl";

import { useEventToastMessage } from "../../../_staging/sharedHooks/useEventToastMessage.js";
import {
    type IDashboardCrossFilteringResolved,
    isDashboardCrossFilteringResolved,
} from "../../../model/index.js";

const crossFilterMessages: Record<string, MessageDescriptor> = defineMessages({
    crossFilterSuccess: {
        id: "dashboard.crossFilter.success",
    },
});

export function useCrossFilteringMessages() {
    const getCrossFilterMessageParameters = useCallback(
        (event: IDashboardCrossFilteringResolved) => ({
            values: { count: event.payload.filters.length },
        }),
        [],
    );

    // Listen for cross-filtering success events and show toast
    useEventToastMessage(
        "success",
        isDashboardCrossFilteringResolved,
        crossFilterMessages["crossFilterSuccess"],
        getCrossFilterMessageParameters,
    );
}
