// (C) 2026 GoodData Corporation

/**
 * Returns true when OS-level reduced motion preference is active.
 *
 * @internal
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) {
        return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
