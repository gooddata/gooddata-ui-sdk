// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function WaterfallView({ color, className, width = 15, height = 15, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <rect y="9" width="3" height="4" fill={color ?? "#B0BECA"} fillOpacity="0.4" />
            <rect x="4" y="5" width="3" height="4" fill={color ?? "#B0BECA"} fillOpacity="0.4" />
            <rect x="8" width="3" height="5" fill={color ?? "#B0BECA"} fillOpacity="0.4" />
            <rect x="12" width="3" height="13" fill={color ?? "#B0BECA"} fillOpacity="0.4" />
            <rect y="13" width="15" height="2" fill={color ?? "#B0BECA"} />
        </svg>
    );
}
