// (C) 2021 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl";

export interface IItemsFilteredMessageProps {
    parentFilterTitles: ReadonlyArray<string>;
}

export const AllItemsFilteredMessage: React.FC<IItemsFilteredMessageProps> = ({ parentFilterTitles }) => {
    return (
        <div className="gd-attribute-filter-dropdown-all-items-filtered s-attribute-filter-dropdown-all-items-filtered">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className="gd-filtered-message">
                    <FormattedMessage id="attributesDropdown.allItemsFiltered" />
                    <span className="gd-icon-circle-question" />
                </div>
                <Bubble
                    className={`bubble-primary gd-attribute-filter-dropdown-bubble s-attribute-filter-dropdown-bubble`}
                    alignPoints={[{ align: "bc tc" }]}
                    arrowOffsets={{ "bc tc": [0, 15] }}
                >
                    <FormattedHTMLMessage
                        id="attributesDropdown.itemsFiltered.tooltip"
                        values={{ filters: parentFilterTitles.join(", ") }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
