// (C) 2019-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceMdExt, ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";
import { compositeBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { IAttribute, modifyAttribute } from "@gooddata/sdk-model";
import { createIntlMock } from "@gooddata/sdk-ui";

import { ColumnHeadersPosition } from "../../../types/transposition.js";
import { IPivotTableExecutionDefinitionParams, createExecutionDef } from "../createExecutionDef.js";
import { dataViewToColDefs } from "../dataViewToColDefs.js";
import { loadDataView } from "../loadDataView.js";

const workspace = "reference-workspace";
const backend = compositeBackend({
    workspace,
    backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings)),
});

const DEFAULT_PARAMS: IPivotTableExecutionDefinitionParams & {
    columnHeadersPosition: ColumnHeadersPosition;
} = {
    workspace,
    columns: [],
    rows: [],
    measures: [],
    filters: [],
    sortBy: [],
    totals: [],
    measureGroupDimension: "columns",
    columnHeadersPosition: "top",
    execConfig: {},
};

const modifiedCreatedYear: IAttribute = modifyAttribute(
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    (m) => m.localId("created.test"),
);

async function getRowData(
    params: Partial<
        IPivotTableExecutionDefinitionParams & {
            columnHeadersPosition: ColumnHeadersPosition;
        }
    >,
) {
    const paramsWithDefaults = {
        ...DEFAULT_PARAMS,
        ...params,
    };
    const executionDefinition = createExecutionDef(paramsWithDefaults);
    const executionResult = await backend
        .workspace(workspace)
        .execution()
        .forDefinition(executionDefinition)
        .execute();
    const dataView = await loadDataView({ executionResult, startRow: 0, endRow: 100 });
    const { columnDefsFlat } = dataViewToColDefs({
        dataView,
        columnHeadersPosition: paramsWithDefaults.columnHeadersPosition,
        columnWidths: [],
        drillableItemsRef: { current: [] },
        textWrapping: {},
        intl: createIntlMock(),
    });

    return columnDefsFlat.map((c) => c.colId);
}

// This is reusing recordings of base scenarios of the pivot table next in sdk-ui-tests
describe("dataViewToRowData", () => {
    describe("base", () => {
        it("should create col defs for single row attribute", async () => {
            const rowData = await getRowData({
                rows: [ReferenceMd.Product.Name],
            });
            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for single column attribute", async () => {
            const rowData = await getRowData({
                columns: [ReferenceMd.Product.Name],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for single metric", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for single metric with row attribute", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for single metric with column attribute", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for single metric with row and column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for single metric with two row and one column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for single metric with two row and two column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for two measures", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for two measures with row attribute", async () => {
            await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [ReferenceMd.Product.Name],
            });
        });

        it("should create col defs for two measures with column attribute", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for two measures with row and column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [ReferenceMd.Product.Name],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for two measures with two row and one column attributes", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for two measures with three rows and two column attributes", async () => {
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

        it("should create col defs for empty values", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for arithmetic measures", async () => {
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

        it("should create col defs for with attributes without measures", async () => {
            const rowData = await getRowData({
                rows: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
                columns: [ReferenceMd.Department.Default],
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for with two same dates", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.DateDatasets.Created.CreatedYear.Default, modifiedCreatedYear],
            });

            expect(rowData).toMatchSnapshot();
        });
    });

    describe("transposition", () => {
        it("should create col defs for single measure pivot with both attributes and metrics in rows", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount],
                rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
                columns: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
                measureGroupDimension: "rows",
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for two measures with single row attr with metrics in rows", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                rows: [ReferenceMd.Product.Name],
                measureGroupDimension: "rows",
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for two measures in rows and only column attrs on left", async () => {
            const rowData = await getRowData({
                measures: [ReferenceMd.Amount, ReferenceMd.Won],
                columns: [ReferenceMd.Department.Default, ReferenceMd.Region.Default],
                measureGroupDimension: "rows",
                columnHeadersPosition: "left",
            });

            expect(rowData).toMatchSnapshot();
        });

        it("should create col defs for two measures in rows and column attrs on top", async () => {
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
