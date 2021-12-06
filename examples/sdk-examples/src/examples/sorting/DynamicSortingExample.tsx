// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import {
    newAttributeSort,
    newMeasureSort,
    IAttributeSortItem,
    IMeasureSortItem,
    newAttributeLocator,
    newAttributeAreaSort,
    SortDirection,
} from "@gooddata/sdk-model";
import { LdmExt } from "../../md";

interface ISortOption {
    key: string;
    label: string;
    overrideDirection?: SortDirection | null;
    description: (dir?: SortDirection) => string;
    sortBy: (dir?: SortDirection) => Array<IAttributeSortItem | IMeasureSortItem>;
}

interface IDynamicSortingExampleState {
    sortOption: ISortOption | undefined;
    direction: SortDirection;
}

const getOrderLabel = (direction: SortDirection) => {
    return {
        desc: "descending",
        asc: "ascending",
    }[direction];
};

const style = { height: 600 };

export const DynamicSortingExample: React.FC = () => {
    const [state, setState] = useState<IDynamicSortingExampleState>({
        sortOption: undefined,
        direction: "asc",
    });
    const onSortOptionChange = (sortOption: ISortOption) => () =>
        setState((state) => ({
            ...state,
            sortOption,
        }));
    const onDirectionChange = (direction: SortDirection) => () =>
        setState((state) => ({
            ...state,
            direction,
        }));

    const sortOptions: ISortOption[] = [
        {
            key: "default",
            label: "Default sorting",
            overrideDirection: "asc",
            description: () => "By default, the chart is sorted by the date attribute dir ascending order",
            sortBy: () => [],
        },
        {
            key: "state",
            label: "State",
            description: (dir) =>
                `The column stacks (states) are sorted alphabetically by the label of the state attribute in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [newAttributeSort(LdmExt.LocationState, dir)],
        },
        {
            key: "date",
            label: "Date attribute",
            description: (dir) =>
                `The columns (date) are sorted by the value of the date attribute in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [newAttributeSort(LdmExt.monthDate, dir)],
        },
        {
            key: "sum-of-column",
            label: "Date attribute by sum of the column",
            description: (dir) =>
                `The columns (date) are sorted by the sum of the Total Sales stacks in each column in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [newAttributeAreaSort(LdmExt.monthDate, dir)],
        },
        {
            key: "sum-of-stacks",
            label: "State attribute by sum of individual stacks",
            description: (dir) =>
                `The stacks (state) are sorted by the sum of the Total Sales stacks across all columns in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [newAttributeAreaSort(LdmExt.LocationState, dir)],
        },
        {
            key: "state-element",
            label: "Measure of California",
            description: (dir) =>
                `The columns (date) are sorted by the value of the Total Sales of California stack in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [
                newMeasureSort(LdmExt.TotalSales1, dir, [
                    newAttributeLocator(LdmExt.LocationState, LdmExt.locationStateAttributeCaliforniaUri),
                ]),
            ],
        },
        {
            key: "date-element",
            label: "Measure of January",
            description: (dir) =>
                `The column stacks (states) are sorted by the value of Total Sales in the January column in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [
                newMeasureSort(LdmExt.TotalSales1, dir, [
                    newAttributeLocator(LdmExt.monthDate, LdmExt.monthDateJanuaryUri),
                ]),
            ],
        },
        {
            key: "several-element",
            label: "Multiple sort types",
            description: (dir) =>
                `The column stacks (states) are sorted by the value of Total Sales and Sum of Month(Date) in the January column in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [
                newAttributeAreaSort(LdmExt.monthDate),
                newMeasureSort(LdmExt.TotalSales1, dir, [
                    newAttributeLocator(LdmExt.monthDate, LdmExt.monthDateJanuaryUri),
                ]),
            ],
        },
        {
            key: "multi",
            label: "Multiple sort directions",
            overrideDirection: null,
            description: () =>
                "The columns (date) are sorted by the value of the Total Sales of California stack in ascending order and the column stacks (states) are sorted by the value of Total Sales in the January column in descending direction",
            sortBy: () => [
                newMeasureSort(LdmExt.TotalSales1, "asc", [
                    newAttributeLocator(LdmExt.LocationState, LdmExt.locationStateAttributeCaliforniaUri),
                ]),
                newMeasureSort(LdmExt.TotalSales1, "desc", [
                    newAttributeLocator(LdmExt.monthDate, LdmExt.monthDateJanuaryUri),
                ]),
            ],
        },
    ];

    const { direction, sortOption = sortOptions[0] } = state;

    const isAsc = sortOption.overrideDirection ? sortOption.overrideDirection === "asc" : direction === "asc";

    const isDesc = sortOption.overrideDirection
        ? sortOption.overrideDirection === "desc"
        : direction === "desc";

    return (
        <div className="s-dynamic-sorting">
            {/* language=CSS */}
            <style jsx>{`
                .sorting-options {
                    margin: -10px -10px 10px -10px;
                    display: flex;
                    flex-wrap: wrap;
                }
                .sorting-option {
                    margin: 5px 10px;
                }
                .sorting-label {
                    margin: 5px 10px;
                    padding: 6px 0;
                }
            `}</style>
            <div className="sorting-options">
                <span className="sorting-label">Sort by</span>
                {sortOptions.map((sortOptionItem) => {
                    return (
                        <button
                            key={sortOptionItem.key}
                            className={`sorting-option gd-button gd-button-secondary s-${
                                sortOptionItem.key
                            } ${sortOption.key === sortOptionItem.key ? " is-active" : ""}`}
                            onClick={onSortOptionChange(sortOptionItem)}
                        >
                            {sortOptionItem.label}
                        </button>
                    );
                })}
            </div>
            {sortOption.key !== "multi" && (
                <div className="sorting-options">
                    <span className="sorting-label">Direction</span>
                    <button
                        className={`sorting-option gd-button gd-button-secondary s-ascending${
                            isAsc ? " is-active" : ""
                        }`}
                        onClick={onDirectionChange("asc")}
                    >
                        Ascending
                    </button>
                    <button
                        className={`sorting-option gd-button gd-button-secondary s-descending${
                            isDesc ? " is-active" : ""
                        }`}
                        onClick={onDirectionChange("desc")}
                    >
                        Descending
                    </button>
                </div>
            )}
            <p>{sortOption.description(direction)}</p>

            <hr className="separator" />

            <div style={style} className="s-dynamic-sorting-chart">
                <ColumnChart
                    measures={[LdmExt.TotalSales1]}
                    viewBy={LdmExt.monthDate}
                    stackBy={LdmExt.LocationState}
                    sortBy={sortOption.sortBy(direction)}
                />
            </div>
        </div>
    );
};
