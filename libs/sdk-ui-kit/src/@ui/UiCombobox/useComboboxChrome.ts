// (C) 2026 GoodData Corporation

import { type RefObject, useCallback, useMemo, useRef, useState } from "react";

import type { IUiComboboxState } from "./types.js";

type IUseComboboxChromeReturn = Pick<
    IUiComboboxState,
    "isOpen" | "setIsOpen" | "activeIndex" | "setActiveIndex" | "anchorRef" | "registerItemRef"
> & {
    /** Open the popup if needed and move highlight by `delta`, wrapping at `total`. */
    focusByDelta: (delta: 1 | -1, total: number) => void;
};

/** @internal */
export function useComboboxChrome(): IUseComboboxChromeReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const anchorRef = useRef<HTMLElement | null>(null) as RefObject<HTMLElement | null>;
    const itemRefs = useRef<Array<HTMLElement | null>>([]);
    // Target index for when the scroll request runs before the item mounts.
    const pendingScrollIndexRef = useRef<number | null>(null);

    const scrollIndexIntoView = useCallback((index: number | null) => {
        if (index == null) {
            pendingScrollIndexRef.current = null;
            return;
        }
        const node = itemRefs.current[index];
        if (node) {
            pendingScrollIndexRef.current = null;
            node.scrollIntoView({ block: "nearest" });
        } else {
            pendingScrollIndexRef.current = index;
        }
    }, []);

    const registerItemRef = useCallback((node: HTMLElement | null, index: number) => {
        itemRefs.current[index] = node;
        if (node != null && pendingScrollIndexRef.current === index) {
            pendingScrollIndexRef.current = null;
            node.scrollIntoView({ block: "nearest" });
        }
    }, []);

    const focusByDelta = useCallback(
        (delta: 1 | -1, total: number) => {
            if (total === 0) {
                setIsOpen(true);
                return;
            }
            // When opening from a closed state, jump to the first / last item.
            if (!isOpen) {
                setIsOpen(true);
                const next = delta === 1 ? 0 : total - 1;
                setActiveIndex(next);
                scrollIndexIntoView(next);
                return;
            }
            // Clamp on read so a stale activeIndex from a shrunken list still
            // produces a sensible wrap.
            const current = activeIndex == null ? null : Math.min(activeIndex, total - 1);
            const next = current == null ? (delta === 1 ? 0 : total - 1) : (current + delta + total) % total;
            setActiveIndex(next);
            scrollIndexIntoView(next);
        },
        [isOpen, activeIndex, scrollIndexIntoView],
    );

    return useMemo(
        () => ({
            isOpen,
            setIsOpen,
            activeIndex,
            setActiveIndex,
            anchorRef,
            registerItemRef,
            focusByDelta,
        }),
        [isOpen, activeIndex, anchorRef, registerItemRef, focusByDelta],
    );
}
