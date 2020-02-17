// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
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
import { ICorePivotTableProps } from "../types";
import { IPreparedExecution, prepareExecution } from "@gooddata/sdk-backend-spi";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

const intl = createIntlMock();

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
