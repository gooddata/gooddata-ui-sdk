// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { AFM } from "@gooddata/typings";
import { testUtils } from "@gooddata/js-utils";
import {
    dataSourceProvider,
    IDataSourceProviderProps,
    IDataSourceProviderInjectedProps,
} from "../DataSourceProvider";
import { Table } from "../../tests/mocks";
import { getNativeTotals } from "../../visualizations/table/totals/utils";

describe("DataSourceProvider", () => {
    const PROJECT_ID = "projid";
    const defaultProps = {
        afm: {},
        projectId: PROJECT_ID,
        resultSpec: {
            dimensions: [{ itemIdentifiers: ["a1"] }],
        },
    };
    const COMPONENT_NAME = "DummyNameInMocks";

    function generateDefaultDimensions(): AFM.IDimension[] {
        return [];
    }
    function createComponent(
        component: React.ComponentType<IDataSourceProviderInjectedProps>,
        props: IDataSourceProviderProps = defaultProps,
        exportTitle?: string,
    ): ReactWrapper {
        const WrappedComponent = dataSourceProvider(
            component,
            generateDefaultDimensions,
            COMPONENT_NAME,
            exportTitle,
        );

        return mount(<WrappedComponent {...props} />);
    }

    it("should prepare datasource", () => {
        const wrapper = createComponent(Table);

        return testUtils.delay().then(() => {
            wrapper.update();
            const table = wrapper.find(Table);
            expect(table.length).toEqual(1);

            const tableProps = table.props() as IDataSourceProviderInjectedProps;
            expect(tableProps.dataSource).toBeDefined();
        });
    });

    it("should pass exportTitle and projectId to InnerComponent", () => {
        const wrapper = createComponent(Table);

        return testUtils.delay().then(() => {
            wrapper.update();
            expect(wrapper.find(Table).length).toBe(1);
            const TableElement = wrapper.find(Table).get(0);
            expect(TableElement.props.exportTitle).toEqual(COMPONENT_NAME);
            expect(TableElement.props.projectId).toEqual(PROJECT_ID);
        });
    });

    it("should pass correct exportTitle to InnerComponent", async () => {
        const customTitle = "CustomTitle";
        const wrapper = createComponent(Table, undefined, customTitle);

        await testUtils.delay();
        wrapper.update();
        expect(wrapper.find(Table).length).toBe(1);
        const TableElement = wrapper.find(Table).get(0);
        expect(TableElement.props.exportTitle).toEqual(customTitle);
    });

    it("should recreate dataSource when projects differ", () => {
        const wrapper = createComponent(Table);
        const newProps: IDataSourceProviderProps = {
            afm: {},
            projectId: "projid2",
            resultSpec: {},
        };
        return testUtils.delay().then(() => {
            wrapper.update();
            const table = wrapper.find(Table);
            const tableProps: IDataSourceProviderInjectedProps = table.props();
            const oldDataSource = tableProps.dataSource;
            wrapper.setProps(newProps);
            return testUtils.delay().then(() => {
                wrapper.update();
                const table = wrapper.find(Table);
                const tableProps = table.props() as IDataSourceProviderInjectedProps;
                expect(table.length).toEqual(1);
                expect(tableProps.dataSource).not.toBe(oldDataSource);
            });
        });
    });

    it("should recreate datasource when afm changes", () => {
        const wrapper = createComponent(Table);

        const newProps: IDataSourceProviderProps = {
            afm: { measures: [], attributes: [] },
            projectId: "projid",
            resultSpec: {},
        };

        return testUtils.delay().then(() => {
            wrapper.update();
            const table = wrapper.find(Table);
            const tableProps: IDataSourceProviderInjectedProps = table.props();
            const oldDataSource = tableProps.dataSource;
            wrapper.setProps(newProps);
            return testUtils.delay().then(() => {
                wrapper.update();
                const table = wrapper.find(Table);
                const tableProps: IDataSourceProviderInjectedProps = table.props();
                expect(table.length).toEqual(1);
                expect(tableProps.dataSource).not.toBe(oldDataSource);
            });
        });
    });

    it("should NOT rerender its child with old datasource after afm change", () => {
        const renderCounter = jest.fn();
        class FakeTable extends React.Component<any, any> {
            public render() {
                renderCounter(this.props.dataSource);
                return <div />;
            }
        }
        const wrapper = createComponent(FakeTable);

        const newProps: IDataSourceProviderProps = {
            afm: { measures: [], attributes: [] },
            projectId: "projid",
            resultSpec: {},
        };

        return testUtils.delay().then(() => {
            wrapper.update();
            let table = wrapper.find(FakeTable);
            const tableProps: IDataSourceProviderInjectedProps = table.props();
            const oldDataSource = tableProps.dataSource;
            expect(renderCounter).toHaveBeenCalledWith(oldDataSource);
            renderCounter.mockClear();
            wrapper.setProps(newProps);
            wrapper.update();
            table = wrapper.find(FakeTable);
            expect(renderCounter).not.toHaveBeenCalledWith(oldDataSource);
        });
    });

    it("should recreate dataSource only once when all props change", () => {
        const wrapper = createComponent(Table);

        const newProps: IDataSourceProviderProps = {
            afm: {
                measures: [],
                attributes: [],
            },
            projectId: "projid2",
            resultSpec: {
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a1",
                            direction: "desc",
                        },
                    },
                ],
            },
        };

        return testUtils.delay().then(() => {
            wrapper.update();
            const instance: any = wrapper.instance();
            const prepareDataSourceSpy = jest.spyOn(instance, "prepareDataSource");
            wrapper.setProps(newProps);
            return testUtils.delay().then(() => {
                wrapper.update();
                expect(prepareDataSourceSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    const sumTotal: AFM.ITotalItem = {
        attributeIdentifier: "a1",
        measureIdentifier: "m1",
        type: "sum",
    };

    const nativeTotal: AFM.ITotalItem = {
        attributeIdentifier: "a1",
        measureIdentifier: "m1",
        type: "nat",
    };

    it("should recreate dataSource only when native totals are updated", () => {
        const wrapper = createComponent(Table);

        return testUtils.delay().then(() => {
            wrapper.update();
            const originalDataSource = wrapper.find(Table).props().dataSource;
            // Try updating with a new native total and sum total
            wrapper
                .find(Table)
                .props()
                .updateTotals([nativeTotal, sumTotal]);
            return testUtils.delay().then(() => {
                wrapper.update();
                // expected to update AFM
                expect(
                    wrapper
                        .find(Table)
                        .props()
                        .dataSource.getAfm(),
                ).toEqual({
                    nativeTotals: [
                        {
                            attributeIdentifiers: [],
                            measureIdentifier: "m1",
                        },
                    ],
                });
                const nextDataSource = wrapper.find(Table).props().dataSource;
                // expected to update dataSource
                expect(nextDataSource).not.toBe(originalDataSource);
            });
        });
    });

    it("should NOT recreate dataSource when updated with existing native totals", () => {
        const wrapper = createComponent(Table, {
            ...defaultProps,
            afm: {
                ...defaultProps.afm,
                nativeTotals: getNativeTotals([nativeTotal], defaultProps.resultSpec),
            },
            totals: [nativeTotal, sumTotal],
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            const originalDataSource = wrapper.find(Table).props().dataSource;
            // Try updateTotals with the same native total
            wrapper
                .find(Table)
                .props()
                .updateTotals([nativeTotal]);
            return testUtils.delay().then(() => {
                wrapper.update();
                const nextDataSource = wrapper.find(Table).props().dataSource;
                // expected NOT to update dataSource
                expect(nextDataSource).toBe(originalDataSource);
            });
        });
    });

    it("should NOT recreate dataSource when updated without native totals", () => {
        const wrapper = createComponent(Table);

        return testUtils.delay().then(() => {
            wrapper.update();
            const originalDataSource = wrapper.find(Table).props().dataSource;

            // Try updateTotals without native total
            wrapper
                .find(Table)
                .props()
                .updateTotals([sumTotal]);
            return testUtils.delay().then(() => {
                wrapper.update();
                const nextDataSource = wrapper.find(Table).props().dataSource;
                // expected NOT to update dataSource
                expect(nextDataSource).toBe(originalDataSource);
            });
        });
    });

    it("should not render component if dataSource is missing", () => {
        const wrapper = createComponent(Table);

        return testUtils.delay().then(() => {
            wrapper.update();
            wrapper.setState({ dataSource: null });
            return testUtils.delay().then(() => {
                wrapper.update();
                expect(wrapper.find(Table).length).toEqual(0);
            });
        });
    });

    it("should provide modified resultSpec to InnerComponent", () => {
        const defaultDimension = () => [{ itemIdentifiers: ["a1"] }];
        const WrappedTable = dataSourceProvider(Table, defaultDimension, COMPONENT_NAME);
        const wrapper = mount(<WrappedTable {...defaultProps} />);

        return testUtils.delay().then(() => {
            wrapper.update();
            expect(wrapper.find(Table).props().resultSpec.dimensions).toEqual(defaultDimension());
        });
    });

    it("should use componentName in telemetry", () => {
        const sdk: any = {
            clone: jest.fn(() => sdk),
            config: {
                setJsPackage: jest.fn(),
                setRequestHeader: jest.fn(),
            },
            execution: {
                getPartialExecutionResult: jest.fn(),
            },
        };
        const defaultProps = {
            afm: {},
            projectId: "projid",
            resultSpec: {},
            sdk,
        };
        const defaultDimension = () => [{ itemIdentifiers: ["x"] }];
        const WrappedTable = dataSourceProvider(Table, defaultDimension, COMPONENT_NAME);
        mount(<WrappedTable {...defaultProps} />);

        expect(sdk.clone).toHaveBeenCalledTimes(2);
        expect(sdk.config.setJsPackage.mock.calls[0][0]).toEqual("@gooddata/react-components");
        expect(sdk.config.setJsPackage.mock.calls[1][0]).toEqual("@gooddata/data-layer");
        expect(sdk.config.setRequestHeader.mock.calls[0]).toEqual(["X-GDC-JS-SDK-COMP", COMPONENT_NAME]);
        expect(sdk.config.setRequestHeader.mock.calls[1]).toEqual([
            "X-GDC-JS-SDK-COMP-PROPS",
            "afm,projectId,resultSpec,sdk",
        ]);
    });
});
