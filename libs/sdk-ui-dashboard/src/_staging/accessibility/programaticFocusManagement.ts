// (C) 2025 GoodData Corporation

/**
 * Programmatically focuses an element that isn't normally in the tab order,
 * then cleans up the tabindex when focus moves away.
 *
 * @internal
 */
export const programaticFocusManagement = (element: HTMLElement) => {
    element.tabIndex = -1;
    element.focus();

    const handleBlur = () => {
        element.removeAttribute("tabindex");
    };
    element.addEventListener("blur", handleBlur, { once: true });
};
