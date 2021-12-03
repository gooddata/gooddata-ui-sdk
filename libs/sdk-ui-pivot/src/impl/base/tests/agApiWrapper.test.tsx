// (C) 2007-2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { AgGridReact } from "@ag-grid-community/react";

import ApiWrapper from "../agApiWrapper";
import {
    AllCommunityModules,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
} from "@ag-grid-community/all-modules";
import { ICustomGridOptions } from "../../privateTypes";

describe("agGridApiWrapper", () => {
    const firstAttributeColumnId = "a_123";
    const secondAttributeColumnId = "a_987";
    const firstAttributePinnedTopValue = "Attr #1 Pinned top value";
    const firstAttributeFirstRowValue = "Attr #1 Row #1";

    function renderComponent(resolve: (gridApi: GridApi) => void, customProps = {}) {
        const gridOptions: ICustomGridOptions = {
            rowData: [
                {
                    [firstAttributeColumnId]: firstAttributeFirstRowValue,
                },
            ],
            columnDefs: [
                {
                    children: [
                        {
                            headerName: "Attr #1",
                            field: firstAttributeColumnId,
                            cellRenderer: (params: ICellRendererParams) => {
                                /*
                                 * resolve 'component rendered' promise after at least one value is actually rendered;
                                 *
                                 * this was needed to fix flaky tests; they were crashing because we look at ag-grid
                                 * internals (:() and from them query rendered DOM element.
                                 *
                                 * if the promise is resolved earlier than this, then ag-grid internals (row/cell)
                                 * are in place but query for span that contains value will return null because
                                 * nothing is yet rendered in that cell.
                                 *
                                 * NOTE: there is something seriously wrong in how we do this sticky-ness, this flaky
                                 * test is a symptom of a deeper problem; suspicion is that we need to use different
                                 * approach to obtain the stickied row.. perhaps instrument our renderers to help with
                                 * it.. same as this test cell renderer does :/
                                 */
                                resolve(params.api);
                                return params.value;
                            },
                        },
                        {
                            headerName: "Attr #2",
                            field: secondAttributeColumnId,
                        },
                    ],
                },
            ],
        };

        return mount(<AgGridReact modules={AllCommunityModules} {...gridOptions} {...customProps} />);
    }

    async function renderGridReady() {
        return new Promise<GridApi>((resolve) => {
            const onGridReady = (params: GridReadyEvent) => {
                params.api.setPinnedTopRowData([{ [firstAttributeColumnId]: firstAttributePinnedTopValue }]);
            };

            renderComponent(resolve, { onGridReady });
        });
    }

    describe("getHeaderHeight", () => {
        it("should return height of grid header", async () => {
            const api = await renderGridReady();

            const headerHeight = ApiWrapper.getHeaderHeight(api);

            expect(typeof headerHeight).toEqual("number");
        });
    });

    describe("getPaginationBottomRowIndex", () => {
        it("should return actual row index ", async () => {
            const api = await renderGridReady();

            const paginationBottomRowIndex = ApiWrapper.getPaginationBottomRowIndex(api);

            expect(typeof paginationBottomRowIndex).toEqual("number");
        });

        it("should return null when GridApi is not providing paginationProxy attribute", async () => {
            const api = await renderGridReady();
            (api as any).paginationProxy = undefined;

            const paginationBottomRowIndex = ApiWrapper.getPaginationBottomRowIndex(api);

            expect(paginationBottomRowIndex).toEqual(null);
        });

        it("should return null when GridApi is not providing bottomRowIndex attribute", async () => {
            const api = await renderGridReady();
            (api as any).paginationProxy.bottomRowBounds = undefined;

            const paginationBottomRowIndex = ApiWrapper.getPaginationBottomRowIndex(api);

            expect(paginationBottomRowIndex).toEqual(null);
        });

        it("should return number when GridApi return 0 as bottomRowIndex", async () => {
            const api = await renderGridReady();
            (api as any).paginationProxy.bottomRowBounds = { rowIndex: 0 };

            const paginationBottomRowIndex = ApiWrapper.getPaginationBottomRowIndex(api);

            expect(paginationBottomRowIndex).toEqual(0);
        });
    });

    describe("cell element", () => {
        describe("getCellElement", () => {
            it("should return table cell element", async () => {
                const api = await renderGridReady();

                const cellElement = ApiWrapper.getCellElement(api, firstAttributeColumnId, 0);

                expect(cellElement instanceof HTMLElement).toBe(true);
                expect(cellElement!.classList.contains("ag-cell")).toBe(true);
            });
        });

        describe("addCellClass", () => {
            it("should add class to a table cell element", async () => {
                const api = await renderGridReady();
                const newClassName = "added_class";

                ApiWrapper.addCellClass(api, firstAttributeColumnId, 0, newClassName);

                const cellElement = ApiWrapper.getCellElement(api, firstAttributeColumnId, 0);

                expect(cellElement).toBeDefined();
                expect(cellElement!.classList.contains(newClassName)).toBe(true);
            });
        });

        describe("removeCellClass", () => {
            it("should remove class from a table cell element", async () => {
                const api = await renderGridReady();
                const newClassName = "added_class";

                ApiWrapper.addCellClass(api, firstAttributeColumnId, 0, newClassName);
                ApiWrapper.removeCellClass(api, firstAttributeColumnId, 0, newClassName);

                const cellElement = ApiWrapper.getCellElement(api, firstAttributeColumnId, 0);

                expect(cellElement).toBeDefined();
                expect(cellElement!.classList.contains(newClassName)).toBe(false);
            });
        });
    });

    describe("pinned top row element", () => {
        describe("getPinnedTopRowElement", () => {
            it("should return top row element", async () => {
                const api = await renderGridReady();

                const element = ApiWrapper.getPinnedTopRowElement(api);

                expect(element instanceof HTMLElement).toBe(true);
                expect(element!.classList.contains("ag-floating-top")).toBe(true);
            });
        });

        describe("addPinnedTopRowClass", () => {
            it("should add class to a pinned row element", async () => {
                const api = await renderGridReady();
                const newPinnedRowClassName = "added_class";

                ApiWrapper.addPinnedTopRowClass(api, newPinnedRowClassName);

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowElement(api);

                expect(pinnedTopRowElement).toBeDefined();
                expect(pinnedTopRowElement!.classList.contains(newPinnedRowClassName)).toBe(true);
            });
        });

        describe("removePinnedTopRowClass", () => {
            it("should remove class from the pinned row element", async () => {
                const api = await renderGridReady();
                const newPinnedRowClassName = "added_class";

                ApiWrapper.addPinnedTopRowClass(api, newPinnedRowClassName);
                ApiWrapper.removePinnedTopRowClass(api, newPinnedRowClassName);

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowElement(api);

                expect(pinnedTopRowElement).toBeDefined();
                expect(pinnedTopRowElement!.classList.contains(newPinnedRowClassName)).toBe(false);
            });
        });

        describe("setPinnedTopRowStyle", () => {
            it("should set style of the DOM element", async () => {
                const api = await renderGridReady();

                ApiWrapper.setPinnedTopRowStyle(api, "max-width", "123px");

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowElement(api);

                expect(pinnedTopRowElement).toBeDefined();
                expect(pinnedTopRowElement!.style["max-width"]).toEqual("123px");
            });
        });
    });
});
