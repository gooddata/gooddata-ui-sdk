// (C) 2022-2026 GoodData Corporation

import classNames from "classnames";
import { useIntl } from "react-intl";

import { type IAttributeFilterDropdownButtonProps } from "@gooddata/sdk-ui-filters";
import { FilterLabel } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function AdditionalDateAttributeButton({
    isOpen,
    subtitle,
    selectedItemsCount,
    onClick,
    isLoading,
    isFiltering,
}: IAttributeFilterDropdownButtonProps) {
    const intl = useIntl();

    let buttonTitle = subtitle;

    if (isLoading || isFiltering) {
        buttonTitle = intl.formatMessage({ id: "loading" });
    }

    const buttonClassNames = classNames(
        "adi-additional-date-attribute-dropdown-button",
        "gd-button-primary",
        "gd-button-small",
        "button-dropdown",
        "dropdown-button",
        "gd-icon-right",
        { "is-dropdown-open": isOpen },
        { "is-active": isOpen },
        { "gd-icon-navigateup": isOpen },
        { "gd-icon-navigatedown": !isOpen },
    );

    const selectionSize = selectedItemsCount === 0 ? undefined : selectedItemsCount;

    return (
        <button tabIndex={-1} className={buttonClassNames} onClick={onClick}>
            <FilterLabel title={buttonTitle} selectionSize={selectionSize} />
        </button>
    );
}
