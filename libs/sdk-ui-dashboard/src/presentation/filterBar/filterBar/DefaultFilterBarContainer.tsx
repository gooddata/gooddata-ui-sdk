// (C) 2021-2024 GoodData Corporation
import React, { useRef } from "react";
import DefaultMeasure from "react-measure";
import cx from "classnames";

import { IntlWrapper } from "../../localization/index.js";
import {
    selectEnableKDCrossFiltering,
    selectIsInEditMode,
    selectLocale,
    selectSupportsCrossFiltering,
    useDashboardSelector,
} from "../../../model/index.js";

import { BulletsBar } from "../../dragAndDrop/index.js";
import { ShowAllFiltersButton } from "./ShowAllFiltersButton.js";
import { useRowsCalculator, CalculatedRows } from "./hooks/useRowsCalculator.js";
import { useFilterBarState } from "./hooks/useFilterBarState.js";
import { useFilterExpansionByDragAndDrop } from "./hooks/useFilterExpansionByDragAndDrop.js";
import { defaultImport } from "default-import";
import { createSelector } from "@reduxjs/toolkit";
import { FiltersConfigurationPanel } from "./FiltersConfigurationPanel.js";

const selectShowFiltersConfigurationPanel = createSelector(
    selectIsInEditMode,
    selectEnableKDCrossFiltering,
    selectSupportsCrossFiltering,
    (isEdit, enableCrossFiltering, supportsCrossFiltering) => {
        return isEdit && enableCrossFiltering && supportsCrossFiltering;
    },
);

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(DefaultMeasure);

const DefaultFilterBarContainerCore: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { rows, height, isFilterBarExpanded, scrollable, setFilterBarExpanded, setCalculatedRows } =
        useFilterBarState();

    const dropRef = useFilterExpansionByDragAndDrop(
        rows.length > 1,
        isFilterBarExpanded,
        setFilterBarExpanded,
    );

    const showFiltersConfigurationPanel = useDashboardSelector(selectShowFiltersConfigurationPanel);

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
                {showFiltersConfigurationPanel ? <FiltersConfigurationPanel /> : null}
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

const AllFiltersContainer: React.FC<{
    setCalculatedRows: (data: CalculatedRows) => void;
    children?: React.ReactNode;
}> = ({ setCalculatedRows, children }) => {
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
export const DefaultFilterBarContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <DefaultFilterBarContainerCore>{children}</DefaultFilterBarContainerCore>
        </IntlWrapper>
    );
};
