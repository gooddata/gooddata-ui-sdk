// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as PropTypes from "prop-types";
import { mount } from "enzyme";
import noop = require("lodash/noop");
import { testUtils } from "@gooddata/js-utils";
import sdk, { IExportConfig } from "@gooddata/gooddata-js";
import {
    emptyDataSource,
    oneMeasureDataSource,
    oneMeasurePagableOnlyDataSource,
    oneMeasureOneDimensionDataSource,
    oneAttributeOneMeasureOneFilterDataSource,
    tooLargeDataSource,
    executionObjectWithTotalsDataSource,
    LoadingComponent,
    ErrorComponent,
} from "../../../tests/mocks";

import "jest";

import {
    ICommonVisualizationProps,
    ILoadingInjectedProps,
    visualizationLoadingHOC,
    commonDefaultProps,
} from "../VisualizationLoadingHOC";
import { oneMeasureResponse } from "../../../../execution/fixtures/ExecuteAfm.fixtures";
import { IDrillableItem } from "../../../../interfaces/DrillEvents";
import { IExportFunction, IExtendedExportConfig } from "../../../../interfaces/Events";
import { IDataSourceProviderInjectedProps } from "../../../afm/DataSourceProvider";
import { RuntimeError } from "../../../../errors/RuntimeError";
import { ErrorStates } from "../../../../constants/errorStates";

const CSV = "csv";
const XLSX = "xlsx";

export interface ITestInnerComponentProps extends ICommonVisualizationProps {
    customPropFooBar?: number;
}

class TestInnerComponent extends React.Component<
    ITestInnerComponentProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps
> {
    public static defaultProps: Partial<
        ITestInnerComponentProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps
    > = {
        ...commonDefaultProps,
        customPropFooBar: 123,
    };

    public static propTypes = {
        customPropFooBar: PropTypes.number,
    };

    public componentWillMount() {
        const { getPage, resultSpec = {} } = this.props;
        // we get getPage is available, we assume this is a pagable component
        // and therefor should not get autoexecuted datasource
        if (getPage) {
            getPage(resultSpec, [0, 500], [0, 500]);
        }
    }

    public render() {
        return <span title={this.props.customPropFooBar.toString()} />;
    }
}

describe("VisualizationLoadingHOC", () => {
    const PROJECT_ID = "prID";
    const createComponent = (
        customProps: Partial<ITestInnerComponentProps & IDataSourceProviderInjectedProps> = {},
        autoExecuteDataSource = true,
    ) => {
        const props = {
            dataSource: oneMeasureDataSource,
            projectId: PROJECT_ID,
            sdk,
            ...customProps,
        };
        const WrappedComponent = visualizationLoadingHOC(TestInnerComponent, autoExecuteDataSource);
        return mount<ITestInnerComponentProps & IDataSourceProviderInjectedProps & ICommonVisualizationProps>(
            <WrappedComponent {...props} />,
        );
    };

    it("should render the inner component passing down all the external properties", () => {
        const props = {
            resultSpec: {},
            onLoadingChanged: jest.fn(),
            ErrorComponent,
            LoadingComponent,
            afterRender: jest.fn(),
            pushData: jest.fn(),
            locale: "en-USA",
            drillableItems: [] as IDrillableItem[],
            onFiredDrillEvent: jest.fn(),
        };
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const inner = wrapper.find(TestInnerComponent);
            expect(inner.length).toBe(1);
            expect(inner.props()).toMatchObject(props);
        });
    });

    it("should init loading automatically", () => {
        let onLoadingChanged;
        const startedLoading = new Promise(resolve => {
            onLoadingChanged = resolve;
        });

        const wrapper = createComponent({
            LoadingComponent,
            onLoadingChanged,
        });

        return startedLoading.then(() => {
            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props()).toMatchObject({
                isLoading: true,
                execution: null,
            });
        });
    });

    it("should init loading automatically and pass execution to the inner component when obtained result", () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged,
        });

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);

        return testUtils.delay().then(() => {
            wrapper.update();
            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props()).toMatchObject({
                isLoading: false,
                execution: oneMeasureResponse,
            });
        });
    });

    it("should pass down error flag when execution failed", () => {
        const consoleErrorSpy = jest.spyOn(global.console, "error");
        consoleErrorSpy.mockImplementation(jest.fn());

        const wrapper = createComponent({
            dataSource: tooLargeDataSource,
            ErrorComponent,
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props().error).toEqual("DATA_TOO_LARGE_TO_COMPUTE");

            consoleErrorSpy.mockRestore();
        });
    });

    it("should call onError then when error occured", () => {
        const onError = jest.fn();
        createComponent({
            dataSource: tooLargeDataSource,
            onError,
        });

        return testUtils.delay().then(() => {
            expect(onError).toHaveBeenCalledTimes(1);

            expect(onError).toHaveBeenCalledWith(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
        });
    });

    it("should show EmptyResultError when exporting NO DATA result", async done => {
        const onExportReady = async (exportResult: IExportFunction) => {
            try {
                await exportResult({ format: XLSX });
            } catch (error) {
                expect(error.cause.name).toEqual("EmptyResultError");
                expect(error).toEqual(new RuntimeError(ErrorStates.NO_DATA));
            }
            done();
        };
        createComponent({
            dataSource: emptyDataSource,
            onExportReady,
            onError: noop,
        });
    });

    it("should not reload on new props when data source is equal and resultSpec did not change", () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged,
        });

        return testUtils.delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);

            wrapper.setProps({
                dataSource: oneMeasureDataSource,
                onLoadingChanged,
            });

            return testUtils.delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it("should reload on new props when resultSpec changed", () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged,
        });

        return testUtils.delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);

            onLoadingChanged.mockReset();
            wrapper.setProps({
                dataSource: oneMeasureDataSource,
                onLoadingChanged,
                resultSpec: { dimensions: [] },
            });

            return testUtils.delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it("should reload when dataSource changed", () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged,
        });

        return testUtils.delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            onLoadingChanged.mockReset();

            wrapper.setProps({
                dataSource: executionObjectWithTotalsDataSource,
                onLoadingChanged,
                resultSpec: { dimensions: [] },
            });

            return testUtils.delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it("should call onError when inner component fired Data too large for display", () => {
        const onError = jest.fn();
        const wrapper = createComponent({
            onError,
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            const inner = wrapper.find(TestInnerComponent);

            onError.mockReset();
            inner.props().onDataTooLarge();

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY));
        });
    });

    it("provides default onError property which is logging to the console", () => {
        const wrapper = createComponent();

        const consoleErrorSpy = jest.spyOn(global.console, "error");

        consoleErrorSpy.mockImplementation(jest.fn());

        return testUtils.delay().then(() => {
            wrapper.update();
            const inner = wrapper.find(TestInnerComponent);

            inner.props().onDataTooLarge();

            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error in execution:", {
                error: new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY),
            });

            consoleErrorSpy.mockRestore();
        });
    });

    it("should call pushData callback with execution result", () => {
        const pushData = jest.fn();
        createComponent({
            pushData,
        });

        return testUtils.delay().then(() => {
            expect(pushData).toHaveBeenCalledWith({
                result: oneMeasureResponse,
            });
        });
    });

    it("should be able to restore after rejected datasource", () => {
        const onError = jest.fn();
        const pushData = jest.fn();
        const wrapper = createComponent({
            onError,
            pushData,
            dataSource: tooLargeDataSource,
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            wrapper.setProps({
                dataSource: oneMeasureDataSource,
            });

            return testUtils.delay().then(() => {
                wrapper.update();
                const innerWrapped = wrapper.find(TestInnerComponent);

                expect(innerWrapped.props()).toMatchObject({
                    isLoading: false,
                    execution: oneMeasureResponse,
                });
            });
        });
    });

    it("should call onError when inner component fired onNegativeValues", () => {
        const onError = jest.fn();
        const wrapper = createComponent({
            onError,
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            const visualization = wrapper.find(TestInnerComponent);
            onError.mockReset();

            visualization.props().onNegativeValues();

            expect(onError).toHaveBeenCalledWith(new RuntimeError(ErrorStates.NEGATIVE_VALUES));
        });
    });

    describe("with autoExecuteDataSource disabled", () => {
        it("should not init loading automatically", () => {
            const wrapper = createComponent(
                {
                    LoadingComponent,
                },
                false,
            );

            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props().execution).toBe(null);
        });

        it("should call pushData with result from getPage", () => {
            const pushData = jest.fn();
            const onLoadingChanged = jest.fn();
            createComponent(
                {
                    pushData,
                    onLoadingChanged,
                    dataSource: oneMeasurePagableOnlyDataSource,
                },
                false,
            );

            return testUtils.delay().then(() => {
                expect(pushData).toHaveBeenCalledWith({
                    result: oneMeasureResponse,
                });
                expect(onLoadingChanged).toHaveBeenCalledWith({ isLoading: false });
            });
        });

        it("should pass down error flag when execution failed", () => {
            const consoleErrorSpy = jest.spyOn(global.console, "error");
            consoleErrorSpy.mockImplementation(jest.fn());

            const wrapper = createComponent(
                {
                    dataSource: tooLargeDataSource,
                    ErrorComponent,
                },
                false,
            );

            return testUtils.delay().then(() => {
                wrapper.update();
                const innerWrapped = wrapper.find(TestInnerComponent);
                expect(innerWrapped.props().error).toEqual("DATA_TOO_LARGE_TO_COMPUTE");

                consoleErrorSpy.mockRestore();
            });
        });

        it("should call onError when error occured", () => {
            const onError = jest.fn();
            createComponent(
                {
                    dataSource: tooLargeDataSource,
                    onError,
                },
                false,
            );

            return testUtils.delay().then(() => {
                expect(onError).toHaveBeenCalledTimes(1);

                expect(onError).toHaveBeenCalledWith(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
            });
        });

        it("getPage should return promise if component has been unmounted", async () => {
            const wrapper = createComponent({}, false);
            const innerWrapped = wrapper.find(TestInnerComponent);

            const okRes = await innerWrapped.props().getPage({ dimensions: [] }, [], []);
            expect(okRes).toEqual(oneMeasureResponse);

            wrapper.unmount();
            const nullRes = await innerWrapped.props().getPage({ dimensions: [] }, [], []);
            expect(nullRes).toBe(null);
        });
    });

    describe("Exporter", () => {
        beforeAll(() => {
            sdk.clone = jest.fn(() => sdk);
            sdk.report.exportResult = jest.fn(
                (_projectId: string, _executionResult: string, exportConfig: IExportConfig) => {
                    if (exportConfig.format === XLSX) {
                        return Promise.resolve({ uri: "/bar" });
                    }
                    return Promise.reject(new Error("Error!!!"));
                },
            );
        });

        afterAll(() => {
            jest.resetAllMocks();
        });

        it("should return URI when call exportResult successfully", done => {
            const onExportReady = async (exportResult: IExportFunction) => {
                const result = await exportResult({ format: XLSX });
                expect(result.uri).toEqual("/bar");
                done();
            };
            createComponent({
                onExportReady,
                dataSource: oneMeasureOneDimensionDataSource,
            });
        });

        it("should return error when call exportResult fail", done => {
            const onExportReady = async (exportResult: IExportFunction) => {
                try {
                    await exportResult({ format: CSV });
                } catch (error) {
                    expect(error.message).toEqual("Error!!!");
                    done();
                }
            };
            createComponent({
                onExportReady,
                dataSource: oneMeasureOneDimensionDataSource,
            });
        });

        it("should return the applied filters", done => {
            const onExportReady = async (exportResult: IExportFunction) => {
                const executionResult =
                    "/gdc/app/projects/storybook/executionResults/59908ac5f1bf7a4fbbf78b08a7d034ed?dimensions=2";
                const extendedExportConfig: IExtendedExportConfig = {
                    format: XLSX,
                    includeFilterContext: true,
                    mergeHeaders: true,
                };
                const exportConfig: IExportConfig = {
                    format: XLSX,
                    mergeHeaders: true,
                    showFilters: oneAttributeOneMeasureOneFilterDataSource.getAfm().filters,
                    title: "Untitled",
                };

                await exportResult(extendedExportConfig);
                expect(sdk.report.exportResult).toBeCalledWith(PROJECT_ID, executionResult, exportConfig);

                done();
            };
            createComponent({
                onExportReady,
                dataSource: oneAttributeOneMeasureOneFilterDataSource,
            });
        });

        it("should return the default file name", done => {
            const onExportReady = async (exportResult: IExportFunction) => {
                await exportResult({ format: XLSX });
                expect(sdk.report.exportResult).toBeCalledWith(PROJECT_ID, "foo", {
                    format: XLSX,
                    title: "Untitled",
                });
                done();
            };
            createComponent({
                onExportReady,
                dataSource: oneMeasureOneDimensionDataSource,
            });
        });

        it("should return the file name passed", done => {
            const onExportReady = async (exportResult: IExportFunction) => {
                await exportResult({ format: XLSX });
                expect(sdk.report.exportResult).toBeCalledWith(PROJECT_ID, "foo", {
                    format: XLSX,
                    title: "CustomTitle",
                });
                done();
            };
            createComponent({
                exportTitle: "CustomTitle",
                onExportReady,
                dataSource: oneMeasureOneDimensionDataSource,
            });
        });

        it("should return the validated file name", done => {
            const onExportReady = async (exportResult: IExportFunction) => {
                await exportResult({ format: XLSX });
                expect(sdk.report.exportResult).toBeCalledWith(PROJECT_ID, "foo", {
                    format: XLSX,
                    title: "CustomTitle",
                });
                done();
            };
            createComponent({
                exportTitle: 'Custom/?*:|"<>Title',
                onExportReady,
                dataSource: oneMeasureOneDimensionDataSource,
            });
        });
    });
});
