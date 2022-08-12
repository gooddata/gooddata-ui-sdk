// (C) 2021-2022 GoodData Corporation
import React, { useRef } from "react";
import Measure from "react-measure";
import cx from "classnames";

import { IntlWrapper } from "../../localization";
import { selectLocale, useDashboardSelector } from "../../../model";

import { BulletsBar } from "../../dragAndDrop";
import { ShowAllFiltersButton } from "./ShowAllFiltersButton";
import { useRowsCalculator, CalculatedRows } from "./hooks/useRowsCalculator";
import { useFilterBarState } from "./hooks/useFilterBarState";
import { useFilterExpansionByDragAndDrop } from "./hooks/useFilterExpansionByDragAndDrop";

const DefaultFilterBarContainerCore: React.FC = ({ children }) => {
    const { rows, height, isFilterBarExpanded, scrollable, setFilterBarExpanded, setCalculatedRows } =
        useFilterBarState();

    const dropRef = useFilterExpansionByDragAndDrop(
        rows.length > 1,
        isFilterBarExpanded,
        setFilterBarExpanded,
    );

    return (
        <div className="dash-filters-wrapper s-gd-dashboard-filter-bar" ref={dropRef}>
            <div
                style={{ height }}
                className={cx("dash-filters-visible", {
                    scrollable: scrollable,
                    "s-dash-filters-visible-all": isFilterBarExpanded,
                })}
            >
                <AllFiltersContainer setCalculatedRows={setCalculatedRows}>{children}</AllFiltersContainer>
                <FiltersRows rows={rows} />
            </div>
            <ShowAllFiltersButton
                isFilterBarExpanded={isFilterBarExpanded}
                isVisible={rows.length > 1}
                onToggle={(isExpanded) => setFilterBarExpanded(isExpanded)}
            />
            <BulletsBar />
        </div>
    );
};

const AllFiltersContainer: React.FC<{ setCalculatedRows: (data: CalculatedRows) => void }> = ({
    setCalculatedRows,
    children,
}) => {
    const ref = useRef<Element | null>(null);
    const rowCalculator = useRowsCalculator(ref);

    return (
        <Measure
            bounds
            innerRef={(rf) => (ref.current = rf)}
            onResize={(dimensions) => setCalculatedRows(rowCalculator(dimensions))}
        >
            {({ measureRef }) => (
                <div className="dash-filters-all" ref={measureRef}>
                    {children}
                </div>
            )}
        </Measure>
    );
};

const FiltersRows: React.FC<{ rows: number[] }> = ({ rows }) => {
    return (
        <>
            {rows.length > 1 && (
                <div className="dash-filters-rows">
                    {rows.map((height, index) => (
                        <div className="dash-filters-row" style={{ height }} key={index} />
                    ))}
                </div>
            )}
        </>
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
