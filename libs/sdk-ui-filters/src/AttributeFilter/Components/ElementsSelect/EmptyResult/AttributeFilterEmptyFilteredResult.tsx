// (C) 2021-2025 GoodData Corporation
import React, { ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { AttributeFilterEmptySearchResult } from "./AttributeFilterEmptySearchResult.js";

const ALIGN_POINTS = [{ align: "cr cl" }];
const ARROW_OFFSETS = { "cr cl": [10, 0] };

/**
 * It represent message when all elements are filtered out by parent filers.
 * @beta
 */
export interface IAttributeFilterAllValuesFilteredResultProps {
    parentFilterTitles: string[];
    searchString: string;
    enableShowingFilteredElements: boolean;
}

/**
 * Component that display message that all elements are filtered out by parent filers.
 * @beta
 */
export const AttributeFilterAllValuesFilteredResult: React.FC<
    IAttributeFilterAllValuesFilteredResultProps
> = (props) => {
    const { parentFilterTitles, searchString, enableShowingFilteredElements } = props;

    if (enableShowingFilteredElements && searchString.length > 0) {
        return <AttributeFilterEmptySearchResult />;
    }

    if (enableShowingFilteredElements) {
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
    }

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
                            strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
