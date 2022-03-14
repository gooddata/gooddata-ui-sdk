// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import {
    DateFilter,
    DateFilterHelpers,
    DateFilterOption,
    IDateFilterOptionsByType,
} from "@gooddata/sdk-ui-filters";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";

import * as Md from "../../../md/full";
import { DateFilterGranularity } from "@gooddata/sdk-backend-spi";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));

const measures = [TotalSales];

const availableGranularities: DateFilterGranularity[] = ["GDC.time.year"];

const defaultDateFilterOptions: IDateFilterOptionsByType = {
    allTime: {
        localIdentifier: "ALL_TIME",
        type: "allTime",
        name: "",
        visible: true,
    },
    absoluteForm: {
        localIdentifier: "ABSOLUTE_FORM",
        type: "absoluteForm",
        from: "2017-01-01",
        to: "2017-12-31",
        name: "",
        visible: true,
    },
    absolutePreset: [
        {
            from: "2015-01-01",
            to: "2015-12-31",
            name: "Year 2015",
            localIdentifier: "year2015",
            visible: true,
            type: "absolutePreset",
        },
        {
            from: "2016-01-01",
            to: "2016-12-31",
            name: "Year 2016",
            localIdentifier: "year2016",
            visible: true,
            type: "absolutePreset",
        },
        {
            from: "2017-01-01",
            to: "2017-12-31",
            name: "Year 2017",
            localIdentifier: "year2017",
            visible: true,
            type: "absolutePreset",
        },
    ],
    relativeForm: {
        localIdentifier: "RELATIVE_FORM",
        type: "relativeForm",
        granularity: "GDC.time.year",
        from: -2,
        to: -2,
        name: "",
        visible: true,
    },
    relativePreset: {
        "GDC.time.year": [
            {
                from: -2,
                to: -2,
                granularity: "GDC.time.year",
                localIdentifier: "twoYearsAgo",
                type: "relativePreset",
                visible: true,
                name: "2 years ago",
            },
            {
                from: -3,
                to: -3,
                granularity: "GDC.time.year",
                localIdentifier: "threeYearsAgo",
                type: "relativePreset",
                visible: true,
                name: "3 years ago",
            },
            {
                from: -4,
                to: -4,
                granularity: "GDC.time.year",
                localIdentifier: "fourYearsAgo",
                type: "relativePreset",
                visible: true,
                name: "4 years ago",
            },
        ],
    },
};

interface IDateFilterComponentExampleState {
    selectedFilterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
}

const dateFilterContainerStyle = { width: 300 };
const columnChartContainerStyle = { height: 300 };

export const DateFilterWithColumnChartExample_DDMMYYYY: React.FC = () => {
    const [state, setState] = useState<IDateFilterComponentExampleState>({
        selectedFilterOption: defaultDateFilterOptions.absoluteForm!,
        excludeCurrentPeriod: false,
    });

    const onApply = (selectedFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => {
        setState({
            selectedFilterOption,
            excludeCurrentPeriod,
        });
    };

    const dateFilter = DateFilterHelpers.mapOptionToAfm(
        state.selectedFilterOption,
        Md.DateDatasets.Date.ref,
        state.excludeCurrentPeriod,
    );

    return (
        <div>
            <div style={dateFilterContainerStyle}>
                <DateFilter
                    excludeCurrentPeriod={state.excludeCurrentPeriod}
                    selectedFilterOption={state.selectedFilterOption}
                    filterOptions={defaultDateFilterOptions}
                    availableGranularities={availableGranularities}
                    customFilterName="Selected date range in dd/MM/yyyy format"
                    dateFilterMode="active"
                    dateFormat="dd/MM/yyyy"
                    onApply={onApply}
                />
            </div>
            <div style={columnChartContainerStyle}>
                <ColumnChart
                    measures={measures}
                    viewBy={Md.DateDatasets.Date.Month.Short}
                    filters={dateFilter ? [dateFilter] : []}
                />
            </div>
        </div>
    );
};
