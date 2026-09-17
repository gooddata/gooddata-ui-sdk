// (C) 2026 GoodData Corporation

import { type HeaderClassParams } from "ag-grid-enterprise";
import { describe, expect, it } from "vitest";

import { type ITableGrandTotalColumnDefinition, createIntlMock } from "@gooddata/sdk-ui";

import { type AgGridRowData } from "../../types/internal.js";

import { createTotalHeaderColDef } from "./totalHeaderColDef.js";

const intl = createIntlMock();

function createColumnDefinition(): ITableGrandTotalColumnDefinition & { isTransposed: true } {
    return {
        type: "grandTotal",
        isTransposed: true,
        columnScope: [{ type: "measureScope" }],
        totalHeader: { totalHeaderItem: { name: "SUM" } },
    } as unknown as ITableGrandTotalColumnDefinition & { isTransposed: true };
}

describe("createTotalHeaderColDef", () => {
    it("overrides the metric column's right-aligned styling - the header shows the total's text label, not a numeric value", () => {
        const colDef = createTotalHeaderColDef("total-col", createColumnDefinition(), intl);

        const headerClass = colDef.headerClass as (
            params: HeaderClassParams<AgGridRowData, string | null>,
        ) => string;
        const params = {
            colDef: { context: { columnDefinition: createColumnDefinition() } },
            columnGroup: undefined,
        } as unknown as HeaderClassParams<AgGridRowData, string | null>;

        const className = headerClass(params);

        expect(className).toContain("--metric");
        expect(className).toContain("--total-label");
    });
});
