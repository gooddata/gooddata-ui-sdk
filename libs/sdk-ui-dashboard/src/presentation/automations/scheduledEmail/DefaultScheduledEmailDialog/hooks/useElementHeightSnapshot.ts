// (C) 2026 GoodData Corporation

import { type RefObject, useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Tracks a DOM node's scrollHeight, keeping the last measured value even after the node
 * unmounts. Uses a ResizeObserver to catch content-size changes while the node stays mounted,
 * not just mount/unmount transitions (e.g. a tab switch).
 *
 * @param ref - ref to the observed node
 * @param resubscribeKey - forces a resubscribe when the ref will point to a freshly mounted node
 * (e.g. a tab id gating the node's conditional rendering)
 */
export function useElementHeightSnapshot(
    ref: RefObject<HTMLElement | null>,
    resubscribeKey: unknown,
): number | undefined {
    const lastMeasuredHeightRef = useRef<number | undefined>(undefined);

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const node = ref.current;
            if (!node) {
                return () => {};
            }

            const updateHeight = () => {
                lastMeasuredHeightRef.current = node.scrollHeight;
                onStoreChange();
            };

            // Measure once unconditionally - environments without ResizeObserver still need
            // an initial (and only) measurement rather than never syncing at all.
            updateHeight();

            if (typeof ResizeObserver === "undefined") {
                return () => {};
            }

            const observer = new ResizeObserver(updateHeight);
            observer.observe(node);

            return () => {
                observer.disconnect();
            };
        },
        // resubscribeKey is not read in the body, but must force a resubscribe once the ref
        // points to a newly mounted node.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ref, resubscribeKey],
    );

    const getSnapshot = useCallback(() => lastMeasuredHeightRef.current, []);

    return useSyncExternalStore(subscribe, getSnapshot);
}
