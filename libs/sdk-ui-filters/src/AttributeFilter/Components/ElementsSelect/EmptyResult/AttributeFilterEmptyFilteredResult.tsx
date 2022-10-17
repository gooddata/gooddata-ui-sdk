// (C) 2021-2022 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

const ALIGN_POINTS = [{ align: "cr cl" }];
const ARROW_OFFSETS = { "cr cl": [10, 0] };

/**
 * It represent message when all elements are filtered out by parent filers.
 * @beta
 */
export interface IAttributeFilterAllValuesFilteredResultProps {
    parentFilterTitles: string[];
}

/**
 * Component that display message that all elements are filtered out by parent filers.
 * @beta
 */
export const AttributeFilterAllValuesFilteredResult: React.FC<
    IAttributeFilterAllValuesFilteredResultProps
> = (props) => {
    const { parentFilterTitles } = props;

    return (
        <div className="gd-attribute-filter-empty-filtered-result__next s-attribute-filter-dropdown-all-items-filtered">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className="gd-filtered-message__next">
                    <FormattedMessage id="attributesDropdown.allItemsFiltered" />
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
                            filters: parentFilterTitles.join(", "),
                            strong: (chunks: string) => <strong>{chunks}</strong>,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
