// (C) 2019 GoodData Corporation
import { getAGGridDataSource } from "../agGridDataSource";
import { pivotTableWithColumnAndRowAttributes } from "../../../../../stories/test_data/fixtures";
import { GroupingProviderFactory } from "../GroupingProvider";
import { createIntlMock } from "../../../visualizations/utils/intlUtils";

const intl = createIntlMock();

describe("getGridDataSource", () => {
    // tslint:disable-next-line:max-line-length
    it("should return AGGrid dataSource that calls getPage, successCallback, onSuccess, then cancelPagePromises on destroy", async () => {
        const resultSpec = pivotTableWithColumnAndRowAttributes.executionRequest.resultSpec;
        const getPage = jest.fn().mockReturnValue(Promise.resolve(pivotTableWithColumnAndRowAttributes));
        const startRow = 0;
        const endRow = 0;
        const successCallback = jest.fn();
        const cancelPagePromises = jest.fn();
        const onSuccess = jest.fn();
        const getGridApi = () => ({
            setPinnedBottomRowData: jest.fn(),
            getPinnedBottomRowCount: jest.fn(),
        });
        const sortModel: any[] = [];
        const getExecution = () => pivotTableWithColumnAndRowAttributes;
        const groupingProvider = GroupingProviderFactory.createProvider(true);

        const gridDataSource = getAGGridDataSource(
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
        await gridDataSource.getRows({ startRow, endRow, successCallback, sortModel } as any);
        expect(getPage).toHaveBeenCalledWith(resultSpec, [0, undefined], [0, undefined]);
        expect(successCallback.mock.calls[0]).toMatchSnapshot();
        expect(onSuccess.mock.calls[0]).toMatchSnapshot();

        gridDataSource.destroy();
        expect(cancelPagePromises).toHaveBeenCalledTimes(1);
    });
});
