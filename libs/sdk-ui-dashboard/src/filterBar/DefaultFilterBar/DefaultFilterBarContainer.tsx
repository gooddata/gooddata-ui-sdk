// (C) 2021 GoodData Corporation
import React, { useState } from "react";
import Measure from "react-measure";

import { IntlWrapper } from "../../localization";
import { ShowAllFiltersButton } from "./ShowAllFiltersButton";

// TODO: this will probably need to be customizable so that custom filter components work
const DEFAULT_FILTER_BAR_HEIGHT = 58;

const DefaultFilterBarContainerCore: React.FC = ({ children }) => {
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
        <div className="dash-filters-wrapper s-gd-dashboard-filter-bar">
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
export const DefaultFilterBarContainer: React.FC = ({ children }) => {
    return (
        <IntlWrapper>
            <DefaultFilterBarContainerCore>{children}</DefaultFilterBarContainerCore>
        </IntlWrapper>
    );
};
