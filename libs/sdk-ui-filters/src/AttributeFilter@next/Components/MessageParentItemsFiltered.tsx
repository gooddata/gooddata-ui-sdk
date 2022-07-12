// (C) 2021-2022 GoodData Corporation
import React, { useMemo } from "react";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { IMessageParentItemsFilteredProps } from "./types";

const ALIGN_POINTS = [{ align: "bc tl" }, { align: "tc bl" }];
const ARROW_OFFSETS = { "bc tl": [-100, 10], "tc bl": [-100, -10] };

export const MessageParentItemsFiltered: React.FC<IMessageParentItemsFilteredProps> = (props) => {
    const { parentFilterTitles, showItemsFilteredMessage } = props;

    const tooltipText = useMemo(() => {
        return parentFilterTitles ? parentFilterTitles.join(", ") : "";
    }, [parentFilterTitles]);

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
                    alignPoints={ALIGN_POINTS}
                    arrowOffsets={ARROW_OFFSETS}
                >
                    <FormattedMessage
                        id="attributesDropdown.itemsFiltered.tooltip"
                        values={{
                            filters: tooltipText,
                            strong: (chunks: string) => <strong>{chunks}</strong>,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
