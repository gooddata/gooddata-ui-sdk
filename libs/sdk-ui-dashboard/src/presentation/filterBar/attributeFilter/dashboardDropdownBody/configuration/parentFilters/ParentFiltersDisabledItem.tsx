// (C) 2022 GoodData Corporation
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import React from "react";
import cx from "classnames";

import { stringUtils } from "@gooddata/util";
import { FormattedMessage } from "react-intl";

interface IParentFiltersDisabledItemProps {
    attributeFilterTitle: string;
    itemTitle: string;
    hasConnectingAttributes: boolean;
}

export const ParentFiltersDisabledItem: React.FC<IParentFiltersDisabledItemProps> = (props) => {
    const { itemTitle, attributeFilterTitle, hasConnectingAttributes } = props;

    const itemClasses = cx(
        "gd-list-item attribute-filter-item s-attribute-filter-dropdown-configuration-item",
        `s-${stringUtils.simplifyText(itemTitle)}`,
    );

    return (
        <BubbleHoverTrigger hideDelay={0}>
            <div className={itemClasses}>
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
                alignPoints={[{ align: "bc tl" }, { align: "tc bl" }]}
                arrowOffsets={{ "bc tl": [-100, 10], "tc bl": [-100, -10] }}
            >
                {hasConnectingAttributes ? (
                    <div>
                        <FormattedMessage
                            id="attributesDropdown.filterConfiguredMessage"
                            values={{
                                childTitle: attributeFilterTitle,
                                parentTitle: itemTitle,
                                // eslint-disable-next-line react/display-name
                                strong: (chunks: string) => <strong>{chunks}</strong>,
                            }}
                        />
                    </div>
                ) : (
                    <div>
                        <FormattedMessage
                            id="attributesDropdown.noConnectionMessage"
                            values={{
                                childTitle: attributeFilterTitle,
                                parentTitle: itemTitle,
                                // eslint-disable-next-line react/display-name
                                strong: (chunks: string) => <strong>{chunks}</strong>,
                            }}
                        />
                    </div>
                )}
            </Bubble>
        </BubbleHoverTrigger>
    );
};
