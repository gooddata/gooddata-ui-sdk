// (C) 2026 GoodData Corporation

import { type RefObject, useCallback, useMemo, useRef, useState } from "react";

import type { IUiComboboxOption, IUiComboboxState } from "./types.js";

type IUseComboboxChromeReturn = Pick<
    IUiComboboxState,
    "isOpen" | "setIsOpen" | "activeIndex" | "setActiveIndex" | "anchorRef" | "registerItemRef"
> & {
    /** The currently highlighted option, or undefined. */
    activeOption: IUiComboboxOption | undefined;
    /** Open the popup if needed and move the highlight by `delta`, wrapping around. */
    focusByDelta: (delta: 1 | -1) => void;
};

/**
 * Owns popup open/close, highlight, and scroll. The highlight is tracked by
 * option **id**, not index: when the option list changes (async results arrive,
 * a row is filtered out) a highlighted row that's gone simply resolves to no
 * index, so the highlight can never point at a different row than the user
 * navigated to. Callers pass the current `options` so the id ⇄ index mapping
 * and `focusByDelta` wrapping stay in sync with what's rendered.
 *
 * @internal
 */
export function useComboboxChrome(options: IUiComboboxOption[]): IUseComboboxChromeReturn {
    const [isOpen, setIsOpenState] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    // A highlight only has meaning while the popup is open, so closing always
    // drops it — reopening then starts fresh. This is the single point that
    // keeps a stale highlight from surviving Escape / blur / reset and being
    // Enter-selected on the next open.
    const setIsOpen = useCallback((open: boolean) => {
        setIsOpenState(open);
        if (!open) {
            setActiveId(null);
        }
    }, []);

    const anchorRef = useRef<HTMLElement | null>(null) as RefObject<HTMLElement | null>;
    const itemRefs = useRef<Array<HTMLElement | null>>([]);
    // Target index for when the scroll request runs before the item mounts.
    const pendingScrollIndexRef = useRef<number | null>(null);

    const activeIndex = activeId == null ? null : options.findIndex((o) => o.id === activeId);
    // findIndex returns -1 for a vanished row; surface that as "no highlight".
    const safeActiveIndex = activeIndex != null && activeIndex >= 0 ? activeIndex : null;
    const activeOption = safeActiveIndex == null ? undefined : options[safeActiveIndex];

    const scrollIndexIntoView = useCallback((index: number) => {
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

    const setActiveIndex = useCallback(
        (index: number | null) => setActiveId(index == null ? null : (options[index]?.id ?? null)),
        [options],
    );

    const focusByDelta = useCallback(
        (delta: 1 | -1) => {
            const total = options.length;
            if (total === 0) {
                setIsOpen(true);
                return;
            }
            // Resolve against the current list so a stale/removed highlight still
            // produces a sensible next target.
            const current = safeActiveIndex;
            const next =
                !isOpen || current == null
                    ? delta === 1
                        ? 0
                        : total - 1
                    : (current + delta + total) % total;
            setIsOpen(true);
            setActiveId(options[next]?.id ?? null);
            scrollIndexIntoView(next);
        },
        [isOpen, options, safeActiveIndex, scrollIndexIntoView, setIsOpen],
    );

    return useMemo(
        () => ({
            isOpen,
            setIsOpen,
            activeIndex: safeActiveIndex,
            activeOption,
            setActiveIndex,
            anchorRef,
            registerItemRef,
            focusByDelta,
        }),
        [
            isOpen,
            setIsOpen,
            safeActiveIndex,
            activeOption,
            setActiveIndex,
            anchorRef,
            registerItemRef,
            focusByDelta,
        ],
    );
}
