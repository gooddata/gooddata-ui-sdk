// (C) 2021-2022 GoodData Corporation
import React, { ReactNode, useMemo } from "react";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

const ALIGN_POINTS = [{ align: "cr cl" }];
const ARROW_OFFSETS = { "cr cl": [10, 0] };

/**
 * It represent status message for parent elements titles that are used for filtering elements.
 * @beta
 */
export interface IAttributeFilterFilteredStatusProps {
    parentFilterTitles: string[];
}

/**
 * It displays list of parent filters
 * @beta
 */
export const AttributeFilterFilteredStatus: React.FC<IAttributeFilterFilteredStatusProps> = (props) => {
    const { parentFilterTitles } = props;

    const tooltipText = useMemo(() => {
        return parentFilterTitles ? parentFilterTitles.join(", ") : "";
    }, [parentFilterTitles]);

    return (
        <div className="gd-attribute-filter-filtered-status__next s-attribute-filter-dropdown-items-filtered">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className="gd-filtered-message__next">
                    &nbsp;
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
                            strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
