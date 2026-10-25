// (C) 2022-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IAttributeFilterDropdownButtonProps } from "@gooddata/sdk-ui-filters";
import { FilterLabel } from "@gooddata/sdk-ui-kit";

export function MetricAttributeFilterButtonWithClassName(className: string) {
    function Component(props: IAttributeFilterDropdownButtonProps) {
        return <MetricAttributeFilterButton {...props} className={className} />;
    }

    return Component;
}

export interface IMetricAttributeFilterButtonProps extends IAttributeFilterDropdownButtonProps {
    className: string;
}

/**
 * @internal
 */
export function MetricAttributeFilterButton({
    isOpen,
    subtitle,
    title,
    selectedItemsCount,
    onClick,
    isLoading,
    isFiltering,
    className,
}: IMetricAttributeFilterButtonProps) {
    const intl = useIntl();

    let buttonTitle = `${title}: ${subtitle}`;

    if (isLoading || isFiltering) {
        buttonTitle = intl.formatMessage({ id: "loading" });
    }

    const buttonClassNames = cx(
        "adi-metric-attribute-filter",
        "gd-icon-right",
        "button-dropdown",
        "gd-button",
        "adi-attr-filter-button",
        "s-filter-button",
        "adi-filter-button",
        "toggle-menu",
        "dropdown-button",
        "s-attr-filter",
        className,
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
