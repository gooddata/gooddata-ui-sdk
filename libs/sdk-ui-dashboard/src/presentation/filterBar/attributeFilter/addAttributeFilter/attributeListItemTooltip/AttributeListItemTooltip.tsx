// (C) 2023-2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { type ICatalogAttribute, isComputedAttributeRef } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { useAttributeDataSet } from "../../dashboardDropdownBody/configuration/hooks/useAttributeDataSet.js";
import { useAttributeElements } from "../../dashboardDropdownBody/configuration/hooks/useAttributeElements.js";
import { useComputedAttributeExpression } from "../../dashboardDropdownBody/configuration/hooks/useComputedAttributeExpression.js";

import { AttributeListItemTooltipContent } from "./AttributeListItemTooltipContent.js";

const ATTR_ELEMENTS_LIMIT: number = 5;

const bubbleAlignPoints: IAlignPoint[] = [
    { align: "tr tl", offset: { x: 0, y: -50 } },
    { align: "tl tr", offset: { x: -170, y: -80 } },
];

interface IAttributeListItemTooltipProps {
    item: ICatalogAttribute;
}

/**
 * @internal
 */
export function AttributeListItemTooltip({ item }: IAttributeListItemTooltipProps): ReactNode {
    const [isHover, setIsHover] = useState<boolean>(false);
    const { attributeElements, attributesElementsLoading } = useAttributeElements(
        item.defaultDisplayForm.ref,
        ATTR_ELEMENTS_LIMIT,
        isHover,
    );
    // a computed attribute belongs to no dataset and additionally shows its MAQL definition,
    // after the values
    const isComputedAttribute = isComputedAttributeRef(item.attribute.ref);
    const { attributeDataSet, attributesDataSetLoading } = useAttributeDataSet(
        item.attribute.ref,
        isHover && !isComputedAttribute,
    );
    const { expressionTokens, expressionTokensLoading } = useComputedAttributeExpression(
        item.attribute.ref,
        isHover && isComputedAttribute,
    );

    return (
        <div>
            <BubbleHoverTrigger
                showDelay={0}
                hideDelay={0}
                eventsOnBubble
                className="gd-attribute-item-tooltip-icon"
            >
                <span
                    onMouseEnter={() => setIsHover(true)}
                    className="gd-icon-circle-question gd-list-item-tooltip-icon s-attribute-dropdown-list-item-tooltip"
                />
                <Bubble
                    className="gd-attribute-dropdown-list-item-details s-attribute-filter-details-bubble"
                    alignPoints={bubbleAlignPoints}
                    arrowStyle={{ display: "none" }}
                >
                    <AttributeListItemTooltipContent
                        item={item}
                        hideDataSet={isComputedAttribute}
                        attributesDataSetLoading={attributesDataSetLoading}
                        attributesElementsLoading={attributesElementsLoading}
                        attributeDataSet={attributeDataSet}
                        attributeElements={attributeElements}
                        expressionTokens={isComputedAttribute ? expressionTokens : undefined}
                        expressionTokensLoading={isComputedAttribute ? expressionTokensLoading : undefined}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}
