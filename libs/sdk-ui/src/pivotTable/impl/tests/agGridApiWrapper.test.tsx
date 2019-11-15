// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { AgGridReact } from "ag-grid-react";

import ApiWrapper from "../agGridApiWrapper";
import { GridApi, GridReadyEvent, IDatasource, IGetRowsParams, ICellRendererParams } from "ag-grid-community";
import { ICustomGridOptions } from "../agGridTypes";

describe("agGridApiWrapper", () => {
    const firstAttributeColumnId = "a_123";
    const secondAttributeColumnId = "a_987";
    const firstAttributePinnedTopValue = "Attr #1 Pinned top value";
    const firstAttributeFirstRowValue = "Attr #1 Row #1";

    function renderComponent(customProps = {}) {
        const datasource: IDatasource = {
            getRows: (params: IGetRowsParams) => {
                params.successCallback([
                    {
                        [firstAttributeColumnId]: firstAttributeFirstRowValue,
                    },
                ]);
            },
        };

        const gridOptions: ICustomGridOptions = {
            rowModelType: "infinite",
            datasource,
            columnDefs: [
                {
                    children: [
                        {
                            headerName: "Attr #1",
                            field: firstAttributeColumnId,
                            cellRenderer: (params: ICellRendererParams) => {
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

        const defaultProps = { gridOptions };

        return mount(<AgGridReact {...defaultProps} {...customProps} />);
    }

    async function renderGridReady() {
        return new Promise<GridApi>(resolve => {
            const onGridReady = (params: GridReadyEvent) => {
                params.api.setPinnedTopRowData([{ [firstAttributeColumnId]: firstAttributePinnedTopValue }]);
                resolve(params.api);
            };
            renderComponent({ onGridReady });
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
            (api as any).paginationProxy.bottomRowIndex = undefined;

            const paginationBottomRowIndex = ApiWrapper.getPaginationBottomRowIndex(api);

            expect(paginationBottomRowIndex).toEqual(null);
        });

        it("should return number when GridApi return 0 as bottomRowIndex", async () => {
            const api = await renderGridReady();
            (api as any).paginationProxy.bottomRowIndex = 0;

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
                expect(cellElement.classList.contains("ag-cell")).toBe(true);
            });
        });

        describe("addCellClass", () => {
            it("should add class to a table cell element", async () => {
                const api = await renderGridReady();
                const newClassName = "added_class";

                ApiWrapper.addCellClass(api, firstAttributeColumnId, 0, newClassName);

                const cellElement = ApiWrapper.getCellElement(api, firstAttributeColumnId, 0);
                expect(cellElement.classList.contains(newClassName)).toBe(true);
            });
        });

        describe("removeCellClass", () => {
            it("should remove class from a table cell element", async () => {
                const api = await renderGridReady();
                const newClassName = "added_class";

                ApiWrapper.addCellClass(api, firstAttributeColumnId, 0, newClassName);
                ApiWrapper.removeCellClass(api, firstAttributeColumnId, 0, newClassName);

                const cellElement = ApiWrapper.getCellElement(api, firstAttributeColumnId, 0);
                expect(cellElement.classList.contains(newClassName)).toBe(false);
            });
        });
    });

    describe("pinned top row element", () => {
        describe("getPinnedTopRowElement", () => {
            it("should return top row element", async () => {
                const api = await renderGridReady();

                const element = ApiWrapper.getPinnedTopRowElement(api);

                expect(element.classList.contains("ag-floating-top")).toBe(true);
                expect(element instanceof HTMLElement).toBe(true);
            });
        });

        describe("addPinnedTopRowClass", () => {
            it("should add class to a pinned row element", async () => {
                const api = await renderGridReady();
                const newPinnedRowClassName = "added_class";

                ApiWrapper.addPinnedTopRowClass(api, newPinnedRowClassName);

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowElement(api);
                expect(pinnedTopRowElement.classList.contains(newPinnedRowClassName)).toBe(true);
            });
        });

        describe("removePinnedTopRowClass", () => {
            it("should remove class from the pinned row element", async () => {
                const api = await renderGridReady();
                const newPinnedRowClassName = "added_class";

                ApiWrapper.addPinnedTopRowClass(api, newPinnedRowClassName);
                ApiWrapper.removePinnedTopRowClass(api, newPinnedRowClassName);

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowElement(api);
                expect(pinnedTopRowElement.classList.contains(newPinnedRowClassName)).toBe(false);
            });
        });

        describe("setPinnedTopRowStyle", () => {
            it("should set style of the DOM element", async () => {
                const api = await renderGridReady();

                ApiWrapper.setPinnedTopRowStyle(api, "max-width", "123px");

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowElement(api);
                expect(pinnedTopRowElement.style["max-width"]).toEqual("123px");
            });
        });
    });

    describe("pinned top row cell element", () => {
        describe("getPinnedTopRowCellElementWrapper", () => {
            it("should return the pinned top row cell element wrapper", async () => {
                const api = await renderGridReady();

                const cellElement = ApiWrapper.getPinnedTopRowCellElementWrapper(api, firstAttributeColumnId);

                expect(cellElement instanceof HTMLElement).toBe(true);
                expect(!!cellElement.querySelector("span")).toEqual(true);
                expect(cellElement.classList.contains("ag-cell")).toBe(true);
            });
        });

        describe("getPinnedTopRowCellElement", () => {
            it("should return the pinned top row cell element", async () => {
                const api = await renderGridReady();

                const cellElement = ApiWrapper.getPinnedTopRowCellElement(api, firstAttributeColumnId);

                expect(cellElement.innerHTML).toEqual(firstAttributePinnedTopValue);
            });
        });

        describe("addPinnedTopRowCellClass", () => {
            it("should add a class to the pinned top row cell element", async () => {
                const api = await renderGridReady();
                const newPinnedRowCellClassName = "added_class";

                ApiWrapper.addPinnedTopRowCellClass(api, firstAttributeColumnId, newPinnedRowCellClassName);

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowCellElementWrapper(
                    api,
                    firstAttributeColumnId,
                );
                expect(pinnedTopRowElement.classList.contains(newPinnedRowCellClassName)).toBe(true);
            });
        });

        describe("removePinnedTopRowCellClass", () => {
            it("should remove a class from the pinned top row cell element", async () => {
                const api = await renderGridReady();
                const newPinnedRowCellClassName = "added_class";

                ApiWrapper.addPinnedTopRowCellClass(api, firstAttributeColumnId, newPinnedRowCellClassName);
                ApiWrapper.removePinnedTopRowCellClass(
                    api,
                    firstAttributeColumnId,
                    newPinnedRowCellClassName,
                );

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowCellElementWrapper(
                    api,
                    firstAttributeColumnId,
                );
                expect(pinnedTopRowElement.classList.contains(newPinnedRowCellClassName)).toBe(false);
            });
        });

        describe("setPinnedTopRowCellText", () => {
            it("should set innerText of the pinned top row cell element", async () => {
                const api = await renderGridReady();

                ApiWrapper.setPinnedTopRowCellText(api, firstAttributeColumnId, "new_text");

                const pinnedTopRowElement = ApiWrapper.getPinnedTopRowCellElement(
                    api,
                    firstAttributeColumnId,
                );

                expect(pinnedTopRowElement.innerText).toEqual("new_text");
            });
        });
    });
});
