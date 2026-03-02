// (C) 2025-2026 GoodData Corporation

import { type ReactElement, type ReactNode, memo, useId } from "react";

import cx from "classnames";

interface ILegendGroupContainerProps {
    variantClassName: string;
    title?: string;
    isFocusable?: boolean;
    useFocusTarget?: boolean;
    children: ReactNode;
}

/**
 * Shared semantic wrapper for enhanced legend groups.
 *
 * Keeps role/label/focusability behavior consistent across group variants.
 */
export const LegendGroupContainer = memo(function LegendGroupContainer({
    variantClassName,
    title,
    isFocusable = false,
    useFocusTarget = false,
    children,
}: ILegendGroupContainerProps): ReactElement {
    const titleId = useId();
    const groupClassName = cx(
        "gd-geo-multi-layer-legend__group",
        variantClassName,
        isFocusable && "gd-geo-multi-layer-legend__group--focusable",
    );

    const content = (
        <>
            {title ? (
                <div id={titleId} className="gd-geo-multi-layer-legend__group-title">
                    {title}
                </div>
            ) : null}
            {children}
        </>
    );

    return (
        <div
            className={groupClassName}
            role="group"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={isFocusable ? 0 : undefined}
        >
            {useFocusTarget ? (
                <div className="gd-geo-multi-layer-legend__group-focus-target">{content}</div>
            ) : (
                content
            )}
        </div>
    );
});
