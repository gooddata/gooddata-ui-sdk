// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

interface IShowAllFiltersButtonProps {
    isVisible: boolean;
    isFilterBarExpanded: boolean;
    onToggle: (isExpanded: boolean) => void;
}

export const ShowAllFiltersButton: React.FC<IShowAllFiltersButtonProps> = ({
    isVisible,
    isFilterBarExpanded,
    onToggle,
}) => {
    if (!isVisible) {
        return null;
    }

    const icon = isFilterBarExpanded ? "gd-icon-chevron-up" : "gd-icon-chevron-down";

    return (
        <div className="show-all">
            <button
                className="button-filter-bar-show-all"
                tabIndex={-1}
                onClick={() => onToggle(!isFilterBarExpanded)}
            >
                <span className="gd-button-text gd-label">
                    <FormattedMessage id={isFilterBarExpanded ? "filterBar.showLess" : "filterBar.showAll"} />
                    <i className={`gd-button-icon gd-icon ${icon}`} />
                </span>
            </button>
        </div>
    );
};
