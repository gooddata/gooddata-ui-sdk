// (C) 2023 GoodData Corporation

import React, { ReactNode, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger, Message } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS = [{ align: "bl tl" }];
const ARROW_OFFSETS = { "bl tl": [-10, 12] };

interface IAttributeFilterIrrelevantSelectionStatusProps {
    parentFilterTitles: string[];
    irrelevantSelection: string[];
    onClear: () => void;
}

export const AttributeFilterIrrelevantSelectionStatus: React.FC<
    IAttributeFilterIrrelevantSelectionStatusProps
> = ({ parentFilterTitles, irrelevantSelection, onClear }) => {
    const parentFiltersTooltipText = useMemo(() => {
        return parentFilterTitles ? parentFilterTitles.join(", ") : "";
    }, [parentFilterTitles]);

    if (irrelevantSelection.length === 0) {
        return null;
    }

    return (
        <Message className="gd-attribute-filter-status-irrelevant-message" type="warning">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <FormattedMessage id="attributesDropdown.irrelevantValues" values={{ nbsp: <>&nbsp;</> }} />
                <Bubble
                    className={`bubble-primary gd-attribute-filter-dropdown-bubble__next s-attribute-filter-dropdown-bubble`}
                    alignPoints={ALIGN_POINTS}
                    arrowOffsets={ARROW_OFFSETS}
                >
                    <FormattedMessage
                        id="attributesDropdown.irrelevantValues.tooltip"
                        values={{
                            parents: parentFiltersTooltipText,
                            strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
            <span className="gd-action-clear" onClick={onClear}>
                <FormattedMessage id="attributesDropdown.irrelevantValues.clear" />
            </span>
        </Message>
    );
};
