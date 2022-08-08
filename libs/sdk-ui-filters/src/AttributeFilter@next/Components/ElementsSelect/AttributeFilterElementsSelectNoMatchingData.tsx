// (C) 2021-2022 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble, useMediaQuery } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

const ALIGN_POINTS = [{ align: "bc tc" }];
const ARROW_OFFSETS = { "bc tc": [0, 15] };

/**
 * @alpha
 */
export interface IAttributeFilterElementsSelectNoMatchingDataProps {
    parentFilterTitles: string[];
}

/**
 * @internal
 */
export const AttributeFilterElementsSelectNoMatchingData: React.FC<
    IAttributeFilterElementsSelectNoMatchingDataProps
> = (props) => {
    const { parentFilterTitles } = props;

    const isMobile = useMediaQuery("mobileDevice");

    return (
        <div className="gd-attribute-filter-overlay__next" style={{ width: isMobile ? "auto" : "245px" }}>
            <div className="gd-attribute-filter-dropdown-all-items-filtered__next s-attribute-filter-dropdown-all-items-filtered">
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
        </div>
    );
};
