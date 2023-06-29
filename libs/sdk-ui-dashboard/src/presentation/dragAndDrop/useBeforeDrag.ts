// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { handleOnGoodstrapDragEvent } from "@gooddata/sdk-ui-kit";

/**
 * Fire global goodstrap event to close overlays before DnD start,
 * sanitization of placeholders in layout is managed by components itself.
 */
const useGlobalGoodstrapEvent = () => {
    return useCallback(() => {
        handleOnGoodstrapDragEvent();
    }, []);
};

/**
 * This hook provide global goodstrap event to close overlays
 * @internal
 */
export const useBeforeDrag = () => {
    const fireGlobalEvent = useGlobalGoodstrapEvent();

    return useCallback(() => {
        fireGlobalEvent();
    }, [fireGlobalEvent]);
};
