// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import {
    type IAttributeFilter,
    type IOnAttributeFilterApplyProps,
} from "../../../../store/filter_bar/filter_bar_types.js";
import { AdditionalDateAttributeButton } from "../../../AttributeFilter/components/AdditionalDateAttributeButton.js";
import { AdditionalDateAttributeDropdownBody } from "../../../AttributeFilter/components/AdditionalDateAttributeDropdownBody.js";
import { AdditionalDateElementsSearchBarComponent } from "../../../AttributeFilter/components/AdditionalDateElementsSearchBarComponent.js";
import { AttributeFilterItemPure as AttributeFilterItem } from "../../AttributeFilterItem.js";

interface IAdditionalDateAttributeProps {
    label: string;
    attributeFilter?: IAttributeFilter;
    onApply: (props: IOnAttributeFilterApplyProps) => void;
    onClose: () => void;
    onRemove: (localIdentifier: string) => void;
    isAutoOpen: boolean;
}

export function AdditionalDateAttribute({
    label,
    attributeFilter,
    onApply,
    onClose,
    onRemove,
    isAutoOpen,
}: IAdditionalDateAttributeProps) {
    const onButtonClick = useCallback(
        () => onRemove(attributeFilter.localIdentifier),
        [attributeFilter, onRemove],
    );
    const simplifiedLabel = simplifyText(label);

    const wrapperClassNames = classNames(
        "adi-date-dropdown adi-additional-date-attribute s-adi-additional-date-attribute",
        `s-adi-additional-date-attribute-${simplifiedLabel}`,
    );

    return (
        <div className={wrapperClassNames}>
            <FormattedMessage id={label} />
            <div className="adi-additional-date-attribute-button-wrapper">
                <AttributeFilterItem
                    attributeFilterProp={attributeFilter}
                    filterLocalIdentifier={attributeFilter.localIdentifier}
                    dropdownButtonComponent={AdditionalDateAttributeButton}
                    dropdownBodyComponent={AdditionalDateAttributeDropdownBody}
                    elementsSearchBarComponent={AdditionalDateElementsSearchBarComponent}
                    dropdownClassName={`adi-additional-date-attribute-dropdown s-additional-date-attribute-dropdown s-adi-additional-date-attribute-dropdown-${simplifiedLabel}`}
                    onApply={onApply}
                    onClose={onClose}
                    isAutoOpen={isAutoOpen}
                    useAlternativeDisplayForms={false}
                    availableSelectionTypesOverride={["elements"]}
                />
                <Button
                    className={
                        "gd-button-link gd-button-icon-only gd-icon-cross adi-additional-date-attribute-remove s-remove-attribute-filter"
                    }
                    onClick={onButtonClick}
                />
            </div>
        </div>
    );
}
