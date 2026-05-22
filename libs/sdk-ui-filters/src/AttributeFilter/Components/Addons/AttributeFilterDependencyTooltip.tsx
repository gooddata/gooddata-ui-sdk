// (C) 2023-2026 GoodData Corporation

import { type ReactNode } from "react";

import { Bubble, BubbleHoverTrigger, IconBoldHyperlink } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IAttributeFilterDependencyTooltipProps {
    tooltipContent: ReactNode;
    /**
     * Accessible label for the dependency icon wrapper. Already-localized string announced
     * by screen readers in place of the visible icon.
     */
    ariaLabel?: string;
}

/**
 * @internal
 */
export function AttributeFilterDependencyTooltip({
    tooltipContent,
    ariaLabel,
}: IAttributeFilterDependencyTooltipProps) {
    return (
        <span className="gd-attribute-filter-dropdown-button-icon-tooltip">
            <BubbleHoverTrigger>
                <IconBoldHyperlink width={12} height={16} ariaLabel={ariaLabel} />
                <Bubble
                    arrowOffsets={{ "bc tl": [-12, 9], "bc tr": [12, 9] }}
                    alignPoints={[{ align: "bc tl" }, { align: "bc tr" }]}
                >
                    <div className="gd-attribute-filter-dropdown-button-icon-tooltip__content">
                        {tooltipContent}
                    </div>
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
}
