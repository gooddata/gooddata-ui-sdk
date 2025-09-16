// (C) 2024-2025 GoodData Corporation

import { CSSProperties } from "react";

/**
 * @internal
 */
export interface ISeparatorLineProps {
    /**
     * Margin top
     */
    mT?: number;

    /**
     * Margin right
     */
    mR?: number;

    /**
     * Margin bottom
     */
    mB?: number;

    /**
     * Margin left
     */
    mL?: number;

    /**
     * Padding top
     */
    pT?: number;

    /**
     * Padding right
     */
    pR?: number;

    /**
     * Padding bottom
     */
    pB?: number;

    /**
     * Padding left
     */
    pL?: number;
    /**
     * Margin
     */
    m?: number;

    /**
     * Padding
     */
    p?: number;

    /**
     * Height of the separator
     */
    height?: number;
}

/**
 * @internal
 */
export function SeparatorLine({
    mT: marginTop,
    mR: marginRight,
    mB: marginBottom,
    mL: marginLeft,
    pT: paddingTop,
    pR: paddingRight,
    pB: paddingBottom,
    pL: paddingLeft,
    m = 0,
    p = 0,
    height = 1,
}: ISeparatorLineProps) {
    const wrapperStyle: CSSProperties = {
        margin: m,
        padding: p,
        marginTop: marginTop,
        marginRight: marginRight,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        paddingTop: paddingTop,
        paddingRight: paddingRight,
        paddingBottom: paddingBottom,
        paddingLeft: paddingLeft,
    };

    const lineStyle: CSSProperties = {
        height,
    };

    return (
        <div className="gd-separator" style={wrapperStyle}>
            <div className="gd-separator-line" style={lineStyle} />
        </div>
    );
}
