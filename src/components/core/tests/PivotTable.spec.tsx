// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { oneAttributeOneMeasureSortByMeasureExecutionObject } from "../../../execution/fixtures/ExecuteAfm.fixtures";
import { createIntlMock } from "../../visualizations/utils/intlUtils";
import noop = require("lodash/noop");

import { PivotTable, PivotTableInner, IPivotTableInnerProps } from "../PivotTable";
import { oneMeasureDataSource, oneAttributeOneMeasureDataSource } from "../../tests/mocks";
import { getParsedFields } from "../pivotTable/agGridUtils";
import { GroupingProviderFactory } from "../pivotTable/GroupingProvider";
import * as stickyGroupHandler from "../pivotTable/stickyGroupHandler";
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

    function getTableInstance() {
        const wrapper = renderComponent();
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
        let updateStickyHeadersPosition: jest.SpyInstance;
        let getPinnedTopRowElement: jest.SpyInstance;

        beforeEach(() => {
            getPinnedTopRowElement = jest.spyOn(agGridApiWrapper, "getPinnedTopRowElement");
            updateStickyHeadersPosition = jest.spyOn(stickyGroupHandler, "updateStickyHeadersPosition");
            updateStickyHeadersPosition.mockImplementation(noop);
        });

        afterEach(() => {
            updateStickyHeadersPosition.mockRestore();
            getPinnedTopRowElement.mockRestore();
        });

        it("should not update sticky row when sticky element does not exist", () => {
            const tableInstance = getTableInstance();
            const updateStickyRow = jest.spyOn(tableInstance, "updateStickyRow");
            getPinnedTopRowElement.mockImplementation(() => undefined);

            tableInstance.onModelUpdated();
            expect(updateStickyRow).toHaveBeenCalledTimes(0);
            expect(updateStickyHeadersPosition).toHaveBeenCalledTimes(0);
        });

        it("should update sticky row when sticky element exists", () => {
            const tableInstance = getTableInstance();
            const updateStickyRow = jest.spyOn(tableInstance, "updateStickyRow");
            getPinnedTopRowElement.mockImplementation(() => ({}));

            tableInstance.onModelUpdated();
            expect(updateStickyRow).toHaveBeenCalledTimes(1);
            expect(updateStickyHeadersPosition).toHaveBeenCalledTimes(1);
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
