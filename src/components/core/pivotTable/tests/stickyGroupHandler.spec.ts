// (C) 2007-2018 GoodData Corporation
import { updateStickyHeaders } from '../stickyGroupHandler';
import { IGroupingProvider } from '../GroupingProvider';
import { GridApi } from 'ag-grid';

describe('updateStickyHeaders', () => {
    function getFakeGridApi(
        fakeGetDisplayedRowAtIndex: any = jest.fn()
    ): GridApi {
        const setPinnedTopRowData: any = jest.fn();
        const fakeGridApi = {
            getDisplayedRowAtIndex: fakeGetDisplayedRowAtIndex,
            setPinnedTopRowData
        };
        return fakeGridApi as GridApi;
    }

    function getFakeGroupingProvider(
        isRepeatedValueResult: boolean = false,
        isColumnWithGroupingResult: boolean = false
    ): IGroupingProvider {
        const groupingProvider: any = {
            isRepeatedValue: jest.fn(() => isRepeatedValueResult),
            isColumnWithGrouping: jest.fn(() => isColumnWithGroupingResult)
        };
        return groupingProvider as IGroupingProvider;
    }

    function getFakeGridApiWrapper(): any {
        return {
            getHeaderHeight: jest.fn(),
            getCellElement: jest.fn(),
            addCellClass: jest.fn(),
            removeCellClass: jest.fn(),
            getPinnedTopRowElement: jest.fn(),
            addPinnedTopRowClass: jest.fn(),
            removePinnedTopRowClass: jest.fn(),
            setPinnedTopRowStyle: jest.fn(),
            getPinnedTopRowCellElement: jest.fn(),
            addPinnedTopRowCellClass: jest.fn(),
            removePinnedTopRowCellClass: jest.fn()
        };
    }

    function assertOnlyListedMethodsHaveBeenCalled(obj: any, exceptMethodNames: string[]) {
        Object.getOwnPropertyNames(obj).forEach((propName) => {
            if (typeof obj[propName] === 'function') {
                if (exceptMethodNames.indexOf(propName) >= 0) {
                    expect(obj[propName]).toHaveBeenCalled();
                } else {
                    expect(obj[propName]).not.toHaveBeenCalled();
                }
            }
        });
    }

    const TEST_ROW_HEIGHT = 10;

    it('should do nothing when scroll top has not changed from last time', () => {
        const fakeGridApi = getFakeGridApi();
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider();

        updateStickyHeaders(5, 5, TEST_ROW_HEIGHT, fakeGridApi, fakeGroupingProvider, fakeGridApiWrapper);

        assertOnlyListedMethodsHaveBeenCalled(fakeGridApiWrapper, []);
    });

    it('should do nothing when scroll change has not crossed row line', () => {
        const fakeGridApi = getFakeGridApi();
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider();

        updateStickyHeaders(6, 5, TEST_ROW_HEIGHT, fakeGridApi, fakeGroupingProvider, fakeGridApiWrapper);

        assertOnlyListedMethodsHaveBeenCalled(fakeGridApiWrapper, []);
    });

    it('should hide the sticky row when the row data are not available (still loading)', () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({});
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider();

        updateStickyHeaders(5000, 5500, TEST_ROW_HEIGHT, fakeGridApi, fakeGroupingProvider, fakeGridApiWrapper);

        expect(fakeGridApiWrapper.removePinnedTopRowClass).toHaveBeenCalledWith(fakeGridApi, 'gd-visible-sticky-row');
        assertOnlyListedMethodsHaveBeenCalled(fakeGridApiWrapper, ['removePinnedTopRowClass']);
    });

    describe('current scroll position belongs to different line than the last one', () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: '123' } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(false, false);

        updateStickyHeaders(100, 50, TEST_ROW_HEIGHT, fakeGridApi, fakeGroupingProvider, fakeGridApiWrapper);

        it('should show the sticky row', () => {
            expect(fakeGridApiWrapper.addPinnedTopRowClass)
                .toHaveBeenCalledWith(fakeGridApi, 'gd-visible-sticky-row');
        });

        it('should hide temporarily shown cell from previous scroll position', () => {
            expect(fakeGridApiWrapper.removeCellClass)
                .toHaveBeenCalledWith(fakeGridApi, 'a_123', 5, 'gd-cell-show-hidden');
        });
    });

    describe('column without repetitions i.e. without grouping', () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: '123' } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(false, false);

        updateStickyHeaders(50, 100, TEST_ROW_HEIGHT, fakeGridApi, fakeGroupingProvider, fakeGridApiWrapper);

        it('should hide sticky column header', () => {
            expect(fakeGridApiWrapper.addPinnedTopRowCellClass)
                .toHaveBeenCalledWith(fakeGridApi, 'a_123', 'gd-hidden-sticky-column');
            expect(fakeGridApiWrapper.removePinnedTopRowCellClass)
                .not.toHaveBeenCalled();
        });

        it('should not temporarily show table cell behind', () => {
            expect(fakeGridApiWrapper.addCellClass).not.toHaveBeenCalled();
        });
    });

    describe('column with repetitions and grouping when the current cell IS the end of its group', () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: '123' } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(false, true);

        updateStickyHeaders(100, 50, TEST_ROW_HEIGHT, fakeGridApi, fakeGroupingProvider, fakeGridApiWrapper);

        it('should hide sticky column header', () => {
            expect(fakeGridApiWrapper.addPinnedTopRowCellClass)
                .toHaveBeenCalledWith(fakeGridApi, 'a_123', 'gd-hidden-sticky-column');
            expect(fakeGridApiWrapper.removePinnedTopRowCellClass).not.toHaveBeenCalled();
        });

        it('should temporarily show table cell behind', () => {
            expect(fakeGridApiWrapper.addCellClass)
                .toHaveBeenCalledWith(fakeGridApi, 'a_123', 10, 'gd-cell-show-hidden');
        });
    });

    describe('column with repetitions and grouping when the current cell IS NOT the end of its group', () => {
        const fakeGetDisplayedRowAtIndex = (): any => ({ data: { a_123: '123' } });
        const fakeGridApi = getFakeGridApi(fakeGetDisplayedRowAtIndex);
        const fakeGridApiWrapper = getFakeGridApiWrapper();
        const fakeGroupingProvider = getFakeGroupingProvider(true, true);

        updateStickyHeaders(100, 50, TEST_ROW_HEIGHT, fakeGridApi, fakeGroupingProvider, fakeGridApiWrapper);

        it('should show sticky column header', () => {
            expect(fakeGridApiWrapper.removePinnedTopRowCellClass)
                .toHaveBeenCalledWith(fakeGridApi, 'a_123', 'gd-hidden-sticky-column');
            expect(fakeGridApiWrapper.addPinnedTopRowCellClass)
                .not.toHaveBeenCalled();
        });

        it('should set pinned group header text', () => {
            expect(fakeGridApi.setPinnedTopRowData).toHaveBeenCalledWith([{ a_123: '123' }]);
        });

        it('should not temporarily show table cell behind', () => {
            expect(fakeGridApiWrapper.addCellClass).not.toHaveBeenCalled();
        });
    });
});
