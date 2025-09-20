// (C) 2025 GoodData Corporation

import { ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";

import { debounce, isNumber } from "lodash-es";

/**
 * @internal
 */
export interface IResponsiveTextProps {
    tagName?: "div" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "dt";
    tagClassName?: string;
    windowResizeRefreshDelay?: number;
    title?: string;
    window?: {
        addEventListener: Window["addEventListener"];
        getComputedStyle: Window["getComputedStyle"];
        removeEventListener: Window["removeEventListener"];
    };
    children?: ReactNode;
    minFontSize?: number;
    /**
     * Whether to include height in font size calculation. When true, font size will be adjusted
     * based on both width and height of the container. Default is false.
     */
    includeHeightCheck?: boolean;
}

/**
 * @internal
 */
export function ResponsiveText({
    tagName: Tag = "div",
    tagClassName,
    title,
    children,
    windowResizeRefreshDelay = 50,
    window: windowInstance = window,
    minFontSize,
    includeHeightCheck = false,
}: IResponsiveTextProps) {
    const [fontSize, setFontSize] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const adjustFontSize = useCallback(() => {
        if (!containerRef.current) {
            return;
        }

        const currentStyle = windowInstance.getComputedStyle(containerRef.current, null);
        const currentFontSize = parseFloat(currentStyle.fontSize);

        if (isNumber(currentFontSize)) {
            const { scrollWidth, scrollHeight } = containerRef.current;
            const { width, height } = containerRef.current.getBoundingClientRect();

            const widthRatio = Math.round(width) / scrollWidth;
            let ratio = widthRatio;

            if (includeHeightCheck) {
                const heightRatio = Math.round(height) / scrollHeight;
                // Use the smaller ratio to ensure text fits in both dimensions
                ratio = Math.min(widthRatio, heightRatio);
            }

            const size = Math.floor(currentFontSize * ratio);

            setFontSize(minFontSize ? Math.max(size, minFontSize) : size);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [includeHeightCheck]);

    useLayoutEffect(() => {
        const handleWindowResize = debounce(() => {
            // reset font size so that we can read the default fontSize in adjustFontSize later
            setFontSize(null);
        }, windowResizeRefreshDelay);

        windowInstance.addEventListener("resize", handleWindowResize);

        return () => windowInstance.removeEventListener("resize", handleWindowResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowResizeRefreshDelay]);

    useLayoutEffect(() => {
        // reset font size so that we can read the default fontSize in adjustFontSize later
        setFontSize(null);
    }, [children, tagClassName]);

    useLayoutEffect(() => {
        if (!fontSize) {
            // then adjust the font again
            adjustFontSize();
        }
    }, [fontSize, adjustFontSize]);

    return (
        <Tag
            className={tagClassName}
            ref={containerRef}
            style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
            title={title}
        >
            {children}
        </Tag>
    );
}
