// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { createIntlMock } from "@gooddata/sdk-ui";
import noop = require("lodash/noop");

import {
    CorePivotTablePure,
    WATCHING_TABLE_RENDERED_INTERVAL,
    WATCHING_TABLE_RENDERED_MAX_TIME,
} from "../CorePivotTable";
import { getParsedFields } from "../impl/agGridUtils";
import * as stickyRowHandler from "../impl/stickyRowHandler";
import agGridApiWrapper from "../impl/agGridApiWrapper";
import { ColumnEventSourceType, ICorePivotTableProps } from "../types";
import { IPreparedExecution, prepareExecution } from "@gooddata/sdk-backend-spi";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings, ReferenceLdm } from "@gooddata/reference-workspace";
import { measureLocalId } from "@gooddata/sdk-model";

const intl = createIntlMock();

const waitForDataLoaded = (wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}>>) => () => {
    wrapper.update();
    const table = wrapper.find(CorePivotTablePure);
    return table.prop("currentResult") !== null;
};

export function waitFor(test: () => any, maxDelay = 1000, delayOffset = 0, increment = 100) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const intervalRef = setInterval(() => {
                const testResult = test();
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

describe("CorePivotTable", () => {
    const backend = recordedBackend(ReferenceRecordings.Recordings);
    const singleMeasureExec = prepareExecution(
        backend,
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes.execution.definition,
    );

    const columnOnlyExec = prepareExecution(
        backend,
        ReferenceRecordings.Scenarios.PivotTable.SingleColumn.execution.definition,
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

    // this describe block needs to be first, otherwise random tests fail
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

        it("should set timeout for watching", () => {
            const table = getTableInstance();
            table.onFirstDataRendered();
            expect(setTimeout).toHaveBeenCalledWith(
                table.stopWatchingTableRendered,
                WATCHING_TABLE_RENDERED_MAX_TIME,
            );
        });

        it("should stop watching with unmounted table", () => {
            const table = getTableInstance();
            table.containerRef = null;
            table.watchingIntervalId = 123;
            jest.spyOn(table, "stopWatchingTableRendered");

            table.startWatchingTableRendered();
            expect(table.stopWatchingTableRendered).toHaveBeenCalledTimes(1);
            expect(clearInterval).toHaveBeenCalledTimes(1);
        });

        it("should call afterRender after table rendered", () => {
            const afterRender = jest.fn();

            const table = getTableInstance({ afterRender });
            table.isTableHidden = jest.fn().mockReturnValueOnce(false);
            table.watchingIntervalId = 123;
            table.watchingTimeoutId = 456;
            jest.spyOn(table, "stopWatchingTableRendered");

            table.startWatchingTableRendered();

            expect(table.stopWatchingTableRendered).toHaveBeenCalledTimes(1);

            expect(clearInterval).toHaveBeenNthCalledWith(1, 123);
            expect(clearTimeout).toHaveBeenNthCalledWith(1, 456);

            expect(afterRender).toHaveBeenCalledTimes(1);
        });

        it("should call afterRender after timeout", () => {
            const afterRender = jest.fn();

            const table = getTableInstance({ afterRender });
            table.watchingIntervalId = 123;
            table.watchingTimeoutId = 456;

            table.stopWatchingTableRendered();

            expect(clearInterval).toHaveBeenNthCalledWith(1, 123);
            expect(clearTimeout).toHaveBeenNthCalledWith(1, 456);

            expect(table.watchingIntervalId).toBe(null);
            expect(table.watchingTimeoutId).toBe(null);

            expect(afterRender).toHaveBeenCalledTimes(1);
        });
    });
});

describe("getParsedFields", () => {
    it("should return last parsed field from colId", () => {
        expect(getParsedFields("a_2009")).toEqual([["a", "2009"]]);
        expect(getParsedFields("a_2009_4-a_2071_12")).toEqual([
            ["a", "2009", "4"],
            ["a", "2071", "12"],
        ]);
        expect(getParsedFields("a_2009_4-a_2071_12-m_3")).toEqual([
            ["a", "2009", "4"],
            ["a", "2071", "12"],
            ["m", "3"],
        ]);
    });
});
