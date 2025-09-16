// (C) 2025 GoodData Corporation

import { MutableRefObject, useCallback } from "react";

import { useAutoupdateRef } from "./useAutoupdateRef.js";

/**
 * @internal
 */
export const useCombineRefs = <T>(
    ...refs: Array<MutableRefObject<T> | ((instance: T) => void) | undefined | null | false>
) => {
    const refsRef = useAutoupdateRef(refs);

    return useCallback(
        (instance: T) => {
            refsRef.current.forEach((ref) => {
                if (!ref) {
                    return;
                }

                if (typeof ref === "function") {
                    ref(instance);
                } else {
                    ref.current = instance;
                }
            });
        },
        [refsRef],
    );
};
