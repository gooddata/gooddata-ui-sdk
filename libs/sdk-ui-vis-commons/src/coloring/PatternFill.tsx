// (C) 2025 GoodData Corporation

import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { type IPatternOptionsObject } from "./types.js";

/**
 * @internal
 */
export interface IPatternFillProps {
    patternFill: IPatternOptionsObject;
}

/**
 * @internal
 */
export function PatternFill({ patternFill }: IPatternFillProps) {
    const patternId = useIdPrefixed("palette-item-pattern");
    const { path, opacity, width, height } = patternFill;
    const hasStroke = typeof path.strokeWidth === "number" && path.strokeWidth > 0;
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ display: "block", position: "absolute", inset: 0 }}
        >
            <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width={width} height={height}>
                    <path
                        d={path.d}
                        stroke={hasStroke ? "currentColor" : "none"}
                        fill={hasStroke ? "none" : "currentColor"}
                        opacity={opacity}
                        strokeWidth={path.strokeWidth}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
    );
}
