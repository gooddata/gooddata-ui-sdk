// (C) 2021-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

interface IShowAllFiltersButtonProps {
    isVisible: boolean;
    isFilterBarExpanded: boolean;
    onToggle: (isExpanded: boolean) => void;
}

export function ShowAllFiltersButton({
    isVisible,
    isFilterBarExpanded,
    onToggle,
}: IShowAllFiltersButtonProps) {
    if (!isVisible) {
        return null;
    }

    const icon = isFilterBarExpanded ? "gd-icon-chevron-up" : "gd-icon-chevron-down";

    return (
        <div className="show-all">
            <button
                className="button-filter-bar-show-all"
                type="button"
                tabIndex={-1}
                onClick={() => onToggle(!isFilterBarExpanded)}
            >
                <span className="gd-button-text gd-label">
                    {isFilterBarExpanded ? (
                        <FormattedMessage id="filterBar.showLess" />
                    ) : (
                        <FormattedMessage id="filterBar.showAll" />
                    )}
                    <i className={`gd-button-icon gd-icon ${icon}`} />
                </span>
            </button>
        </div>
    );
}
