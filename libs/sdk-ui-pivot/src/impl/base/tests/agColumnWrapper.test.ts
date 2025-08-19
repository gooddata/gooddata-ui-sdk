// (C) 2007-2025 GoodData Corporation

import { Column, GridApi } from "ag-grid-community";
import { describe, expect, it } from "vitest";

import { setColumnMaxWidth, setColumnMaxWidthIf } from "../agColumnWrapper.js";

describe("agColumnWrapper", () => {
    function getFakeColumnApi(columnsMaps: { [id: string]: Column }): GridApi {
        const fakeColumnApi = {
            getColumn: (columnId: string) => {
                return columnsMaps[columnId];
            },
        };
        return fakeColumnApi as GridApi;
    }

    function getFakeColumn(columnDefinition: any): Column {
        const fakeColumn = {
            getColDef: () => {
                return columnDefinition;
            },
        };

        return fakeColumn as Column;
    }

    describe("setColumnMaxWidth", () => {
        it("should set internal property maxWidth of column and column.getColDef().maxWidth", async () => {
            const maxWidth = 500;
            const columnDef1 = { maxWidth: undefined as unknown as number };
            const columnDef2 = { maxWidth: undefined as unknown as number };

            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
            };

            const columnApi = getFakeColumnApi(columnsMaps);

            setColumnMaxWidth(columnApi, ["colId2"], maxWidth);

            expect(columnDef2.maxWidth).toEqual(maxWidth);
            // check for private property maxWidth of column
            expect((columnsMaps.colId2 as any).maxWidth).toEqual(maxWidth);
        });
    });

    describe("setColumnMaxWidthIf", () => {
        it("should set internal property maxWidth of column and column.getColDef().maxWidth when condition is true", async () => {
            const maxWidth = 500;
            const columnDef1 = { maxWidth: undefined as unknown as number };
            const columnDef2 = { maxWidth: undefined as unknown as number };

            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
            };

            const columnApi = getFakeColumnApi(columnsMaps);

            setColumnMaxWidthIf(columnApi, ["colId2"], maxWidth, () => true);

            expect(columnDef2.maxWidth).toEqual(maxWidth);
            // check for private property maxWidth of column
            expect((columnsMaps.colId2 as any).maxWidth).toEqual(maxWidth);
        });

        it("should not set internal property maxWidth of column and column.getColDef().maxWidth when condition is false", async () => {
            const maxWidth = 500;
            const columnDef1 = { maxWidth: undefined as unknown as number };
            const columnDef2 = { maxWidth: undefined as unknown as number };

            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
            };

            const columnApi = getFakeColumnApi(columnsMaps);

            setColumnMaxWidthIf(columnApi, ["colId2"], maxWidth, () => false);

            expect(columnDef2.maxWidth).toEqual(undefined);
            // check for private property maxWidth of column
            expect((columnsMaps.colId2 as any).maxWidth).toEqual(undefined);
        });
    });
});
