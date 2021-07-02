// (C) 2021 GoodData Corporation
import React from "react";
import { AttributeDropdownButtons } from "./AttributeDropdownButtons";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl";

/**
 * @internal
 */
export const AttributeDropdownAllFilteredOutBody: React.FC<{
    isMobile?: boolean;
    parentFilterTitles: string[];
    onApplyButtonClick: () => void;
    onCancelButtonClick: () => void;
}> = ({ isMobile, parentFilterTitles, onApplyButtonClick, onCancelButtonClick }) => {
    return (
        <div className="gd-attribute-filter-overlay" style={{ width: isMobile ? "auto" : "245px" }}>
            <div className="gd-attribute-filter-dropdown-all-items-filtered s-attribute-filter-dropdown-all-items-filtered">
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <div className="gd-filtered-message">
                        <FormattedMessage id="attributesDropdown.allItemsFiltered" />
                        <span className="gd-icon-circle-question" />
                    </div>
                    <Bubble
                        className={`bubble-primary gd-attribute-filter-dropdown-bubble s-attribute-filter-dropdown-bubble`}
                        alignPoints={[{ align: "bc tc" }]}
                        arrowOffsets={{ "bc tc": [0, 15] }}
                    >
                        <FormattedHTMLMessage
                            id="attributesDropdown.itemsFiltered.tooltip"
                            values={{ filters: parentFilterTitles.join(", ") }}
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
