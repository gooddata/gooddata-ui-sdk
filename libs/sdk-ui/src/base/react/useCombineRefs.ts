// (C) 2025 GoodData Corporation
import { useCallback, MutableRefObject } from "react";

/**
 * @internal
 */
export const useCombineRefs = <T>(
    ...refs: Array<MutableRefObject<T> | ((instance: T) => void) | undefined | null | false>
) => {
    return useCallback((instance: T) => {
        refs.forEach((ref) => {
            if (!ref) {
                return;
            }

            if (typeof ref === "function") {
                ref(instance);
            } else {
                ref.current = instance;
            }
        });
        // This is actually correct
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, refs);
};
