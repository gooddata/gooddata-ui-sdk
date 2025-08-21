// (C) 2023-2025 GoodData Corporation

import React from "react";

import { Bubble, BubbleHoverTrigger, IAlignPoint, Icon } from "@gooddata/sdk-ui-kit";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl", offset: { x: 0, y: 50 } }];

/**
 * Tooltip details for the AttributeFilterDropdownButton.
 *
 * @remarks
 * It displays AttributeFilterDropdownButton tooltip details in the GoodData look and feel.
 * It displays the default title, custom title and data set title of the related attribute filter.
 *
 * @beta
 */
export function AttributeFilterButtonTooltip({ children }: { children?: React.ReactNode }) {
    return (
        <span className="gd-attribute-filter-dropdown-button-icon-tooltip">
            <BubbleHoverTrigger>
                <Icon.QuestionMark height={16} width={14} className={"s-attribute-filter-tooltip-icon"} />
                <Bubble
                    className="gd-attribute-filter-details s-attribute-filter-details-bubble"
                    alignPoints={bubbleAlignPoints}
                    arrowStyle={{ display: "none" }}
                >
                    {children}
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
}
