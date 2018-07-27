// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { testUtils } from '@gooddata/js-utils';
import {
    oneMeasureDataSource,
    oneMeasurePagableOnlyDataSource,
    tooLargeDataSource,
    executionObjectWithTotalsDataSource,
    LoadingComponent,
    ErrorComponent
} from '../../../tests/mocks';

import 'jest';

import {
    ICommonVisualizationProps,
    ILoadingInjectedProps,
    visualizationLoadingHOC,
    commonDefaultProps
} from '../VisualizationLoadingHOC';
import { oneMeasureResponse } from '../../../../execution/fixtures/ExecuteAfm.fixtures';
import { IDrillableItem } from '../../../../interfaces/DrillEvents';
import { IDataSourceProviderInjectedProps } from '../../../afm/DataSourceProvider';
import { RuntimeError } from '../../../../errors/RuntimeError';
import { ErrorStates } from '../../../../constants/errorStates';

export interface ITestInnerComponentProps extends ICommonVisualizationProps {
    customPropFooBar?: number;
}

class TestInnerComponent
    extends React.Component<ITestInnerComponentProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps> {

    public static defaultProps:
        Partial<ITestInnerComponentProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps> = {
            ...commonDefaultProps,
            customPropFooBar: 123
        };

    public static propTypes = {
        customPropFooBar: PropTypes.number
    };

    public componentWillMount() {
        const {
            getPage,
            resultSpec
        } = this.props;
        // we get getPage is available, we assume this is a pagable component
        // and therefor should not get autoexecuted datasource
        if (getPage) {
            getPage(
                resultSpec,
                [0, 500],
                [0, 500]
            );
        }
    }

    public render() {
        return <span title={this.props.customPropFooBar.toString()} />;
    }
}

describe('VisualizationLoadingHOC', () => {

    const createComponent =
    (
        customProps: Partial<ITestInnerComponentProps & IDataSourceProviderInjectedProps> = {},
        autoExecuteDataSource = true
    ) => {
        const props = {
            dataSource: oneMeasureDataSource,
            ...customProps
        };
        const WrappedComponent = visualizationLoadingHOC(TestInnerComponent, autoExecuteDataSource);
        return mount<ITestInnerComponentProps & IDataSourceProviderInjectedProps>(<WrappedComponent {...props} />);
    };

    it('should render the inner component passing down all the external properties', () => {
        const props = {
            resultSpec: {},
            onLoadingChanged: jest.fn(),
            ErrorComponent,
            LoadingComponent,
            afterRender: jest.fn(),
            pushData: jest.fn(),
            locale: 'en-USA',
            drillableItems: [] as IDrillableItem[],
            onFiredDrillEvent: jest.fn()
        };
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const inner = wrapper.find(TestInnerComponent);
            expect(inner.length).toBe(1);
            expect(inner.props()).toMatchObject(props);
        });
    });

    it('should init loading automatically', () => {
        let onLoadingChanged;
        const startedLoading = new Promise((resolve) => {
            onLoadingChanged = resolve;
        });

        const wrapper = createComponent({
            LoadingComponent,
            onLoadingChanged
        });

        return startedLoading.then(() => {
            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props()).toMatchObject({
                isLoading: true,
                execution: null
            });
        });
    });

    it('should init loading automatically and pass execution to the inner component when obtained result', () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged
        });

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);

        return testUtils.delay().then(() => {
            wrapper.update();
            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props()).toMatchObject({
                isLoading: false,
                execution: oneMeasureResponse
            });
        });
    });

    it('should pass down error flag when execution failed', () => {
        const consoleErrorSpy = jest.spyOn(global.console, 'error');
        consoleErrorSpy.mockImplementation(jest.fn());

        const wrapper = createComponent({
            dataSource: tooLargeDataSource,
            ErrorComponent
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props().error).toEqual('DATA_TOO_LARGE_TO_COMPUTE');

            consoleErrorSpy.mockRestore();
        });
    });

    it('should call onError then when error occured', () => {
        const onError = jest.fn();
        createComponent({
            dataSource: tooLargeDataSource,
            onError
        });

        return testUtils.delay().then(() => {
            expect(onError).toHaveBeenCalledTimes(1);

            expect(onError).toHaveBeenCalledWith(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
        });
    });

    it('should not reload on new props when data source is equal and resultSpec did not change', () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged
        });

        return testUtils.delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);

            wrapper.setProps({
                dataSource: oneMeasureDataSource,
                onLoadingChanged
            });

            return testUtils.delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it('should reload on new props when resultSpec changed', () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged
        });

        return testUtils.delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);

            onLoadingChanged.mockReset();
            wrapper.setProps({
                dataSource: oneMeasureDataSource,
                onLoadingChanged,
                resultSpec: { dimensions: [] }
            });

            return testUtils.delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it('should reload when dataSource changed', () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged
        });

        return testUtils.delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            onLoadingChanged.mockReset();

            wrapper.setProps({
                dataSource: executionObjectWithTotalsDataSource,
                onLoadingChanged,
                resultSpec: { dimensions: [] }
            });

            return testUtils.delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it('should call onError when inner component fired Data too large for display', () => {
        const onError = jest.fn();
        const wrapper = createComponent({
            onError
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

    it('provides default onError property which is logging to the console', () => {
        const wrapper = createComponent();

        const consoleErrorSpy = jest.spyOn(global.console, 'error');

        consoleErrorSpy.mockImplementation(jest.fn());

        return testUtils.delay().then(() => {
            wrapper.update();
            const inner = wrapper.find(TestInnerComponent);

            inner.props().onDataTooLarge();

            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY));

            consoleErrorSpy.mockRestore();
        });
    });

    it('should call pushData callback with execution result', () => {
        const pushData = jest.fn();
        createComponent({
            pushData
        });

        return testUtils.delay().then(() => {
            expect(pushData).toHaveBeenCalledWith({
                result: oneMeasureResponse
            });
        });
    });

    it('should be able to restore after rejected datasource', () => {
        const onError = jest.fn();
        const pushData = jest.fn();
        const wrapper = createComponent({
            onError,
            pushData,
            dataSource: tooLargeDataSource
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            wrapper.setProps({
                dataSource: oneMeasureDataSource
            });

            return testUtils.delay().then(() => {
                wrapper.update();
                const innerWrapped = wrapper.find(TestInnerComponent);

                expect(innerWrapped.props()).toMatchObject({
                    isLoading: false,
                    execution: oneMeasureResponse
                });
            });
        });
    });

    it('should call onError when inner component fired onNegativeValues', () => {
        const onError = jest.fn();
        const wrapper = createComponent({
            onError
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            const visualization = wrapper.find(TestInnerComponent);
            onError.mockReset();

            visualization.props().onNegativeValues();

            expect(onError).toHaveBeenCalledWith(new RuntimeError(ErrorStates.NEGATIVE_VALUES));
        });
    });

    describe('with autoExecuteDataSource disabled', () => {
        it('should not init loading automatically', () => {
            const wrapper = createComponent({
                LoadingComponent
            }, false);

            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props().isLoading).toBe(false);
            expect(innerWrapped.props().execution).toBe(null);
        });

        it('should call pushData with result from getPage', () => {
            const pushData = jest.fn();
            const onLoadingChanged = jest.fn();
            createComponent({
                pushData,
                onLoadingChanged,
                dataSource: oneMeasurePagableOnlyDataSource
            }, false);

            return testUtils.delay().then(() => {
                expect(pushData).toHaveBeenCalledWith({
                    result: oneMeasureResponse
                });
                expect(onLoadingChanged).not.toHaveBeenCalled();
            });
        });

        it('should pass down error flag when execution failed', () => {
            const consoleErrorSpy = jest.spyOn(global.console, 'error');
            consoleErrorSpy.mockImplementation(jest.fn());

            const wrapper = createComponent({
                dataSource: tooLargeDataSource,
                ErrorComponent
            }, false);

            return testUtils.delay().then(() => {
                wrapper.update();
                const innerWrapped = wrapper.find(TestInnerComponent);
                expect(innerWrapped.props().error).toEqual('DATA_TOO_LARGE_TO_COMPUTE');

                consoleErrorSpy.mockRestore();
            });
        });

        it('should call onError then when error occured', () => {
            const onError = jest.fn();
            createComponent({
                dataSource: tooLargeDataSource,
                onError
            }, false);

            return testUtils.delay().then(() => {
                expect(onError).toHaveBeenCalledTimes(1);

                expect(onError).toHaveBeenCalledWith(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
            });
        });
    });
});
