// (C) 2024-2025 GoodData Corporation

/**
 * Detects if Windows High Contrast Mode is active
 * @returns boolean indicating if high contrast mode is active
 */
export const isHighContrastMode = (): boolean => {
    if (typeof window === "undefined" || !window.matchMedia) {
        return false;
    }

    try {
        return window.matchMedia("(forced-colors: active)").matches;
    } catch {
        return false;
    }
};
