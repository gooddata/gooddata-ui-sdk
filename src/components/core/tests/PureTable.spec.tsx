// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { AFM } from "@gooddata/typings";
import {
    TableTransformation,
    ResponsiveTable,
    oneMeasureDataSource,
    executionObjectWithTotalsDataSource,
    IndigoTable,
} from "../../tests/mocks";

// Replace this with optional prop
jest.mock("../../visualizations/table/TableTransformation", () => ({
    TableTransformation,
}));

jest.mock("../../visualizations/table/Table", () => ({
    Table: IndigoTable,
}));

jest.mock("../../visualizations/table/ResponsiveTable", () => ({
    ResponsiveTable,
}));

import { PureTable, ITableProps, ITableState } from "../PureTable";
import { executionObjectWithTotals } from "../../../execution/fixtures/ExecuteAfm.fixtures";
import { IDataSourceProviderInjectedProps } from "../../afm/DataSourceProvider";
import { RuntimeError } from "../../../errors/RuntimeError";
import { ErrorStates } from "../../../constants/errorStates";

function getFakeSortItem(): AFM.SortItem {
    return {
        measureSortItem: {
            direction: "asc",
            locators: [
                {
                    measureLocatorItem: {
                        measureIdentifier: "id",
                    },
                },
            ],
        },
    };
}

describe("PureTable", () => {
    const createComponent = (props: ITableProps & IDataSourceProviderInjectedProps) => {
        return mount<ITableProps, ITableState & IDataSourceProviderInjectedProps>(<PureTable {...props} />);
    };

    const createProps = (customProps = {}): ITableProps & IDataSourceProviderInjectedProps => {
        return {
            dataSource: oneMeasureDataSource,
            resultSpec: {},
            locale: "en-US",
            drillableItems: [],
            afterRender: jest.fn(),
            pushData: jest.fn(),
            height: 200,
            maxHeight: 400,
            environment: "none",
            stickyHeaderOffset: 20,
            totals: [],
            totalsEditAllowed: true,
            onTotalsEdit: jest.fn(),
            onFiredDrillEvent: jest.fn(),
            ...customProps,
        };
    };

    it("should render TableTransformation and pass down given props and props from execution", () => {
        const props = createProps({
            environment: "dashboards",
        });
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderedTableTransformation = wrapper.find(TableTransformation);
            expect(renderedTableTransformation.props()).toMatchObject({
                executionRequest: {
                    execution: {
                        afm: props.dataSource.getAfm(),
                        resultSpec: props.resultSpec,
                    },
                },
                executionResponse: expect.any(Object),
                executionResult: expect.any(Object),
                afterRender: props.afterRender,
                drillableItems: props.drillableItems,
                config: { stickyHeaderOffset: props.stickyHeaderOffset },
                height: props.height,
                maxHeight: props.maxHeight,
                onFiredDrillEvent: props.onFiredDrillEvent,
                totals: props.totals,
                totalsEditAllowed: props.totalsEditAllowed,
                lastAddedTotalType: null,
            });
        });
    });

    it('should render TableTransformation with renderer ResponsiveTable for environment "dashboards"', () => {
        const props = createProps({
            environment: "dashboards",
        });
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderedTableTransformation = wrapper.find(TableTransformation);
            expect(renderedTableTransformation.length).toBe(1);
            expect(renderedTableTransformation.props().tableRenderer({}).type).toBe(ResponsiveTable);
            const tableRendererProps = renderedTableTransformation.props().tableRenderer({}).props;
            expect(tableRendererProps).toMatchObject({
                page: 1,
                rowsPerPage: 9,
            });
        });
    });

    it("should render TableTransformation with renderer Table for default environment", () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderedTableTransformation = wrapper.find(TableTransformation);
            expect(renderedTableTransformation.length).toBe(1);
            expect(renderedTableTransformation.props().tableRenderer({}).type).toBe(IndigoTable);
            const tableRendererProps = renderedTableTransformation.props().tableRenderer({}).props;
            expect(tableRendererProps).toMatchObject({
                containerMaxHeight: wrapper.props().maxHeight,
            });
        });
    });

    it("should call on error when TableTransformation fired onDataTooLarge", () => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            environment: "dashboards",
        });

        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderedTableTransformation = wrapper.find(TableTransformation);
            onError.mockReset();

            renderedTableTransformation.props().onDataTooLarge();

            expect(onError).toHaveBeenCalledWith(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY));
        });
    });

    it("should call pushData when ResponsiveTable renderer fired onSortChange", () => {
        const pushDataSpy = jest.fn();
        const props = createProps({
            environment: "dashboards",
            pushData: pushDataSpy,
        });
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderedTableTransformation = wrapper.find(TableTransformation);
            pushDataSpy.mockReset();

            const fakeSortItem: AFM.SortItem = getFakeSortItem();
            renderedTableTransformation
                .props()
                .tableRenderer({})
                .props.onSortChange(fakeSortItem);

            expect(pushDataSpy).toHaveBeenCalledWith({
                properties: {
                    sortItems: [fakeSortItem],
                },
            });
            expect(pushDataSpy.mock.calls.length).toBe(1);
        });
    });

    it("should call pushData when Indigo Table renderer fired onSortChange", () => {
        const pushDataSpy = jest.fn();
        const props = createProps({
            pushData: pushDataSpy,
        });
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderedTableTransformation = wrapper.find(TableTransformation);
            pushDataSpy.mockReset();

            const fakeSortItem: AFM.SortItem = getFakeSortItem();
            renderedTableTransformation
                .props()
                .tableRenderer({})
                .props.onSortChange(fakeSortItem);

            expect(pushDataSpy).toHaveBeenCalledWith({
                properties: {
                    sortItems: [fakeSortItem],
                },
            });
            expect(pushDataSpy.mock.calls.length).toBe(1);
        });
    });

    it("should call pushData with converted totals when TableTransformation fired onTotalsEdit", () => {
        const pushDataSpy = jest.fn();
        const props = createProps({
            pushData: pushDataSpy,
            dataSource: executionObjectWithTotalsDataSource,
        });
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderedTableTransformation = wrapper.find(TableTransformation);
            pushDataSpy.mockReset();

            renderedTableTransformation.props().onTotalsEdit([
                {
                    alias: "aaa",
                    type: "sum",
                    outputMeasureIndexes: [0],
                },
            ]);

            expect(pushDataSpy).toHaveBeenCalledWith({
                properties: {
                    totals: [
                        {
                            alias: "aaa",
                            attributeIdentifier: "a1",
                            measureIdentifier: "m1",
                            type: "sum",
                        },
                    ],
                },
            });
            expect(pushDataSpy.mock.calls.length).toBe(1);
        });
    });

    it("should rerender ResponsiveTable with new page and pageOffset when onMore was fired", () => {
        const props = createProps({ environment: "dashboards" });
        const wrapper = createComponent(props);
        const page = 12;
        const pageOffset = 3;

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderer = wrapper
                .find(TableTransformation)
                .props()
                .tableRenderer({});
            renderer.props.onMore({
                page,
                pageOffset,
            });

            return testUtils.delay().then(() => {
                wrapper.update();
                const renderer = wrapper
                    .find(TableTransformation)
                    .props()
                    .tableRenderer({});
                expect(renderer.props.page).toBe(page);
                expect(renderer.props.pageOffset).toBe(pageOffset);
            });
        });
    });

    it("should rerender ResponsiveTable with new page value when ResponsiveTable renderer fired onLess", () => {
        const props = createProps({ environment: "dashboards" });
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const renderer = wrapper
                .find(TableTransformation)
                .props()
                .tableRenderer({});
            renderer.props.onMore({ page: 12 });

            return testUtils.delay().then(() => {
                wrapper.update();
                const newRenderer = wrapper
                    .find(TableTransformation)
                    .props()
                    .tableRenderer({});
                expect(newRenderer.props.page).toBe(12);

                renderer.props.onLess();
                return testUtils.delay().then(() => {
                    wrapper.update();
                    const newestRenderer = wrapper
                        .find(TableTransformation)
                        .props()
                        .tableRenderer({});
                    expect(newestRenderer.props.page).toBe(1);
                });
            });
        });
    });

    it("should provide converted totals based on resultSpec to the TableTransformation", () => {
        const props = createProps({
            dataSource: executionObjectWithTotalsDataSource,
            resultSpec: executionObjectWithTotals.execution.resultSpec,
        });
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const totals = wrapper.find(TableTransformation).props().totals;
            expect(totals).toEqual([
                {
                    outputMeasureIndexes: [0, 1],
                    type: "sum",
                },
                {
                    outputMeasureIndexes: [0],
                    type: "avg",
                },
            ]);
        });
    });

    describe("lastAddedTotalType", () => {
        const defaultProps = createProps({
            totals: [
                {
                    type: "sum",
                    measureIdentifier: "",
                    attributeIdentifier: "",
                },
                {
                    type: "avg",
                    measureIdentifier: "",
                    attributeIdentifier: "",
                },
            ],
        });

        it('should set correct "lastAddedTotalType" when component receives new props', () => {
            const wrapper = createComponent(defaultProps);

            return testUtils.delay().then(() => {
                wrapper.update();
                wrapper.setProps({
                    totals: [
                        {
                            type: "nat",
                            measureIdentifier: "",
                            attributeIdentifier: "",
                        },
                    ],
                });

                return testUtils.delay().then(() => {
                    wrapper.update();
                    const renderedTableTransformation = wrapper.find(TableTransformation);
                    expect(renderedTableTransformation.props().lastAddedTotalType).toEqual("nat");
                });
            });
        });

        it('should set "lastAddedTotalType" as empty when "onLastAddedTotalRowHighlightPeriodEnd" is called', () => {
            const wrapper = createComponent(defaultProps);

            return testUtils.delay().then(() => {
                wrapper.setProps({
                    totals: [
                        {
                            type: "nat",
                            measureIdentifier: "",
                            attributeIdentifier: "",
                        },
                    ],
                });

                return testUtils.delay().then(() => {
                    const renderedTableTransformation = wrapper.find(TableTransformation);
                    expect(renderedTableTransformation.props().lastAddedTotalType).toEqual("nat");

                    renderedTableTransformation.props().onLastAddedTotalRowHighlightPeriodEnd();
                    return testUtils.delay().then(() => {
                        wrapper.update();
                        const renderedTableTransformation = wrapper.find(TableTransformation);
                        expect(renderedTableTransformation.props().lastAddedTotalType).toEqual(null);
                    });
                });
            });
        });
    });
});
