// (C) 2007-2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { createIntlMock } from "@gooddata/sdk-ui";

import { CorePivotTablePure, WATCHING_TABLE_RENDERED_INTERVAL } from "../CorePivotTable";
import * as stickyRowHandler from "../impl/stickyRowHandler";
import agGridApiWrapper from "../impl/base/agGridApiWrapper";
import { ICorePivotTableProps } from "../types";
import { IPreparedExecution, prepareExecution } from "@gooddata/sdk-backend-spi";
import { recordedBackend, DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import noop from "lodash/noop";
import { recordedDataFacade } from "../../__mocks__/recordings";

const intl = createIntlMock();

/*
const waitForDataLoaded = (wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}>>) => () => {
    wrapper.update();
    const table = wrapper.find(CorePivotTablePure);
    return table.prop("currentResult") !== null;
};

export function waitFor(testFn: () => any, maxDelay = 1000, delayOffset = 0, increment = 100): Promise<void> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const intervalRef = setInterval(() => {
                const testResult = testFn();
                if (testResult) {
                    clearInterval(intervalRef);
                    return resolve(testResult);
                }
                if (Date.now() - start >= maxDelay) {
                    clearInterval(intervalRef);
                    reject(testResult);
                }
            }, increment);
        }, delayOffset);
    });
}
*/

describe("CorePivotTable", () => {
    const backend = recordedBackend(ReferenceRecordings.Recordings);
    const singleMeasureExec = prepareExecution(
        backend,
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes.execution.definition,
    );

    function renderComponent(
        customProps: Partial<ICorePivotTableProps> = {},
        execution: IPreparedExecution = singleMeasureExec,
    ) {
        return mount(<CorePivotTablePure execution={execution} intl={intl} {...customProps} />);
    }

    function getTableInstance(customProps: Partial<ICorePivotTableProps> = {}) {
        const wrapper = renderComponent(customProps);
        const table = wrapper.find(CorePivotTablePure);
        return table.instance() as any;
    }

    function setMockDataForPivotTable(table: any) {
        table.visibleData = {
            rawData: jest.fn().mockReturnValueOnce({
                isEmpty: jest.fn().mockReturnValueOnce(true),
            }),
            meta: jest.fn().mockReturnValueOnce({
                hasNoHeadersInDim: jest.fn().mockReturnValueOnce(true),
            }),
        };
        table.gridApi = {
            getRenderedNodes: jest.fn().mockReturnValueOnce([{}]),
            getCacheBlockState: jest.fn().mockReturnValueOnce({ pageId: { pageStatus: "loaded" } }),
        };
    }
    // this describe block needs to be first, otherwise random tests fail
    /* update: random tests fail on CI despite this block being first :D
    const columnOnlyExec = prepareExecution(
        backend,
        ReferenceRecordings.Scenarios.PivotTable.SingleColumn.execution.definition,
    );

    function getTableInstanceFromWrapper(wrapper: ReactWrapper) {
        const table = wrapper.find(CorePivotTablePure);
        return table.instance() as any;
    }

    const columnWidths = [
        {
            measureColumnWidthItem: {
                width: 350,
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: measureLocalId(ReferenceLdm.Amount),
                        },
                    },
                ],
            },
        },
    ];

    describe("componentDidUpdate", () => {
        it("should grow to fit when this prop is set", async (done) => {
            expect.assertions(1);
            const wrapper = renderComponent();
            await waitFor(waitForDataLoaded(wrapper));

            const table = getTableInstanceFromWrapper(wrapper);
            const growToFit = jest.spyOn(table, "growToFit");
            try {
                growToFit.mockImplementation(() => {
                    expect(growToFit).toHaveBeenCalledTimes(1);
                    done();
                });
            } catch (e) {
                done.fail(e);
            }

            wrapper.setProps({
                config: {
                    columnSizing: {
                        growToFit: true,
                    },
                },
            });
            wrapper.update();
        });

        it("should grow to fit when columnWidths prop is set", async (done) => {
            expect.assertions(1);
            const wrapper = renderComponent({
                config: {
                    columnSizing: {
                        growToFit: true,
                    },
                },
            });
            await waitFor(waitForDataLoaded(wrapper));

            const table = getTableInstanceFromWrapper(wrapper);
            const growToFit = jest.spyOn(table, "growToFit");
            try {
                growToFit.mockImplementation(() => {
                    expect(growToFit).toHaveBeenCalledTimes(1);
                    done();
                });
            } catch (e) {
                done.fail(e);
            }

            wrapper.setProps({
                config: {
                    columnSizing: {
                        columnWidths,
                        growToFit: true,
                    },
                },
            });
            wrapper.update();
        });

        it("should set inner manuallyResizedColumns according columnWidths prop", async (done) => {
            expect.assertions(1);
            const wrapper = renderComponent();
            await waitFor(waitForDataLoaded(wrapper));

            const table = getTableInstanceFromWrapper(wrapper);
            // didUpdate is async in PivotTable so expect needs to be async too
            const resetColumnsWidthToDefault = jest.spyOn(table, "resetColumnsWidthToDefault");
            try {
                resetColumnsWidthToDefault.mockImplementation(() => {
                    expect(table.resizedColumnsStore.manuallyResizedColumns).toEqual({
                        m_0: {
                            width: 350,
                            source: ColumnEventSourceType.UI_DRAGGED,
                        },
                    });
                    done();
                });
            } catch (e) {
                done.fail(e);
            }

            wrapper.setProps({
                config: {
                    columnSizing: {
                        columnWidths,
                    },
                },
            });
            wrapper.update();
        });
    });

    describe("column sizing", () => {
        it("should auto-resize columns if executing and default width should fit the viewport", (done) => {
            expect.assertions(1);
            const wrapper = renderComponent({
                config: { columnSizing: { defaultWidth: "viewport" } },
            });
            const table = getTableInstanceFromWrapper(wrapper);
            const autoresizeVisibleColumns = jest.spyOn(table, "autoresizeVisibleColumns");
            try {
                autoresizeVisibleColumns.mockImplementation(() => {
                    expect(autoresizeVisibleColumns).toHaveBeenCalledTimes(1);
                    done();
                });
            } catch (e) {
                done.fail(e);
            }
            wrapper.update();
        });

        it("should not auto-resize columns it the column sizing is not configured", async () => {
            const wrapper = renderComponent({
                config: { columnSizing: undefined },
            });
            const table = getTableInstanceFromWrapper(wrapper);
            const autoresizeVisibleColumns = jest.spyOn(table, "autoresizeVisibleColumns");
            autoresizeVisibleColumns.mockImplementation(noop);

            await waitFor(waitForDataLoaded(wrapper));
            expect(autoresizeVisibleColumns).toHaveBeenCalledTimes(0);
        });

        it("should auto-resize columns for a table with no measures", (done) => {
            expect.assertions(1);
            const wrapper = renderComponent(
                {
                    config: { columnSizing: { defaultWidth: "viewport" } },
                },
                columnOnlyExec,
            );
            const table = getTableInstanceFromWrapper(wrapper);
            const autoresizeColumns = jest.spyOn(table, "autoresizeVisibleColumns");
            autoresizeColumns.mockImplementation(() => {
                expect(autoresizeColumns).toHaveBeenCalledTimes(1);
                done();
            });
            wrapper.update();
        });

        it("should grow to fit columns if executing and default width should fit the viewport", (done) => {
            expect.assertions(1);
            const wrapper = renderComponent({
                config: { columnSizing: { growToFit: true } },
            });
            const table = getTableInstanceFromWrapper(wrapper);
            const growToFit = jest.spyOn(table, "growToFit");
            try {
                growToFit.mockImplementation(() => {
                    expect(growToFit).toHaveBeenCalledTimes(1);
                    done();
                });
            } catch (e) {
                done.fail(e);
            }
            wrapper.update();
        });

        it("should not grow to fit columns if the growToFit is not configured", async () => {
            const wrapper = renderComponent({
                config: { columnSizing: { growToFit: false } },
            });
            const table = getTableInstanceFromWrapper(wrapper);
            const growToFit = jest.spyOn(table, "growToFit");
            growToFit.mockImplementation(noop);

            await waitFor(waitForDataLoaded(wrapper));
            expect(growToFit).toHaveBeenCalledTimes(0);
        });
    });
    */
    describe("onModelUpdated", () => {
        let updateStickyRowPosition: jest.SpyInstance;
        let getPinnedTopRowElement: jest.SpyInstance;

        beforeEach(() => {
            getPinnedTopRowElement = jest.spyOn(agGridApiWrapper, "getPinnedTopRowElement");
            updateStickyRowPosition = jest.spyOn(stickyRowHandler, "updateStickyRowPosition");
            updateStickyRowPosition.mockImplementation(noop);
        });

        afterEach(() => {
            updateStickyRowPosition.mockRestore();
            getPinnedTopRowElement.mockRestore();
        });

        it("should not update sticky row when sticky element does not exist", () => {
            const tableInstance = getTableInstance();
            jest.spyOn(tableInstance, "getGridApi").mockImplementation(() => ({}));
            const updateStickyRow = jest.spyOn(tableInstance, "updateStickyRowContent");
            getPinnedTopRowElement.mockImplementation(() => undefined);

            tableInstance.onModelUpdated();

            expect(updateStickyRow).toHaveBeenCalledTimes(0);
            expect(updateStickyRowPosition).toHaveBeenCalledTimes(0);
        });

        it("should update sticky row when sticky element exists", () => {
            const tableInstance = getTableInstance();

            jest.spyOn(tableInstance, "getGridApi").mockImplementation(() => ({}));
            const updateStickyRow = jest.spyOn(tableInstance, "updateStickyRowContent");
            updateStickyRow.mockImplementation(noop);
            getPinnedTopRowElement.mockImplementation(() => ({}));

            tableInstance.onModelUpdated();

            expect(updateStickyRow).toHaveBeenCalledTimes(1);
            expect(updateStickyRowPosition).toHaveBeenCalledTimes(1);
        });
    });

    describe("getAvailableDrillTargets", () => {
        it("should return attributes (row only) and measures for pivot table", () => {
            const table = getTableInstance();
            const fixture = recordedDataFacade(
                ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
                DataViewFirstPage,
            );
            const targets = table.getAvailableDrillTargets(fixture);
            expect(targets.measures.length).toEqual(1);
            expect(targets.attributes.length).toEqual(1);
        });
    });

    describe("onFirstDataRendered", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
        });

        it("should start watching table rendered", () => {
            const table = getTableInstance();
            table.onFirstDataRendered();
            expect(setInterval).toHaveBeenCalledWith(
                table.startWatchingTableRendered,
                WATCHING_TABLE_RENDERED_INTERVAL,
            );
        });

        it("should stop watching with unmounted table", () => {
            const table = getTableInstance();

            // mock data for isPivotTableReady
            setMockDataForPivotTable(table);

            table.containerRef = null;
            table.watchingIntervalId = 123;
            jest.spyOn(table, "stopWatchingTableRendered");

            table.startWatchingTableRendered();
            expect(table.stopWatchingTableRendered).toHaveBeenCalledTimes(1);
            expect(clearInterval).toHaveBeenCalledTimes(0);
        });

        it("should call afterRender after table rendered", () => {
            const afterRender = jest.fn();

            const table = getTableInstance({ afterRender });

            // mock data for isPivotTableReady
            setMockDataForPivotTable(table);

            table.watchingIntervalId = 123;
            jest.spyOn(table, "stopWatchingTableRendered");

            table.startWatchingTableRendered();
            expect(table.stopWatchingTableRendered).toHaveBeenCalledTimes(1);
            expect(clearInterval).toHaveBeenNthCalledWith(1, 123);

            expect(afterRender).toHaveBeenCalledTimes(1);
        });
    });
});
