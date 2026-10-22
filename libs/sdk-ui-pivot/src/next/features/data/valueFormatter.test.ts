// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeAll, describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";
import { compositeBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type IResultHeader,
    type ISeparators,
    isAttributeDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";
import { DataViewFacade, type ITableAttributeHeaderValue } from "@gooddata/sdk-ui";

import { createExecutionDef } from "./createExecutionDef.js";
import { loadDataView } from "./loadDataView.js";
import { getTableData } from "./valueFormatter.js";

const workspace = "reference-workspace";
const backend = compositeBackend({
    workspace,
    backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings)),
});

let recordedDataView: IDataView;

beforeAll(async () => {
    const executionDefinition = createExecutionDef({
        workspace,
        columns: [],
        rows: [ReferenceMd.Product.Name],
        measures: [ReferenceMd.Amount],
        filters: [],
        sortBy: [],
        totals: [],
        measureGroupDimension: "columns",
        execConfig: {},
    });
    const executionResult = await backend
        .workspace(workspace)
        .execution()
        .forDefinition(executionDefinition)
        .execute();
    const facade = await loadDataView({ executionResult, startRow: 0, endRow: 100 });
    recordedDataView = facade.dataView;
});

/**
 * Data view whose row attribute has a number format and numeric element values.
 */
function numericAttributeDataView(): IDataView {
    const dimensions = recordedDataView.result.dimensions.map((dimension) => ({
        ...dimension,
        headers: dimension.headers.map((header) =>
            isAttributeDescriptor(header)
                ? { attributeHeader: { ...header.attributeHeader, numberFormat: "#,##0.00" } }
                : header,
        ),
    }));
    const headerItems = recordedDataView.headerItems.map((dimension) =>
        dimension.map((headers) =>
            headers.map((header, index): IResultHeader =>
                isResultAttributeHeader(header)
                    ? { attributeHeaderItem: { uri: `${1000 + index}`, name: `${1000 + index}` } }
                    : header,
            ),
        ),
    );

    return Object.create(recordedDataView, {
        result: { value: { ...recordedDataView.result, dimensions } },
        headerItems: { value: headerItems },
    }) as IDataView;
}

function attributeCells(dataView: DataViewFacade) {
    return getTableData(dataView)
        .data.flat()
        .filter((cell): cell is ITableAttributeHeaderValue => cell.type === "attributeHeader");
}

describe("getTableData", () => {
    it("should format element values of attributes with a number format and keep the raw value", () => {
        const [first] = attributeCells(DataViewFacade.for(numericAttributeDataView()));

        expect(first.formattedValue).toEqual("1,000.00");
        expect(first.value.attributeHeaderItem.name).toEqual("1000");
    });

    it("should build the table data once per data view", () => {
        const dataView = DataViewFacade.for(numericAttributeDataView());

        expect(getTableData(dataView)).toBe(getTableData(dataView));
    });

    it("should format the data view again when the separators change", () => {
        const dataView = DataViewFacade.for(numericAttributeDataView());
        const cells = (separators: ISeparators) =>
            getTableData(dataView, separators)
                .data.flat()
                .filter((cell): cell is ITableAttributeHeaderValue => cell.type === "attributeHeader");

        expect(cells({ thousand: ",", decimal: "." })[0].formattedValue).toEqual("1,000.00");
        expect(cells({ thousand: " ", decimal: "," })[0].formattedValue).toEqual("1 000,00");
    });

    it("should keep the table data of the data view itself when nothing needs formatting", () => {
        const dataView = DataViewFacade.for(recordedDataView);

        expect(getTableData(dataView)).toBe(dataView.data().asTable());
    });
});
