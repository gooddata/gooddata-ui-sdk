// (C) 2022-2025 GoodData Corporation
import { useEffect, useState } from "react";

import { EXPORT_VIS_WARNING_MINIMAL_FONT_SIZE } from "../const.js";

/**
 * @internal
 *
 * This hook is used to validate the minimal size of a component.
 */
export function useMinimalSizeValidation(minimalWidth?: number, minimalHeight?: number, loading?: boolean) {
    const [content, setContent] = useState<HTMLDivElement | null>(null);
    const [isTooSmall, setIsTooSmall] = useState(false);
    const [fontSize, setFontSize] = useState(1);

    useEffect(() => {
        // Disable validation if minimalWidth or minimalHeight is not provided
        if (!minimalWidth || !minimalHeight || !content) {
            return;
        }

        const { offsetWidth, offsetHeight } = content;

        // Disable validation if content is not rendered yet
        if (!offsetWidth || !offsetHeight) {
            return;
        }

        if (offsetHeight < minimalHeight || offsetWidth < minimalWidth) {
            setIsTooSmall(true);
            // Calculate font size based on the content size, minimal size is defined as const
            const size = Math.max(
                Math.min(offsetHeight / minimalHeight, offsetWidth / minimalWidth),
                EXPORT_VIS_WARNING_MINIMAL_FONT_SIZE,
            );
            setFontSize(size);
        }
    }, [content, minimalHeight, minimalWidth, loading]);

    return { setContent, isTooSmall, fontSize };
}
