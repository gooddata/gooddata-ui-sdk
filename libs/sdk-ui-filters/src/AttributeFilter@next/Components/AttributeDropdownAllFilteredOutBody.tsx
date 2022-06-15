// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeDropdownButtons } from "./AttributeDropdownButtons";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

export interface IAttributeDropdownAllFilteredOutBodyProps {
    isMobile?: boolean;
    parentFilterTitles: string[];
    onApplyButtonClick: () => void;
    onCancelButtonClick: () => void;
}

// TODO isolate css and comp independent
// TODO remove buttons and callback
// TODO rename to message something
// TODO fix position of ico and bubble

/**
 * @internal
 */
export const AttributeDropdownAllFilteredOutBody: React.FC<IAttributeDropdownAllFilteredOutBodyProps> = (
    props,
) => {
    const { isMobile, parentFilterTitles, onApplyButtonClick, onCancelButtonClick } = props;

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
                        alignPoints={[{ align: "bc tc" }]}
                        arrowOffsets={{ "bc tc": [0, 15] }}
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
            <AttributeDropdownButtons
                applyDisabled={true}
                onApplyButtonClicked={onApplyButtonClick}
                onCloseButtonClicked={onCancelButtonClick}
            />
        </div>
    );
};
