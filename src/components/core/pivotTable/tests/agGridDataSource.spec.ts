// (C) 2019 GoodData Corporation
import * as fixtures from "../../../../../stories/test_data/fixtures";
import { createAgGridDataSource, executionToAGGridAdapter } from "../agGridDataSource";
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

    it("should call getPage only once when requesting the same page", async () => {
        const { getPage, successCallback, gridDataSource, onSuccess } = createMockedDataSource();

        await gridDataSource.getRows({ startRow: 0, endRow: 0, successCallback, sortModel: [] } as any);
        await gridDataSource.getRows({ startRow: 0, endRow: 0, successCallback, sortModel: [] } as any);
        expect(getPage).toHaveBeenCalledTimes(1);
        expect(successCallback).toHaveBeenCalledTimes(2);
        expect(onSuccess).toHaveBeenCalledTimes(2);
    });

    it("should call getPage only for unique request but not for the same page", async () => {
        const { getPage, successCallback, gridDataSource, onSuccess } = createMockedDataSource();

        await gridDataSource.getRows({ startRow: 0, endRow: 0, successCallback, sortModel: [] } as any);
        await gridDataSource.getRows({ startRow: 0, endRow: 0, successCallback, sortModel: [] } as any);
        expect(getPage).toHaveBeenCalledTimes(1);
        expect(successCallback).toHaveBeenCalledTimes(2);
        expect(onSuccess).toHaveBeenCalledTimes(2);

        await gridDataSource.getRows({ startRow: 0, endRow: 2, successCallback, sortModel: [] } as any);
        expect(getPage).toHaveBeenCalledTimes(2);
        expect(successCallback).toHaveBeenCalledTimes(3);
        expect(onSuccess).toHaveBeenCalledTimes(3);
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
