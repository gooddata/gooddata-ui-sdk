// (C) 2025 GoodData Corporation

/**
 * Combines the default legacy class with any custom classes
 * @internal
 */
export const combineIconClasses = (customClassName?: string): string => {
    return customClassName ? `gd-icon-legacy ${customClassName}` : "gd-icon-legacy";
};
