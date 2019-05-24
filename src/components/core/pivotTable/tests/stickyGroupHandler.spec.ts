// (C) 2007-2018 GoodData Corporation
import { stickyRowExists, updateStickyHeaders, updateStickyHeadersPosition } from "../stickyGroupHandler";
import { IGroupingProvider } from "../GroupingProvider";
import { GridApi } from "ag-grid-community";

describe("updateStickyHeaders", () => {
    function getFakeGridApi(fakeGetDisplayedRowAtIndex: any = jest.fn()): GridApi {
        const fakeGridApi = {
            getDisplayedRowAtIndex: fakeGetDisplayedRowAtIndex,
        };
        return fakeGridApi as GridApi;
    }

    function getFakeGroupingProvider(
        isRepeatedValueResult: boolean = false,
        isColumnWithGroupingResult: boolean = false,
    ): IGroupingProvider {
        const groupingProvider: any = {
            isRepeatedValue: jest.fn(() => isRepeatedValueResult),
            isColumnWithGrouping: jest.fn(() => isColumnWithGroupingResult),
        };
        return groupingProvider as IGroupingProvider;
    }

    function getFakeGridApiWrapper(): any {
        return {
            getHeaderHeight: jest.fn().mockReturnValue(0),
            getCellElement: jest.fn(),
            addCellClass: jest.fn(),
            removeCellClass: jest.fn(),
            getPinnedTopRowElement: jest.fn(),
            addPinnedTopRowClass: jest.fn(),
            removePinnedTopRowClass: jest.fn(),
            setPinnedTopRowStyle: jest.fn(),
            getPinnedTopRowCellElement: jest.fn(),
            getPinnedTopRowCellElementWrapper: jest.fn(),
            addPinnedTopRowCellClass: jest.fn(),
            removePinnedTopRowCellClass: jest.fn(),
            setPinnedTopRowCellText: jest.fn(),
        };
    }

    function assertOnlyListedMethodsHaveBeenCalled(obj: any, exceptMethodNames: string[]) {
        Object.getOwnPropertyNames(obj).forEach(propName => {
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

    it("should do nothing when scroll top and scroll left has not changed from last time", () => {
        const fakeGridApi = getFakeGridApi();
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider();
        const currentScrollTop = 5;
        const lastScrollTop = 5;
        const currentScrollLeft = 0;
        const lastScrollLeft = 0;

        updateStickyHeaders(
            currentScrollTop,
            currentScrollLeft,
            lastScrollTop,
            lastScrollLeft,
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
        const currentScrollTop = 6;
        const lastScrollTop = 5;
        const currentScrollLeft = 0;
        const lastScrollLeft = 0;

        updateStickyHeaders(
            currentScrollTop,
            currentScrollLeft,
            lastScrollTop,
            lastScrollLeft,
            TEST_ROW_HEIGHT,
            fakeGridApi,
            fakeGroupingProvider,
            fakeGridApiWrapper,
        );

        assertOnlyListedMethodsHaveBeenCalled(fakeGridApiWrapper, []);
    });

    it("should hide the sticky row when the row data are not available (still loading)", () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({});
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider();
        const currentScrollTop = 5000;
        const lastScrollTop = 5500;
        const currentScrollLeft = 0;
        const lastScrollLeft = 0;

        updateStickyHeaders(
            currentScrollTop,
            currentScrollLeft,
            lastScrollTop,
            lastScrollLeft,
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
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: "123" } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(false, false);
        const currentScrollTop = 100;
        const lastScrollTop = 50;
        const currentScrollLeft = 0;
        const lastScrollLeft = 0;

        updateStickyHeaders(
            currentScrollTop,
            currentScrollLeft,
            lastScrollTop,
            lastScrollLeft,
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
                "a_123",
                5,
                "gd-cell-show-hidden",
            );
        });
    });

    describe("current scroll left change reached update threshold", () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: "123" } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(false, false);
        const currentScrollTop = 100;
        const lastScrollTop = 100;
        const currentScrollLeft = 50;
        const lastScrollLeft = 70;

        updateStickyHeaders(
            currentScrollTop,
            currentScrollLeft,
            lastScrollTop,
            lastScrollLeft,
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
                "a_123",
                10,
                "gd-cell-show-hidden",
            );
        });
    });

    describe("column without repetitions i.e. without grouping", () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: "123" } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(false, false);
        const currentScrollTop = 50;
        const lastScrollTop = 100;
        const currentScrollLeft = 0;
        const lastScrollLeft = 0;

        updateStickyHeaders(
            currentScrollTop,
            currentScrollLeft,
            lastScrollTop,
            lastScrollLeft,
            TEST_ROW_HEIGHT,
            fakeGridApi,
            fakeGroupingProvider,
            fakeGridApiWrapper,
        );

        it("should hide sticky column header", () => {
            expect(fakeGridApiWrapper.addPinnedTopRowCellClass).toHaveBeenCalledWith(
                fakeGridApi,
                "a_123",
                "gd-hidden-sticky-column",
            );
            expect(fakeGridApiWrapper.removePinnedTopRowCellClass).not.toHaveBeenCalled();
        });

        it("should not set pinned group header text", () => {
            expect(fakeGridApiWrapper.setPinnedTopRowCellText).not.toHaveBeenCalled();
        });

        it("should not temporarily show table cell behind", () => {
            expect(fakeGridApiWrapper.addCellClass).not.toHaveBeenCalled();
        });
    });

    describe("column with repetitions and grouping when the current cell IS the end of its group", () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: "123" } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(false, true);
        const currentScrollTop = 100;
        const lastScrollTop = 50;
        const currentScrollLeft = 0;
        const lastScrollLeft = 0;

        updateStickyHeaders(
            currentScrollTop,
            currentScrollLeft,
            lastScrollTop,
            lastScrollLeft,
            TEST_ROW_HEIGHT,
            fakeGridApi,
            fakeGroupingProvider,
            fakeGridApiWrapper,
        );

        it("should hide sticky column header", () => {
            expect(fakeGridApiWrapper.addPinnedTopRowCellClass).toHaveBeenCalledWith(
                fakeGridApi,
                "a_123",
                "gd-hidden-sticky-column",
            );
            expect(fakeGridApiWrapper.removePinnedTopRowCellClass).not.toHaveBeenCalled();
        });

        it("should temporarily show table cell behind", () => {
            expect(fakeGridApiWrapper.addCellClass).toHaveBeenCalledWith(
                fakeGridApi,
                "a_123",
                10,
                "gd-cell-show-hidden",
            );
        });

        it("should not set pinned group header text", () => {
            expect(fakeGridApiWrapper.setPinnedTopRowCellText).not.toHaveBeenCalled();
        });
    });

    describe("column with repetitions and grouping when the current cell IS NOT the end of its group", () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: "123" } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(true, true);
        const currentScrollTop = 100;
        const lastScrollTop = 50;
        const currentScrollLeft = 0;
        const lastScrollLeft = 0;

        updateStickyHeaders(
            currentScrollTop,
            currentScrollLeft,
            lastScrollTop,
            lastScrollLeft,
            TEST_ROW_HEIGHT,
            fakeGridApi,
            fakeGroupingProvider,
            fakeGridApiWrapper,
        );

        it("should show sticky column header", () => {
            expect(fakeGridApiWrapper.removePinnedTopRowCellClass).toHaveBeenCalledWith(
                fakeGridApi,
                "a_123",
                "gd-hidden-sticky-column",
            );
            expect(fakeGridApiWrapper.addPinnedTopRowCellClass).not.toHaveBeenCalled();
        });

        it("should set pinned group header text", () => {
            expect(fakeGridApiWrapper.setPinnedTopRowCellText).toHaveBeenCalledWith(
                fakeGridApi,
                "a_123",
                "123",
            );
        });

        it("should not temporarily show table cell behind", () => {
            expect(fakeGridApiWrapper.addCellClass).not.toHaveBeenCalled();
        });
    });

    describe("updateStickyHeadersPosition", () => {
        const api = getFakeGridApi();
        const apiWrapper = getFakeGridApiWrapper();

        updateStickyHeadersPosition(api, apiWrapper);

        it("should set top style", () => {
            expect(apiWrapper.setPinnedTopRowStyle).toHaveBeenNthCalledWith(1, api, "top", "0px");
        });
        it("should set padding-right style", () => {
            expect(apiWrapper.setPinnedTopRowStyle).toHaveBeenNthCalledWith(2, api, "padding-right", "0px");
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
