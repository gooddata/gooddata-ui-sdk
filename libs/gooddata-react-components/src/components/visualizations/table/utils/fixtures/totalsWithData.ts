// (C) 2007-2018 GoodData Corporation
import { Execution } from "@gooddata/typings";
import { IIndexedTotalItem, ITotalWithData } from "../../../../../interfaces/Totals";

export const TOTALS_DEFINITION_1: IIndexedTotalItem[] = [
    {
        type: "sum",
        outputMeasureIndexes: [],
        alias: "Sum of Something",
    },
    {
        type: "avg",
        outputMeasureIndexes: [1],
        alias: "Avg of Something",
    },
    {
        type: "nat",
        outputMeasureIndexes: [0, 1],
    },
];

export const TOTALS_DEFINITION_2: IIndexedTotalItem[] = [
    {
        type: "max",
        outputMeasureIndexes: [0],
    },
    {
        type: "avg",
        outputMeasureIndexes: [0],
    },
    {
        type: "nat",
        outputMeasureIndexes: [0],
    },
    {
        type: "sum",
        outputMeasureIndexes: [0],
    },
    {
        type: "min",
        outputMeasureIndexes: [0],
    },
    {
        type: "med",
        outputMeasureIndexes: [0],
    },
];

export const TOTALS_DEFINITION_3: ITotalWithData[] = [
    {
        type: "sum",
        outputMeasureIndexes: [0],
        values: [1],
    },
    {
        type: "max",
        outputMeasureIndexes: [0],
        values: [2],
    },
    {
        type: "min",
        outputMeasureIndexes: [0],
        values: [3],
    },
];

export const EXPECTED_TOTALS_WITH_DATA_1: ITotalWithData[] = [
    {
        type: "sum",
        outputMeasureIndexes: [],
        alias: "Sum of Something",
        values: [1, 2],
    },
    {
        type: "avg",
        outputMeasureIndexes: [1],
        alias: "Avg of Something",
        values: [3, 4],
    },
    {
        type: "nat",
        outputMeasureIndexes: [0, 1],
        values: [5, 6],
    },
];

export const EXECUTION_RESULT_1: Execution.IExecutionResult = {
    headerItems: [
        [
            [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=3",
                        name: "Computer",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "sum",
                        type: "sum",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "avg",
                        type: "avg",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "nat",
                        type: "nat",
                    },
                },
            ],
        ],
    ],
    data: [["1", "2"]],
    paging: {
        count: [2, 1],
        offset: [0, 0],
        total: [2, 1],
    },
    totals: [[[1, 2], [3, 4], [5, 6]]],
};

export const EXECUTION_RESULT_2: Execution.IExecutionResult = {
    headerItems: [
        [
            [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=3",
                        name: "Computer",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "sum",
                        type: "sum",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "max",
                        type: "max",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "min",
                        type: "min",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "avg",
                        type: "avg",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "med",
                        type: "med",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "nat",
                        type: "nat",
                    },
                },
            ],
        ],
    ],
    data: [["1"]],
    paging: {
        count: [1, 1],
        offset: [0, 0],
        total: [1, 1],
    },
    totals: [[[1], [2], [3], [4], [5], [6]]],
};

export const EXPECTED_TOTALS_WITH_DATA_2: ITotalWithData[] = [
    {
        type: "sum",
        outputMeasureIndexes: [0],
        values: [1],
    },
    {
        type: "max",
        outputMeasureIndexes: [0],
        values: [2],
    },
    {
        type: "min",
        outputMeasureIndexes: [0],
        values: [3],
    },
    {
        type: "avg",
        outputMeasureIndexes: [0],
        values: [4],
    },
    {
        type: "med",
        outputMeasureIndexes: [0],
        values: [5],
    },
    {
        type: "nat",
        outputMeasureIndexes: [0],
        values: [6],
    },
];

export const EXPECTED_TOTALS_WITH_EMPTY_DATA_2: ITotalWithData[] = [
    {
        type: "sum",
        outputMeasureIndexes: [0],
        values: [],
    },
    {
        type: "max",
        outputMeasureIndexes: [0],
        values: [],
    },
    {
        type: "min",
        outputMeasureIndexes: [0],
        values: [],
    },
    {
        type: "avg",
        outputMeasureIndexes: [0],
        values: [],
    },
    {
        type: "med",
        outputMeasureIndexes: [0],
        values: [],
    },
    {
        type: "nat",
        outputMeasureIndexes: [0],
        values: [],
    },
];
