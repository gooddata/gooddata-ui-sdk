// (C) 2019-2026 GoodData Corporation

import { useCallback, useLayoutEffect, useState } from "react";

import { throttle } from "lodash-es";

/** The part of the window the dropdown sizing reads — a test can hand in a stand-in. */
export interface IDropdownContextWindow {
    innerHeight: number;
    addEventListener(type: string, listener: () => void): void;
    removeEventListener(type: string, listener: () => void): void;
}

export const useDropdownHeight = (
    buttonNode: Element,
    dropdownMinHeight: number,
    dropdownMaxHeight: number,
    dropdownOffsetFromButton: number,
    windowPadding: number,
    contextWindow: IDropdownContextWindow,
) => {
    const [dialogHeight, setDialogHeight] = useState(0);

    const updateHeight = useCallback(() => {
        const { top: buttonTop, height: buttonHeight } = buttonNode.getBoundingClientRect();

        const spaceAboveButton = buttonTop - dropdownOffsetFromButton - windowPadding;
        const spaceBellowButton =
            contextWindow.innerHeight - (buttonTop + buttonHeight + dropdownOffsetFromButton + windowPadding);
        const desiredHeight = Math.max(spaceAboveButton, spaceBellowButton);
        const limitedHeight = Math.min(dropdownMaxHeight, Math.max(desiredHeight, dropdownMinHeight));

        setDialogHeight(limitedHeight);
    }, [
        buttonNode,
        contextWindow.innerHeight,
        dropdownMaxHeight,
        dropdownMinHeight,
        dropdownOffsetFromButton,
        windowPadding,
    ]);

    const updateHeightThrottled = throttle(updateHeight, 100);

    useLayoutEffect(() => {
        contextWindow.addEventListener("resize", updateHeightThrottled);
        contextWindow.addEventListener("scroll", updateHeightThrottled);
        updateHeight();
        return () => {
            contextWindow.removeEventListener("resize", updateHeightThrottled);
            contextWindow.removeEventListener("scroll", updateHeightThrottled);
        };
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return dialogHeight;
};
