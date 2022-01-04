// (C) 2007-2022 GoodData Corporation
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
    modifyAttribute,
    modifyMeasure,
} from "@gooddata/sdk-model";
import * as Md from "../../md/full";
import { workspace } from "../../constants/fixtures";

const monthDate = modifyAttribute(Md.DateDatasets.Date.Month.Short, (a) => a.alias("Month"));
const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));
const locationStateAttributeCaliforniaUri = `/gdc/md/${workspace}/obj/2210/elements?id=6340116`;
const monthDateJanuaryUri = `/gdc/md/${workspace}/obj/2071/elements?id=1`;

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
            sortBy: (dir) => [newAttributeSort(Md.LocationState, dir)],
        },
        {
            key: "date",
            label: "Date attribute",
            description: (dir) =>
                `The columns (date) are sorted by the value of the date attribute in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [newAttributeSort(monthDate, dir)],
        },
        {
            key: "sum-of-column",
            label: "Date attribute by sum of the column",
            description: (dir) =>
                `The columns (date) are sorted by the sum of the Total Sales stacks in each column in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [newAttributeAreaSort(monthDate, dir)],
        },
        {
            key: "sum-of-stacks",
            label: "State attribute by sum of individual stacks",
            description: (dir) =>
                `The stacks (state) are sorted by the sum of the Total Sales stacks across all columns in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [newAttributeAreaSort(Md.LocationState, dir)],
        },
        {
            key: "state-element",
            label: "Measure of California",
            description: (dir) =>
                `The columns (date) are sorted by the value of the Total Sales of California stack in ${getOrderLabel(
                    dir!,
                )} order.`,
            sortBy: (dir) => [
                newMeasureSort(TotalSales, dir, [
                    newAttributeLocator(Md.LocationState, locationStateAttributeCaliforniaUri),
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
                newMeasureSort(TotalSales, dir, [newAttributeLocator(monthDate, monthDateJanuaryUri)]),
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
                newAttributeAreaSort(monthDate),
                newMeasureSort(TotalSales, dir, [newAttributeLocator(monthDate, monthDateJanuaryUri)]),
            ],
        },
        {
            key: "multi",
            label: "Multiple sort directions",
            overrideDirection: null,
            description: () =>
                "The columns (date) are sorted by the value of the Total Sales of California stack in ascending order and the column stacks (states) are sorted by the value of Total Sales in the January column in descending direction",
            sortBy: () => [
                newMeasureSort(TotalSales, "asc", [
                    newAttributeLocator(Md.LocationState, locationStateAttributeCaliforniaUri),
                ]),
                newMeasureSort(TotalSales, "desc", [newAttributeLocator(monthDate, monthDateJanuaryUri)]),
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
                    measures={[TotalSales]}
                    viewBy={monthDate}
                    stackBy={Md.LocationState}
                    sortBy={sortOption.sortBy(direction)}
                />
            </div>
        </div>
    );
};
