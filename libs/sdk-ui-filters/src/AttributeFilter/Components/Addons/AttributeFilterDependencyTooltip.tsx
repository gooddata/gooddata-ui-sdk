// (C) 2023 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble, Icon } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IAttributeFilterDependencyTooltipProps {
    tooltipContent: React.ReactNode;
}

/**
 * @internal
 */
export const AttributeFilterDependencyTooltip: React.FC<IAttributeFilterDependencyTooltipProps> = ({
    tooltipContent,
}) => {
    return (
        <span className="gd-attribute-filter-dropdown-button-icon-tooltip">
            <BubbleHoverTrigger>
                <Icon.BoldHyperlink width={12} height={16} />
                <Bubble
                    arrowOffsets={{ "bc tl": [-12, 9], "bc tr": [12, 9] }}
                    alignPoints={[{ align: "bc tl" }, { align: "bc tr" }]}
                >
                    {tooltipContent}
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
};
