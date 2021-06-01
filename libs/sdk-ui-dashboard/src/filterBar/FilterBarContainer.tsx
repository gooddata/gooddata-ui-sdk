// (C) 2021 GoodData Corporation
import React, { useState } from "react";
import Measure from "react-measure";
import { FormattedMessage } from "react-intl";

import { IntlWrapper } from "../localization/IntlWrapper";

// TODO: this will probably need to be customizable so that custom filter components work
const DEFAULT_FILTER_BAR_HEIGHT = 58;

const ShowAllFiltersButton: React.FC<{
    isVisible: boolean;
    isFilterBarExpanded: boolean;
    onToggle: (isExpanded: boolean) => void;
}> = ({ isVisible, isFilterBarExpanded, onToggle }) => {
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

const FilterBarContainerCore: React.FC = ({ children }) => {
    const [filterBarHeight, setFilterBarHeight] = useState(DEFAULT_FILTER_BAR_HEIGHT);
    const [filterBarExpanded, setFilterBarExpanded] = useState(false);

    const onAttributeFilterBarHeightChange = (val: number) => {
        if (val !== filterBarHeight) {
            setFilterBarHeight(val);
        }
    };

    const areFiltersHidden = Math.round(filterBarHeight) <= DEFAULT_FILTER_BAR_HEIGHT;

    const dashFiltersVisibleStyle = {
        height: filterBarExpanded ? filterBarHeight : DEFAULT_FILTER_BAR_HEIGHT,
    };

    return (
        <div className="dash-filters-wrapper">
            <div className="dash-filters-visible" style={dashFiltersVisibleStyle}>
                <Measure
                    bounds
                    onResize={(dimensions) => onAttributeFilterBarHeightChange(dimensions.bounds!.height)}
                >
                    {({ measureRef }) => (
                        <div className="dash-filters-all" ref={measureRef}>
                            {children}
                        </div>
                    )}
                </Measure>
            </div>
            <ShowAllFiltersButton
                isFilterBarExpanded={filterBarExpanded}
                isVisible={!areFiltersHidden}
                onToggle={(isExpanded) => setFilterBarExpanded(isExpanded)}
            />
        </div>
    );
};

/**
 * @internal
 */
export const FilterBarContainer: React.FC = ({ children }) => {
    return (
        <IntlWrapper>
            <FilterBarContainerCore>{children}</FilterBarContainerCore>
        </IntlWrapper>
    );
};
