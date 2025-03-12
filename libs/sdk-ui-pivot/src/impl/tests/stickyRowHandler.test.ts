// (C) 2007-2025 GoodData Corporation
import {
    IScrollPosition,
    stickyRowExists,
    updateStickyRowContentClassesAndData,
    updateStickyRowPosition,
} from "../stickyRowHandler.js";
import { IGroupingProvider } from "../data/rowGroupingProvider.js";
import { GridApi } from "ag-grid-community";
import { ROW_ATTRIBUTE_COLUMN } from "../base/constants.js";
import { describe, it, expect, vi } from "vitest";

describe("stickyRowHandler", () => {
    const fakeRow = {
        data: {
            r_0: "123",
            headerItemMap: {
                r_0: {
                    attributeHeaderItem: {
                        name: "Educationly",
                        uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=165847",
                    },
                },
            },
        },
    };

    const fakeGetDisplayedRowAtIndex = (): any => fakeRow;

    const fakeGetDisplayedRowAtIndexEmpty = (): any => ({});

    function getFakeGridApi(
        fakeGetDisplayedRowAtIndex: any = vi.fn(),
        fakeGetColumnDef: any = vi.fn(),
        fakeGetPinnedTopRow: any = () => ({ data: {} }),
        fakeSetPinnedTopRowData: any = vi.fn(),
        fakeUpdateGridOptions: any = vi.fn(),
    ): GridApi {
        const fakeGridApi = {
            getDisplayedRowAtIndex: fakeGetDisplayedRowAtIndex,
            getColumnDef: fakeGetColumnDef,
            getPinnedTopRow: fakeGetPinnedTopRow,
            setPinnedTopRowData: fakeSetPinnedTopRowData,
            updateGridOptions: fakeUpdateGridOptions,
        };
        return fakeGridApi as any;
    }

    function getFakeGroupingProvider(
        isRepeatedValueResult: boolean = false,
        isColumnWithGroupingResult: boolean = false,
    ): IGroupingProvider {
        const groupingProvider: any = {
            isRepeatedValue: vi.fn(() => isRepeatedValueResult),
            isColumnWithGrouping: vi.fn(() => isColumnWithGroupingResult),
        };
        return groupingProvider as IGroupingProvider;
    }

    function getFakeGridApiWrapper(): any {
        return {
            getHeaderHeight: vi.fn().mockReturnValue(0),
            getCellElement: vi.fn(),
            addCellClass: vi.fn(),
            removeCellClass: vi.fn(),
            getPinnedTopRowElement: vi.fn(),
            addPinnedTopRowClass: vi.fn(),
            removePinnedTopRowClass: vi.fn(),
            setPinnedTopRowStyles: vi.fn(),
        };
    }

    function assertOnlyListedMethodsHaveBeenCalled(obj: any, exceptMethodNames: string[]) {
        Object.getOwnPropertyNames(obj).forEach((propName) => {
            if (typeof obj[propName] === "function") {
                if (exceptMethodNames.indexOf(propName) >= 0) {
                    expect(obj[propName]).toHaveBeenCalled();
                } else {
                    expect(obj[propName]).not.toHaveBeenCalled();
                }
            }
        });
    }

    const TEST_ROW_HEIGHT = 10;

    describe("updateStickyRowContentClassesAndData", () => {
        it("should do nothing when scroll top and scroll left has not changed from last time", () => {
            const fakeGridApi = getFakeGridApi();
            const fakeGridApiWrapper = getFakeGridApiWrapper();
            const fakeGroupingProvider = getFakeGroupingProvider();
            const currentScrollPosition: IScrollPosition = {
                top: 5,
                left: 0,
            };
            const lastScrollPosition: IScrollPosition = {
                top: 5,
                left: 0,
            };

            updateStickyRowContentClassesAndData(
                currentScrollPosition,
                lastScrollPosition,
                TEST_ROW_HEIGHT,
                fakeGridApi,
                fakeGroupingProvider,
                fakeGridApiWrapper,
            );

            assertOnlyListedMethodsHaveBeenCalled(fakeGridApiWrapper, []);
        });

        it("should do nothing when scroll top change has not crossed row line", () => {
            const fakeGridApi = getFakeGridApi();
            const fakeGridApiWrapper = getFakeGridApiWrapper();
            const fakeGroupingProvider = getFakeGroupingProvider();
            const currentScrollPosition: IScrollPosition = {
                top: 6,
                left: 0,
            };
            const lastScrollPosition: IScrollPosition = {
                top: 5,
                left: 0,
            };

            updateStickyRowContentClassesAndData(
                currentScrollPosition,
                lastScrollPosition,
                TEST_ROW_HEIGHT,
                fakeGridApi,
                fakeGroupingProvider,
                fakeGridApiWrapper,
            );

            assertOnlyListedMethodsHaveBeenCalled(fakeGridApiWrapper, []);
        });

        it("should hide the sticky row when the row data are not available (still loading)", () => {
            const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndexEmpty);
            const fakeGridApiWrapper = getFakeGridApiWrapper();
            const fakeGroupingProvider = getFakeGroupingProvider();
            const currentScrollPosition: IScrollPosition = {
                top: 5000,
                left: 0,
            };
            const lastScrollPosition: IScrollPosition = {
                top: 5500,
                left: 0,
            };

            updateStickyRowContentClassesAndData(
                currentScrollPosition,
                lastScrollPosition,
                TEST_ROW_HEIGHT,
                fakeGridApi,
                fakeGroupingProvider,
                fakeGridApiWrapper,
            );

            expect(fakeGridApiWrapper.removePinnedTopRowClass).toHaveBeenCalledWith(
                fakeGridApi,
                "gd-visible-sticky-row",
            );
            assertOnlyListedMethodsHaveBeenCalled(fakeGridApiWrapper, ["removePinnedTopRowClass"]);
        });

        describe("current scroll top belongs to different line than the last one", () => {
            const fakeGetColumnDef = (): any => ({ colId: "r_0", type: ROW_ATTRIBUTE_COLUMN });
            const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex, fakeGetColumnDef);
            const fakeGridApiWrapper = getFakeGridApiWrapper();
            const fakeGroupingProvider = getFakeGroupingProvider(false, false);
            const currentScrollPosition: IScrollPosition = {
                top: 100,
                left: 0,
            };
            const lastScrollPosition: IScrollPosition = {
                top: 50,
                left: 0,
            };

            updateStickyRowContentClassesAndData(
                currentScrollPosition,
                lastScrollPosition,
                TEST_ROW_HEIGHT,
                fakeGridApi,
                fakeGroupingProvider,
                fakeGridApiWrapper,
            );

            it("should show the sticky row", () => {
                expect(fakeGridApiWrapper.addPinnedTopRowClass).toHaveBeenCalledWith(
                    fakeGridApi,
                    "gd-visible-sticky-row",
                );
            });

            it("should hide temporarily shown cell from previous scroll position", () => {
                expect(fakeGridApiWrapper.removeCellClass).toHaveBeenCalledWith(
                    fakeGridApi,
                    "r_0",
                    5,
                    "gd-cell-show-hidden",
                );
            });
        });

        describe("current scroll left change reached update threshold", () => {
            const fakeGetColumnDef = (): any => ({ colId: "r_0", type: ROW_ATTRIBUTE_COLUMN });
            const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex, fakeGetColumnDef);
            const fakeGridApiWrapper = getFakeGridApiWrapper();
            const fakeGroupingProvider = getFakeGroupingProvider(false, false);
            const currentScrollPosition: IScrollPosition = {
                top: 100,
                left: 50,
            };
            const lastScrollPosition: IScrollPosition = {
                top: 100,
                left: 70,
            };

            updateStickyRowContentClassesAndData(
                currentScrollPosition,
                lastScrollPosition,
                TEST_ROW_HEIGHT,
                fakeGridApi,
                fakeGroupingProvider,
                fakeGridApiWrapper,
            );

            it("should show the sticky row", () => {
                expect(fakeGridApiWrapper.addPinnedTopRowClass).toHaveBeenCalledWith(
                    fakeGridApi,
                    "gd-visible-sticky-row",
                );
            });

            it("should hide temporarily shown cell from previous scroll position", () => {
                expect(fakeGridApiWrapper.removeCellClass).toHaveBeenCalledWith(
                    fakeGridApi,
                    "r_0",
                    10,
                    "gd-cell-show-hidden",
                );
            });
        });

        describe("column without repetitions i.e. without grouping", () => {
            const fakeGetColumnDef = (): any => ({ colId: "r_0", type: ROW_ATTRIBUTE_COLUMN });
            const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex, fakeGetColumnDef);
            const fakeGridApiWrapper = getFakeGridApiWrapper();
            const fakeGroupingProvider = getFakeGroupingProvider(false, false);
            const currentScrollPosition: IScrollPosition = {
                top: 50,
                left: 0,
            };
            const lastScrollPosition: IScrollPosition = {
                top: 100,
                left: 0,
            };

            updateStickyRowContentClassesAndData(
                currentScrollPosition,
                lastScrollPosition,
                TEST_ROW_HEIGHT,
                fakeGridApi,
                fakeGroupingProvider,
                fakeGridApiWrapper,
            );

            it("should keep sticky row data empty", () => {
                expect(fakeGridApi.setPinnedTopRowData).not.toHaveBeenCalled();
            });

            it("should not temporarily show table cell behind", () => {
                expect(fakeGridApiWrapper.addCellClass).not.toHaveBeenCalled();
            });
        });

        describe("column with repetitions and grouping when the current cell IS the end of its group", () => {
            const fakeGetColumnDef = (): any => ({ colId: "r_0", type: ROW_ATTRIBUTE_COLUMN });
            const fakeGetPinnedTopRow = () => fakeRow;
            const fakeGridApi = getFakeGridApi(
                fakeGetDisplayedRowAtIndex,
                fakeGetColumnDef,
                fakeGetPinnedTopRow,
            );
            const fakeGridApiWrapper = getFakeGridApiWrapper();
            const fakeGroupingProvider = getFakeGroupingProvider(false, true);
            const currentScrollPosition: IScrollPosition = {
                top: 100,
                left: 0,
            };
            const lastScrollPosition: IScrollPosition = {
                top: 50,
                left: 0,
            };

            updateStickyRowContentClassesAndData(
                currentScrollPosition,
                lastScrollPosition,
                TEST_ROW_HEIGHT,
                fakeGridApi,
                fakeGroupingProvider,
                fakeGridApiWrapper,
            );

            it("should set empty sticky row data", () => {
                expect(fakeGridApi.updateGridOptions).toHaveBeenCalledWith({ pinnedTopRowData: [{}] });
            });

            it("should temporarily show table cell behind", () => {
                expect(fakeGridApiWrapper.addCellClass).toHaveBeenCalledWith(
                    fakeGridApi,
                    "r_0",
                    10,
                    "gd-cell-show-hidden",
                );
            });
        });

        describe("column with repetitions and grouping when the current cell IS NOT the end of its group", () => {
            const fakeGetColumnDef = (): any => ({ colId: "r_0", type: ROW_ATTRIBUTE_COLUMN });
            const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex, fakeGetColumnDef);
            const fakeGridApiWrapper = getFakeGridApiWrapper();
            const fakeGroupingProvider = getFakeGroupingProvider(true, true);
            const currentScrollPosition: IScrollPosition = {
                top: 100,
                left: 0,
            };
            const lastScrollPosition: IScrollPosition = {
                top: 50,
                left: 0,
            };

            updateStickyRowContentClassesAndData(
                currentScrollPosition,
                lastScrollPosition,
                TEST_ROW_HEIGHT,
                fakeGridApi,
                fakeGroupingProvider,
                fakeGridApiWrapper,
            );

            it("should set correct sticky row data", () => {
                expect(fakeGridApi.updateGridOptions).toHaveBeenCalledWith({
                    pinnedTopRowData: [fakeRow.data],
                });
            });

            it("should not temporarily show table cell behind", () => {
                expect(fakeGridApiWrapper.addCellClass).not.toHaveBeenCalled();
            });
        });
    });

    describe("updateStickyRowPosition", () => {
        const api = getFakeGridApi();
        const apiWrapper = getFakeGridApiWrapper();

        updateStickyRowPosition(api, apiWrapper);

        it("should set top and padding-right styles", () => {
            expect(apiWrapper.setPinnedTopRowStyles).toHaveBeenCalledWith(api, {
                top: "0px",
                "padding-right": "0px",
            });
        });
    });

    describe("stickyRowExists", () => {
        const api = getFakeGridApi();

        it("should return true if sticky row exists", () => {
            const apiWrapper = getFakeGridApiWrapper();
            apiWrapper.getPinnedTopRowElement.mockReturnValue({});
            expect(stickyRowExists(api, apiWrapper)).toEqual(true);
        });
        it("should return false if sticky row doesn't exit", () => {
            const apiWrapper = getFakeGridApiWrapper();
            apiWrapper.getPinnedTopRowElement.mockReturnValue(undefined);
            expect(stickyRowExists(api, apiWrapper)).toEqual(false);
        });
    });
});
