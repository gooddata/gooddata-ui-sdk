// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

/**
 * Props for the AttributeFilterElementsSelectItemTooltip component
 * @beta
 */
export interface IAttributeFilterElementsSelectItemTooltipProps {
    itemTitle: string;
    primaryLabelTitle?: string;
    itemPrimaryTitle?: string;
    isFocused?: boolean;
}

export const AttributeFilterElementsSelectItemTooltip: React.FC<
    IAttributeFilterElementsSelectItemTooltipProps
> = ({ itemTitle, primaryLabelTitle, itemPrimaryTitle, isFocused = false }) => (
    <div className="gd-item-title-tooltip-wrapper gd-list-item-only">
        <BubbleHoverTrigger className="gd-empty-list-item-tooltip" showDelay={0} hideDelay={0}>
            <span
                className={cx("gd-icon-circle-question gd-empty-value-tooltip-icon", {
                    "gd-icon-circle-question--isFocusedSelectItem": isFocused,
                })}
            />
            <Bubble
                className="bubble-light gd-item-title-tooltip"
                alignTo=".gd-empty-value-tooltip-icon"
                alignPoints={[
                    { align: "cr cl", offset: { x: 0, y: 0 } },
                    { align: "cr bl", offset: { x: 0, y: 0 } },
                    { align: "cr tl", offset: { x: 0, y: 0 } },
                    { align: "cl cr", offset: { x: 0, y: 0 } },
                    { align: "cl br", offset: { x: 0, y: 0 } },
                    { align: "cl tr", offset: { x: 0, y: 0 } },
                ]}
                arrowStyle={{ display: "none" }}
            >
                <p>{itemTitle}</p>
                {primaryLabelTitle && itemPrimaryTitle ? (
                    <>
                        <h4>{primaryLabelTitle}</h4>
                        <p>{itemPrimaryTitle}</p>
                    </>
                ) : null}
            </Bubble>
        </BubbleHoverTrigger>
    </div>
);
