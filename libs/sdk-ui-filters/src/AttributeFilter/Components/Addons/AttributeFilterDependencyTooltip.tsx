// (C) 2023-2025 GoodData Corporation

import { ReactNode } from "react";

import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IAttributeFilterDependencyTooltipProps {
    tooltipContent: ReactNode;
}

/**
 * @internal
 */
export function AttributeFilterDependencyTooltip({ tooltipContent }: IAttributeFilterDependencyTooltipProps) {
    const BoldHyperlinkIcon = Icon["BoldHyperlink"];

    return (
        <span className="gd-attribute-filter-dropdown-button-icon-tooltip">
            <BubbleHoverTrigger>
                <BoldHyperlinkIcon width={12} height={16} />
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
