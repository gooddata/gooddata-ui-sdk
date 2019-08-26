// (C) 2007-2018 GoodData Corporation
import set = require("lodash/set");
import cloneDeep = require("lodash/cloneDeep");
import { Execution } from "@gooddata/typings";
import { TableRow } from "../../../../../interfaces/Table";
import { EXECUTION_REQUEST_AM, TABLE_HEADERS_AM } from "../../fixtures/arithmericMeasures";

import {
    getIntersectionForDrilling,
    getBackwardCompatibleRowForDrilling,
    getHeaders,
    getRows,
    getTotalsWithData,
    validateTableProportions,
} from "../dataTransformation";

import { EXECUTION_RESULT_1A, TABLE_HEADERS_1A, TABLE_ROWS_1A } from "../../fixtures/1attribute";

import { EXECUTION_RESULT_2A, TABLE_ROWS_2A } from "../../fixtures/2attributes";

import {
    EXECUTION_REQUEST_1M,
    EXECUTION_RESULT_1M,
    TABLE_HEADERS_1M,
    TABLE_ROWS_1M,
} from "../../fixtures/1measure";

import { EXECUTION_RESULT_2M, TABLE_ROWS_2M } from "../../fixtures/2measures";

import {
    EXECUTION_RESULT_1A_2M,
    TABLE_HEADERS_1A_2M,
    TABLE_ROWS_1A_2M,
} from "../../fixtures/1attribute2measures";

import { EXECUTION_RESULT_2A_1M, TABLE_ROWS_2A_1M } from "../../fixtures/2attributes1measure";

import { EXECUTION_RESULT_2A_3M, TABLE_ROWS_2A_3M } from "../../fixtures/2attributes3measures";

import {
    EXECUTION_REQUEST_POP,
    EXECUTION_RESULT_POP,
    TABLE_HEADERS_POP,
    TABLE_ROWS_POP,
} from "../../fixtures/periodOverPeriod";

import {
    EXECUTION_RESULT_1,
    EXECUTION_RESULT_2,
    TOTALS_DEFINITION_1,
    TOTALS_DEFINITION_2,
    EXPECTED_TOTALS_WITH_DATA_1,
    EXPECTED_TOTALS_WITH_DATA_2,
    EXPECTED_TOTALS_WITH_EMPTY_DATA_2,
} from "../fixtures/totalsWithData";
import "jest";
import { ITotalWithData } from "../../../../../interfaces/Totals";

describe("Table utils - Data transformation", () => {
    describe("getRows", () => {
        describe("One attribute", () => {
            it("should get rows", () => {
                const rows: TableRow[] = getRows(EXECUTION_RESULT_1A);
                expect(rows).toEqual(TABLE_ROWS_1A);
            });
        });

        describe("Two attributes", () => {
            it("should get rows", () => {
                const rows: TableRow[] = getRows(EXECUTION_RESULT_2A);
                expect(rows).toEqual(TABLE_ROWS_2A);
            });
        });

        describe("One measure", () => {
            it("should get rows", () => {
                const rows: TableRow[] = getRows(EXECUTION_RESULT_1M);
                expect(rows).toEqual(TABLE_ROWS_1M);
            });
        });

        describe("Two measures", () => {
            it("should get rows", () => {
                const rows: TableRow[] = getRows(EXECUTION_RESULT_2M);
                expect(rows).toEqual(TABLE_ROWS_2M);
            });
        });

        describe("One attributes and two measures", () => {
            it("should get rows", () => {
                const rows: TableRow[] = getRows(EXECUTION_RESULT_1A_2M);
                expect(rows).toEqual(TABLE_ROWS_1A_2M);
            });
        });

        describe("Two attributes and one measure", () => {
            it("should get rows", () => {
                const rows: TableRow[] = getRows(EXECUTION_RESULT_2A_1M);
                expect(rows).toEqual(TABLE_ROWS_2A_1M);
            });
        });

        describe("Two attributes and three measures", () => {
            it("should get rows", () => {
                const rows: TableRow[] = getRows(EXECUTION_RESULT_2A_3M);
                expect(rows).toEqual(TABLE_ROWS_2A_3M);
            });
        });

        describe("PoP", () => {
            it("should get rows", () => {
                const rows: TableRow[] = getRows(EXECUTION_RESULT_POP);
                expect(rows).toEqual(TABLE_ROWS_POP);
            });
        });
    });

    describe("Get table totals with data", () => {
        it("should put together totals definition with result data", () => {
            const totalsWithData: ITotalWithData[] = getTotalsWithData(
                TOTALS_DEFINITION_1,
                EXECUTION_RESULT_1,
            );
            expect(totalsWithData).toEqual(EXPECTED_TOTALS_WITH_DATA_1);
        });

        it("should always return totals in the same order [sum, max, min, avg, med, nat]", () => {
            const totalsWithData: ITotalWithData[] = getTotalsWithData(
                TOTALS_DEFINITION_2,
                EXECUTION_RESULT_2,
            );
            expect(totalsWithData).toEqual(EXPECTED_TOTALS_WITH_DATA_2);
        });

        it("should return empty array when totals definition is empty", () => {
            const totalsWithData: ITotalWithData[] = getTotalsWithData([], EXECUTION_RESULT_2);
            expect(totalsWithData).toEqual([]);
        });

        it(
            "should return empty totals with empty values totals ordered by default list when totals are not present " +
                "in execution result data",
            () => {
                const totalsWithData: ITotalWithData[] = getTotalsWithData(
                    TOTALS_DEFINITION_2,
                    EXECUTION_RESULT_1A,
                );
                expect(totalsWithData).toEqual(EXPECTED_TOTALS_WITH_EMPTY_DATA_2);
            },
        );

        it(
            "should return totals ordered by default list when totals are not present " +
                "in execution result headers",
            () => {
                const execResult: Execution.IExecutionResult = cloneDeep(EXECUTION_RESULT_2);
                execResult.headerItems[0][0] = [];
                const totalsWithData: ITotalWithData[] = getTotalsWithData(TOTALS_DEFINITION_2, execResult);
                expect(totalsWithData).toEqual(EXPECTED_TOTALS_WITH_DATA_2);
            },
        );
    });

    describe("ExecutionResult headerItems", () => {
        it("should filter only arrays which contains some attribute header items", () => {
            const measureHeaderItems: Execution.IResultMeasureHeaderItem[] = [
                {
                    measureHeaderItem: {
                        name: "baz",
                        order: 0,
                    },
                },
                {
                    measureHeaderItem: {
                        name: "baz",
                        order: 1,
                    },
                },
            ];

            const extendedExecutionResultWithMeasureHeaderItems = set(
                EXECUTION_RESULT_1A,
                "headerItems[1]",
                EXECUTION_RESULT_1A.headerItems[1].concat([measureHeaderItems]),
            ) as Execution.IExecutionResult;

            const rows: TableRow[] = getRows(extendedExecutionResultWithMeasureHeaderItems);
            expect(rows).toEqual(TABLE_ROWS_1A);
        });
    });

    describe("Errors", () => {
        const errorMessage: string = "Number of dimensions must be equal two";

        it("should throw error if number of dimensions is equal one", () => {
            expect(() => {
                getHeaders({
                    dimensions: [{ headers: [] }],
                    links: {
                        executionResult: "foo",
                    },
                });
            }).toThrow(errorMessage);
        });

        it("should throw error if number of dimensions is equal three", () => {
            expect(() => {
                getHeaders({
                    dimensions: [{ headers: [] }, { headers: [] }, { headers: [] }],
                    links: {
                        executionResult: "foo",
                    },
                });
            }).toThrow(errorMessage);
        });
    });

    describe("Validate table proportions", () => {
        const errorMessage: string = "Number of table columns must be equal to number of table headers";

        it("should not throw error if number of table columns is equal zero", () => {
            expect(() => {
                validateTableProportions(TABLE_HEADERS_1A_2M, []);
            }).not.toThrow();
        });

        it("should not throw error if number of table columns is equal to number of table headers", () => {
            expect(() => {
                validateTableProportions(TABLE_HEADERS_1A_2M, TABLE_ROWS_1A_2M);
            }).not.toThrow();
        });

        it("should throw error if number of table columns is not equal to number of table headers", () => {
            expect(() => {
                validateTableProportions(TABLE_HEADERS_1A_2M, TABLE_ROWS_1A);
            }).toThrow(errorMessage);
        });
    });

    describe("getIntersectionForDrilling", () => {
        it("should return intersection for attribute", () => {
            expect(
                getIntersectionForDrilling(EXECUTION_REQUEST_1M.execution.afm, TABLE_HEADERS_1A[0]),
            ).toEqual({
                id: "1st_attr_df_identifier",
                title: "Product",
                header: {
                    identifier: "1st_attr_df_identifier",
                    uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
                },
            });
        });

        it("should return intersection for simple measure", () => {
            expect(
                getIntersectionForDrilling(EXECUTION_REQUEST_1M.execution.afm, TABLE_HEADERS_1M[0]),
            ).toEqual({
                id: "1st_measure_local_identifier",
                title: "Lost",
                header: {
                    identifier: "1st_measure_identifier",
                    uri: "/gdc/md/project_id/obj/1st_measure_uri_id",
                },
            });
        });

        it("should return intersection for ad hoc measure", () => {
            expect(
                getIntersectionForDrilling(EXECUTION_REQUEST_POP.execution.afm, TABLE_HEADERS_POP[1]),
            ).toEqual({
                id: "pop_measure_local_identifier",
                title: "Close [BOP] - Previous year",
                header: {
                    identifier: "",
                    uri: "/gdc/md/project_id/obj/measure_uri_id",
                },
            });
        });

        it("should return intersection without header for arithmetic measure", () => {
            expect(
                getIntersectionForDrilling(EXECUTION_REQUEST_AM.execution.afm, TABLE_HEADERS_AM[3]),
            ).toEqual({
                id: "am1",
                title: "AM1(M1,M2)",
            });
        });
    });

    describe("Backward compatible row for drilling", () => {
        it("should get backward compatible row for drilling", () => {
            expect(getBackwardCompatibleRowForDrilling(TABLE_ROWS_2A_3M[0])).toEqual([
                { id: "3", name: "Computer" },
                { id: "71", name: "East Coast" },
                "1953605.55",
                "2115472",
                null,
            ]);
        });
    });
});
