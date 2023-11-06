// (C) 2023 GoodData Corporation

import React, { ReactNode, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS = [{ align: "bl tl" }];
const ARROW_OFFSETS = { "bl tl": [0, 8] };

interface IAttributeFilterShowFilteredElementsProps {
    isHidden: boolean;
    attributeTitle: string;
    onClick: () => void;
    parentFilterTitles: string[];
}

export const AttributeFilterShowFilteredElements: React.FC<IAttributeFilterShowFilteredElementsProps> = ({
    isHidden,
    attributeTitle,
    onClick,
    parentFilterTitles,
}) => {
    const parentFiltersTooltipText = useMemo(() => {
        return parentFilterTitles ? parentFilterTitles.join(", ") : "";
    }, [parentFilterTitles]);

    if (isHidden) {
        return null;
    }

    return (
        <div className="gd-attribute-filter-status-show-all">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className="gd-relevant-values-text">
                    <FormattedMessage id="attributesDropdown.relevantValues" values={{ nbsp: <>&nbsp;</> }} />
                </div>
                <Bubble
                    className={`bubble-primary gd-attribute-filter-dropdown-bubble__next s-attribute-filter-dropdown-bubble`}
                    alignPoints={ALIGN_POINTS}
                    arrowOffsets={ARROW_OFFSETS}
                >
                    <FormattedMessage
                        id="attributesDropdown.relevantValues.tooltip"
                        values={{
                            child: attributeTitle,
                            parents: parentFiltersTooltipText,
                            strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
            <span className="gd-action-show-all" onClick={onClick}>
                <FormattedMessage id="attributesDropdown.showAll" />
            </span>
        </div>
    );
};
