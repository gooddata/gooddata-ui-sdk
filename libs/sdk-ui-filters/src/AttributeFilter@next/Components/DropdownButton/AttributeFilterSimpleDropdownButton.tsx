// (C) 2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { DropdownButton } from "@gooddata/sdk-ui-kit";
import { IAttributeFilterDropdownButtonProps } from "./AttributeFilterDropdownButton";

/**
 * @internal
 */
export const AttributeFilterSimpleDropdownButton: React.VFC<IAttributeFilterDropdownButtonProps> = (
    props,
) => {
    const { isOpen, title, isLoading, isFiltering, onClick } = props;
    const intl = useIntl();

    let buttonTitle = title;
    if (isLoading) {
        buttonTitle = intl.formatMessage({ id: "loading" });
    } else if (isFiltering) {
        buttonTitle = intl.formatMessage({ id: "filtering" });
    }

    return <DropdownButton disabled={isLoading} isOpen={isOpen} value={buttonTitle} onClick={onClick} />;
};

/**
 * @internal
 */
export const AttributeFilterSimpleDropdownButtonWithSelection: React.VFC<
    IAttributeFilterDropdownButtonProps
> = (props) => {
    const { isOpen, title, subtitle, selectedItemsCount, onClick, isLoading, isFiltering } = props;
    const intl = useIntl();

    let buttonTitle = `${title}: ${subtitle} (${selectedItemsCount})`;
    if (isLoading) {
        buttonTitle = intl.formatMessage({ id: "loading" });
    } else if (isFiltering) {
        buttonTitle = intl.formatMessage({ id: "filtering" });
    }

    return <DropdownButton isOpen={isOpen} value={buttonTitle} onClick={onClick} />;
};
