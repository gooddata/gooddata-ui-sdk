// (C) 2019-2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { ReferenceMd, ReferenceMdExt, ReferenceRecordings } from "@gooddata/reference-workspace";
import { compositeBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { withNormalization } from "@gooddata/sdk-backend-base";
import { IAttribute, modifyAttribute } from "@gooddata/sdk-model";
import { getExecution, getPaginatedExecutionDataView, IGetExecutionParams } from "../getExecution.js";
import { dataViewToRowData } from "../dataViewToRowData.js";
import { ColumnHeadersPosition } from "../../../types/public.js";

const workspace = "reference-workspace";
const backend = compositeBackend({
    workspace,
    backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings)),
});

const DEFAULT_PARAMS: IGetExecutionParams & {
    columnHeadersPosition: ColumnHeadersPosition;
} = {
    backend,
    workspace,
    columns: [],
    rows: [],
    measures: [],
    filters: [],
    sortBy: [],
    totals: [],
    measureGroupDimension: "columns",
    columnHeadersPosition: "top",
};

const modifiedCreatedYear: IAttribute = modifyAttribute(
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    (m) => m.localId("created.test"),
);

async function getRowData(
    params: Partial<
        IGetExecutionParams & {
            columnHeadersPosition: ColumnHeadersPosition;
        }
    >,
) {
    const paramsWithDefaults = {
        ...DEFAULT_PARAMS,
        ...params,
    };
    const execution = getExecution(paramsWithDefaults);
    const executionResult = await execution.execute();
    const dataView = await getPaginatedExecutionDataView({ executionResult, startRow: 0, endRow: 100 });
    const rowData = dataViewToRowData(dataView, params.columnHeadersPosition!);

    // TODO: remove once typed properly
    rowData.rowData.forEach((row) => {
        delete row.meta;
        delete row.row;
    });

    return {
        rowData: rowData.rowData,
        grandTotalRowData: rowData.grandTotalRowData,
    };
}

// This is reusing recordings of base scenarios of the pivot table next in sdk-ui-tests
describe("dataViewToRowData", () => {
    describe("base", () => {
        it("should create row data for single row attribute", async () => {
            const rowData = await getRowData({
                rows: [ReferenceMd.Product.Name],
            });
            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for single column attribute", async () => {
            const rowData = await getRowData({
                columns: [ReferenceMd.Product.Name],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for single metric", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for single metric with row attribute", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for single metric with column attribute", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for single metric with row and column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for single metric with two row and one column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for single metric with two row and two column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for two measures", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for two measures with row attribute", async () => {
            await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [ReferenceMd.Product.Name],
            });
        });

        it("should create row data for two measures with column attribute", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for two measures with row and column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [ReferenceMd.Product.Name],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for two measures with two row and one column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for two measures with three rows and two column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [
                    ReferenceMd.Product.Name,
                    ReferenceMd.Department.Default,
                    ReferenceMd.SalesRep.Default,
                ],
                columns: [ReferenceMd.ForecastCategory, ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for empty values", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for arithmetic measures", async () => {
            const rowData = await getRowData({
                measures: [
                    ReferenceMd.Amount,
                    ReferenceMd.Won,
                    ReferenceMdExt.CalculatedLost,
                    ReferenceMdExt.CalculatedWonLostRatio,
                ],
                rows: [ReferenceMd.Product.Name],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for with attributes without measures", async () => {
            const rowData = await getRowData({
                rows: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
                columns: [ReferenceMd.Department.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for with two same dates", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.DateDatasets.Created.CreatedYear.Default, modifiedCreatedYear],
            });

            expect(rowData).toMatchSnapshot();
        });
    });

    describe("transposition", () => {
        it("should create row data for single measure pivot with both attributes and metrics in rows", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
                measureGroupDimension: "rows",
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for two measures with single row attr with metrics in rows", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [ReferenceMd.Product.Name],
                measureGroupDimension: "rows",
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for two measures in rows and only column attrs on left", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                columns: [ReferenceMd.Department.Default, ReferenceMd.Region.Default],
                measureGroupDimension: "rows",
                columnHeadersPosition: "left",
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create row data for two measures in rows and column attrs on top", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                columns: [ReferenceMd.Department.Default, ReferenceMd.Region.Default],
                measureGroupDimension: "rows",
                columnHeadersPosition: "top",
            });

            expect(rowData).toMatchSnapshot();
        });
    });
});
