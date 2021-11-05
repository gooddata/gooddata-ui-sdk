// (C) 2021 GoodData Corporation
import React from "react";
import { ArrowOffsets, Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { FormattedHTMLMessage } from "react-intl";
import { stringUtils } from "@gooddata/util/dist";
import cx from "classnames";

interface IDisabledConfigurationParentItemProps {
    attributeFilterTitle: string;
    itemTitle: string;
    hasConnectingAttributes: boolean;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tl" }, { align: "tc bl" }];
const bubbleArrowOffsets: ArrowOffsets = { "bc tl": [-100, 10], "tc bl": [-100, -10] };

export const DisabledConfigurationParentItem: React.FC<IDisabledConfigurationParentItemProps> = ({
    attributeFilterTitle,
    itemTitle,
    hasConnectingAttributes,
}) => {
    const itemClassNames = cx(
        "gd-list-item attribute-filter-item s-attribute-filter-dropdown-configuration-item",
        `s-${stringUtils.simplifyText(itemTitle)}`,
    );

    return (
        <BubbleHoverTrigger hideDelay={0}>
            <div className={itemClassNames}>
                <label className="input-checkbox-label configuration-item-title">
                    <input
                        type="checkbox"
                        className="input-checkbox s-checkbox"
                        readOnly={true}
                        disabled={true}
                        checked={false}
                    />
                    <span className="input-label-text">{itemTitle}</span>
                </label>
            </div>
            <Bubble
                className="bubble-primary gd-attribute-filter-dropdown-bubble s-attribute-filter-dropdown-bubble"
                alignPoints={bubbleAlignPoints}
                arrowOffsets={bubbleArrowOffsets}
            >
                {hasConnectingAttributes ? (
                    <div>
                        <FormattedHTMLMessage
                            id="attributesDropdown.filterConfiguredMessage"
                            values={{
                                childTitle: attributeFilterTitle,
                                parentTitle: itemTitle,
                            }}
                        />
                    </div>
                ) : (
                    <div>
                        <FormattedHTMLMessage
                            id="attributesDropdown.noConnectionMessage"
                            values={{
                                childTitle: attributeFilterTitle,
                                parentTitle: itemTitle,
                            }}
                        />
                    </div>
                )}
            </Bubble>
        </BubbleHoverTrigger>
    );
};
