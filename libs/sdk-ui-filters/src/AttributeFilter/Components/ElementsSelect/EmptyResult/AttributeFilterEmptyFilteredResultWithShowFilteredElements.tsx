// (C) 2021-2022 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { AttributeFilterEmptySearchResult } from "./AttributeFilterEmptySearchResult.js";

const ALIGN_POINTS = [{ align: "bc tc" }];
const ARROW_OFFSETS = { "bc tc": [0, 0] };

/**
 * It represent message when all elements are filtered out by parent filers.
 * @beta
 */
export interface IAttributeFilterEmptyFilteredResultWithShowFilteredElementsProps {
    searchString: string;
}

/**
 * Component that display message that all elements are filtered out by parent filers.
 * @beta
 */
export const AttributeFilterEmptyFilteredResultWithShowFilteredElements: React.FC<
    IAttributeFilterEmptyFilteredResultWithShowFilteredElementsProps
> = ({ searchString }) => {
    if (searchString.length > 0) {
        return <AttributeFilterEmptySearchResult />;
    }

    return (
        <div className="gd-attribute-filter-empty-filtered-result__next s-attribute-filter-dropdown-all-items-filtered">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className="gd-filtered-message__next">
                    <FormattedMessage id="attributesDropdown.noRelevantValues" />
                    <span className="gd-icon-circle-question" />
                </div>
                <Bubble
                    className={`bubble-primary gd-attribute-filter-dropdown-bubble__next s-attribute-filter-dropdown-bubble`}
                    alignPoints={ALIGN_POINTS}
                    arrowOffsets={ARROW_OFFSETS}
                >
                    <FormattedMessage
                        id="attributesDropdown.noRelevantValues.tooltip"
                        values={{
                            break: (
                                <>
                                    <br />
                                    <br />
                                </>
                            ),
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
