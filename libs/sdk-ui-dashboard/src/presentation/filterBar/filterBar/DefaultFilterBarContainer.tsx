// (C) 2021 GoodData Corporation
import React from "react";
import Measure from "react-measure";

import { IntlWrapper } from "../../localization";
import {
    selectFilterBarExpanded,
    selectFilterBarHeight,
    selectLocale,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { ShowAllFiltersButton } from "./ShowAllFiltersButton";

// TODO: this will probably need to be customizable so that custom filter components work
const DEFAULT_FILTER_BAR_HEIGHT = 58;

const DefaultFilterBarContainerCore: React.FC = ({ children }) => {
    const dispatch = useDashboardDispatch();
    const filterBarHeight = useDashboardSelector(selectFilterBarHeight);
    const filterBarExpanded = useDashboardSelector(selectFilterBarExpanded);

    const setFilterBarExpanded = (isExpanded: boolean) =>
        dispatch(uiActions.setFilterBarExpanded(isExpanded));
    const setFilterBarHeight = (height: number) => dispatch(uiActions.setFilterBarHeight(height));

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
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <DefaultFilterBarContainerCore>{children}</DefaultFilterBarContainerCore>
        </IntlWrapper>
    );
};
