// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { oneAttributeOneMeasureSortByMeasureExecutionObject } from "../../../execution/fixtures/ExecuteAfm.fixtures";
import { createIntlMock } from "../../visualizations/utils/intlUtils";
import noop = require("lodash/noop");

import {
    PivotTable,
    PivotTableInner,
    IPivotTableInnerProps,
    WATCHING_TABLE_RENDERED_INTERVAL,
    WATCHING_TABLE_RENDERED_MAX_TIME,
} from "../PivotTable";
import { oneMeasureDataSource, oneAttributeOneMeasureDataSource } from "../../tests/mocks";
import { getParsedFields } from "../pivotTable/agGridUtils";
import { GroupingProviderFactory } from "../pivotTable/GroupingProvider";
import * as stickyRowHandler from "../pivotTable/stickyRowHandler";
import agGridApiWrapper from "../pivotTable/agGridApiWrapper";

const intl = createIntlMock();

describe("PivotTable", () => {
    function renderComponent(
        customProps: Partial<IPivotTableInnerProps> = {},
        dataSource = oneMeasureDataSource,
    ) {
        return mount(
            <PivotTable
                dataSource={dataSource}
                updateTotals={noop as any}
                getPage={noop as any}
                intl={intl}
                {...customProps}
            />,
        );
    }

    function getTableInstance(customProps: Partial<IPivotTableInnerProps> = {}) {
        const wrapper = renderComponent(customProps);
        const table = wrapper.find(PivotTableInner);
        return table.instance() as any;
    }

    it("should render PivotTableInner", () => {
        const wrapper = renderComponent();
        expect(wrapper.find(PivotTableInner)).toHaveLength(1);
    });

    describe("groupRows for attribute columns", () => {
        let createProvider: jest.SpyInstance;

        function renderComponentForGrouping(customProps: Partial<IPivotTableInnerProps> = {}) {
            return renderComponent(customProps, oneAttributeOneMeasureDataSource);
        }

        beforeEach(() => {
            createProvider = jest.spyOn(GroupingProviderFactory, "createProvider");
        });

        afterEach(() => {
            createProvider.mockRestore();
        });

        // tslint:disable-next-line:max-line-length
        it("should group rows when sorted by first attribute (default sort)", () => {
            renderComponentForGrouping();

            expect(createProvider).toHaveBeenCalledTimes(1);
            expect(createProvider).toHaveBeenCalledWith(true);
        });

        it("should NOT group rows when not sorted by first attribute", done => {
            // check second async invocation since we are waiting for datasource to be updated with specified resultSpec
            const onDataSourceUpdateSuccess = () => {
                expect(createProvider).toHaveBeenCalledTimes(2);
                expect(createProvider).toHaveBeenNthCalledWith(2, false);
                done();
            };

            renderComponentForGrouping({
                resultSpec: oneAttributeOneMeasureSortByMeasureExecutionObject.execution.resultSpec,
                onDataSourceUpdateSuccess,
            });
        });

        it("should NOT group rows when grouping switched by property after render", () => {
            const wrapper = renderComponentForGrouping();

            wrapper.setProps({
                groupRows: false,
            });

            expect(createProvider).toHaveBeenCalledTimes(2);
            expect(createProvider).toHaveBeenNthCalledWith(2, false);
        });
    });

    describe("isTableHidden", () => {
        it("should return true if columnDefs are empty", () => {
            const table = getTableInstance();
            expect(table.isTableHidden()).toEqual(true);
        });

        it("should return false if columnDefs are not empty", () => {
            const table = getTableInstance();
            table.setState({ columnDefs: [{ field: "field_id" }] });
            expect(table.isTableHidden()).toEqual(false);
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
        expect(getParsedFields("a_2009_4-a_2071_12")).toEqual([["a", "2009", "4"], ["a", "2071", "12"]]);
        expect(getParsedFields("a_2009_4-a_2071_12-m_3")).toEqual([
            ["a", "2009", "4"],
            ["a", "2071", "12"],
            ["m", "3"],
        ]);
    });
});
