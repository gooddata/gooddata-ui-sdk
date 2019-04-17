// (C) 2019 GoodData Corporation
import { IGridTotalsRow } from "../../../../interfaces/AGGrid";
import { areTotalsChanged, getAGGridDataSource } from "../agGridDataSource";
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
