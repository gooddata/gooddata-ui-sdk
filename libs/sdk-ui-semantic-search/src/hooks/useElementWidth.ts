// (C) 2007-2024 GoodData Corporation
import * as React from "react";

/**
 * List and DropdownList components require explicit width to render correctly.
 * This hook measures the width of the input element and returns it.
 * There are no UTs for this because jsdom does not compute element dimensions.
 * @internal
 */
export const useElementWidth = (): [React.RefCallback<HTMLElement>, number] => {
    const [width, setWidth] = React.useState<number>(0);
    const observer = React.useMemo(() => {
        return new ResizeObserver((entries) => {
            // We're always listening to one element at a time
            const entry = entries[0];
            if (entry) {
                setWidth((entry.target as HTMLElement).offsetWidth);
            }
        });
    }, []);
    const elementRef = React.useCallback(
        (element: HTMLElement | null) => {
            if (!element) {
                // React will call the ref with null when unmounting
                observer.disconnect();
                return;
            }

            // Capture width and assign a resize observer
            setWidth(element.offsetWidth);
            observer.observe(element);
        },
        [observer],
    );

    return [elementRef, width];
};
