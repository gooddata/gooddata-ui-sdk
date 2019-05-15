// (C) 2019 GoodData Corporation
import * as fixtures from "../../../../../stories/test_data/fixtures";
import { IGridTotalsRow } from "../agGridTypes";
import { areTotalsChanged, createAgGridDataSource, executionToAGGridAdapter } from "../agGridDataSource";
import { GroupingProviderFactory } from "../GroupingProvider";
import { createIntlMock } from "../../../visualizations/utils/intlUtils";

const pivotTableWithColumnAndRowAttributes = fixtures.pivotTableWithColumnAndRowAttributes;
const intl = createIntlMock();

describe("getGridDataSource", () => {
    function createMockedDataSource(customGridApiProps?: any) {
        const resultSpec = pivotTableWithColumnAndRowAttributes.executionRequest.resultSpec;
        const getPage = jest.fn().mockReturnValue(Promise.resolve(pivotTableWithColumnAndRowAttributes));
        const successCallback = jest.fn();
        const failCallback = jest.fn();
        const cancelPagePromises = jest.fn();
        const onSuccess = jest.fn();
        const getGridApi = () => ({
            setPinnedBottomRowData: jest.fn(),
            getPinnedBottomRowCount: jest.fn(),
            paginationProxy: {
                bottomRowIndex: 32,
            },
            ...customGridApiProps,
        });
        const getExecution = () => pivotTableWithColumnAndRowAttributes;
        const groupingProvider = GroupingProviderFactory.createProvider(true);

        const gridDataSource = createAgGridDataSource(
            resultSpec,
            getPage,
            getExecution,
            onSuccess,
            getGridApi,
            intl,
            [],
            () => groupingProvider,
            cancelPagePromises,
        );

        return {
            gridDataSource,
            getPage,
            failCallback,
            successCallback,
            onSuccess,
            cancelPagePromises,
        };
    }

    // tslint:disable-next-line:max-line-length
    it("should return AGGrid dataSource that calls getPage, successCallback, onSuccess, then cancelPagePromises on destroy", async () => {
        const resultSpec = pivotTableWithColumnAndRowAttributes.executionRequest.resultSpec;
        const {
            getPage,
            successCallback,
            gridDataSource,
            onSuccess,
            cancelPagePromises,
        } = createMockedDataSource();

        await gridDataSource.getRows({ startRow: 0, endRow: 0, successCallback, sortModel: [] } as any);
        expect(getPage).toHaveBeenCalledWith(resultSpec, [0, undefined], [0, undefined]);
        expect(successCallback.mock.calls[0]).toMatchSnapshot();
        expect(onSuccess.mock.calls[0]).toMatchSnapshot();

        gridDataSource.destroy();
        expect(cancelPagePromises).toHaveBeenCalledTimes(1);
    });

    it("should return null from getRows promise result when startRow is out of total rows boundary", async () => {
        const {
            getPage,
            successCallback,
            gridDataSource,
            failCallback,
            onSuccess,
            cancelPagePromises,
        } = createMockedDataSource();
        const getRowsResult = await gridDataSource.getRows({
            startRow: 100,
            endRow: 200,
            successCallback,
            failCallback,
            sortModel: [],
        } as any);
        expect(getRowsResult).toEqual(null);
        expect(getPage).not.toHaveBeenCalled();
        expect(successCallback).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(failCallback).toHaveBeenCalled();

        gridDataSource.destroy();
        expect(cancelPagePromises).toHaveBeenCalledTimes(1);
    });

    it("should ignore getRowsRequest validation when gridApi is not providing expected data", async () => {
        const resultSpec = pivotTableWithColumnAndRowAttributes.executionRequest.resultSpec;
        const {
            getPage,
            successCallback,
            gridDataSource,
            onSuccess,
            cancelPagePromises,
        } = createMockedDataSource({
            paginationProxy: {},
        });

        await gridDataSource.getRows({ startRow: 0, endRow: 0, successCallback, sortModel: [] } as any);
        expect(getPage).toHaveBeenCalledWith(resultSpec, [0, undefined], [0, undefined]);
        expect(successCallback).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();

        gridDataSource.destroy();
        expect(cancelPagePromises).toHaveBeenCalledTimes(1);
    });

    it("should ignore getRowsRequest when called on destroyed data source", async () => {
        const {
            getPage,
            successCallback,
            gridDataSource,
            onSuccess,
            cancelPagePromises,
        } = createMockedDataSource({
            paginationProxy: {},
        });

        gridDataSource.destroy();
        expect(cancelPagePromises).toHaveBeenCalledTimes(1);

        await gridDataSource.getRows({ startRow: 0, endRow: 0, successCallback, sortModel: [] } as any);
        expect(getPage).not.toHaveBeenCalled();
        expect(successCallback).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    describe("areTotalsChanged", () => {
        function mockGridApi(totals: any[] = []): any {
            return {
                getPinnedBottomRowCount: () => totals.length,
                getPinnedBottomRow: (i: number) => ({ data: totals[i] }),
            };
        }
        const totalSum = {
            type: {
                sum: true,
            },
            colSpan: {
                count: 1,
                headerKey: "foo",
            },
        };
        const emptyTotalRows: IGridTotalsRow[] = [];
        const noTotalRows: IGridTotalsRow[] = null;
        const oneTotalRows: IGridTotalsRow[] = [totalSum];

        it.each([
            [true, "no", "one", noTotalRows, [totalSum]],
            [false, "no", "no", noTotalRows, []],
            [true, "empty", "one", emptyTotalRows, [totalSum]],
            [false, "empty", "no", emptyTotalRows, []],
            [true, "one", "no", oneTotalRows, []],
            [false, "one", "one", oneTotalRows, [totalSum]],
        ])(
            "should return %s when %s total passed and %s total present in bottom pinned row",
            (
                expectedValue: boolean,
                _passed: string,
                _table: string,
                passedTotals: any[],
                tableTotals: any[],
            ) => {
                const gridApi = mockGridApi(tableTotals);

                expect(areTotalsChanged(gridApi, passedTotals)).toBe(expectedValue);
            },
        );
    });
});

describe("executionToAGGridAdapter", () => {
    it("should return grid data for executionResult", () => {
        expect(
            executionToAGGridAdapter(
                {
                    executionResponse: fixtures.pivotTableWithColumnAndRowAttributes.executionResponse,
                    executionResult: fixtures.pivotTableWithColumnAndRowAttributes.executionResult,
                },
                {},
                intl,
            ),
        ).toMatchSnapshot();
    });
    it("should return grid data for executionResult with rowGroups and loadingRenderer", () => {
        expect(
            executionToAGGridAdapter(
                {
                    executionResponse: fixtures.barChartWithStackByAndOnlyOneStack.executionResponse,
                    executionResult: fixtures.barChartWithStackByAndOnlyOneStack.executionResult,
                },
                {},
                intl,
            ),
        ).toMatchSnapshot();
    });
});
