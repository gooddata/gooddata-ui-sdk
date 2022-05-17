// (C) 2021-2022 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

export const AttributeDropdownItemsFilteredBody: React.FC<{
    parentFilterTitles: string[];
    showItemsFilteredMessage: boolean;
}> = ({ parentFilterTitles, showItemsFilteredMessage }) => {
    if (!parentFilterTitles || !showItemsFilteredMessage) {
        return null;
    }

    return (
        <div className="gd-attribute-filter-dropdown-items-filtered__next s-attribute-filter-dropdown-items-filtered">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className="gd-filtered-message__next">
                    <FormattedMessage id="attributesDropdown.itemsFiltered" />
                    <span className="gd-icon-circle-question" />
                </div>
                <Bubble
                    className={`bubble-primary gd-attribute-filter-dropdown-bubble__next s-attribute-filter-dropdown-bubble`}
                    alignPoints={[{ align: "bc tl" }, { align: "tc bl" }]}
                    arrowOffsets={{ "bc tl": [-100, 10], "tc bl": [-100, -10] }}
                >
                    <FormattedMessage
                        id="attributesDropdown.itemsFiltered.tooltip"
                        values={{
                            filters: parentFilterTitles.join(", "),
                            strong: (chunks: string) => <strong>{chunks}</strong>,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
