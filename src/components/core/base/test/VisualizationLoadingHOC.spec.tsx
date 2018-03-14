import * as React from 'react';
import * as PropTypes from 'prop-types';
import { mount } from 'enzyme';
import {
    oneMeasureDataSource,
    tooLargeDataSource,
    executionObjectWithTotalsDataSource,
    LoadingComponent,
    ErrorComponent
} from '../../../tests/mocks';

import {
    ICommonVisualizationProps,
    ILoadingInjectedProps,
    visualizationLoadingHOC,
    commonDefaultprops
} from '../VisualizationLoadingHOC';
import { delay } from '../../../tests/utils';
import { oneMeasureResponse } from '../../../../execution/fixtures/ExecuteAfm.fixtures';
import { IDrillableItem } from '../../../../interfaces/DrillEvents';
import { ErrorStates } from '../../../../constants/errorStates';

export interface ITestInnerComponentProps extends ICommonVisualizationProps {
    customPropFooBar?: number;
}

class TestInnerComponent extends React.Component<ITestInnerComponentProps & ILoadingInjectedProps> {
    public static defaultProps: Partial<ITestInnerComponentProps & ILoadingInjectedProps> = {
        ...commonDefaultprops,
        customPropFooBar: 123
    };

    public static propTypes = {
        customPropFooBar: PropTypes.number
    };

    public render() {
        return <span title={this.props.customPropFooBar.toString()} />;
    }
}

describe('VisualizationLoadingHOC', () => {
    const WrappedComponent = visualizationLoadingHOC(TestInnerComponent);

    const createComponent = (customProps: Partial<ITestInnerComponentProps> = {}) => {
        const props = {
            dataSource: oneMeasureDataSource,
            ...customProps
        };
        return mount<ITestInnerComponentProps>(<WrappedComponent {...props} />);
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

        return delay().then(() => {
            wrapper.update();
            const inner = wrapper.find(TestInnerComponent);
            expect(inner.length).toBe(1);
            expect(inner.props()).toMatchObject(props);
        });
    });

    it('should init loading automatically and while loading render LoadingComponent passing down props', () => {
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
                error: ErrorStates.OK,
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

        return delay().then(() => {
            wrapper.update();
            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props()).toMatchObject({
                isLoading: false,
                error: ErrorStates.OK,
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

        return delay().then(() => {
            wrapper.update();
            const innerWrapped = wrapper.find(TestInnerComponent);
            expect(innerWrapped.props()).toMatchObject({
                isLoading: false,
                error: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE,
                execution: null
            });

            consoleErrorSpy.mockRestore();
        });
    });

    it('should call onError at the beginning and then when error occured', () => {
        const onError = jest.fn();
        createComponent({
            dataSource: tooLargeDataSource,
            onError
        });

        expect(onError).toHaveBeenCalledTimes(1);

        return delay().then(() => {
            expect(onError.mock.calls[0]).toEqual([{ status: 'OK' }]);
            expect(onError.mock.calls[1]).toEqual([{
                options: {
                    dateOptionsDisabled: false
                },
                status: 'DATA_TOO_LARGE_TO_COMPUTE'}]
            );
        });
    });

    it('should not reload on new props when data source is equal and resultSpec did not change', () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged
        });

        return delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);

            wrapper.setProps({
                dataSource: oneMeasureDataSource,
                onLoadingChanged
            });

            return delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it('should reload on new props when resultSpec changed', () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged
        });

        return delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);

            onLoadingChanged.mockReset();
            wrapper.setProps({
                dataSource: oneMeasureDataSource,
                onLoadingChanged,
                resultSpec: { dimensions: [] }
            });

            return delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it('should reload when dataSource changed', () => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            onLoadingChanged
        });

        return delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            onLoadingChanged.mockReset();

            wrapper.setProps({
                dataSource: executionObjectWithTotalsDataSource,
                onLoadingChanged,
                resultSpec: { dimensions: [] }
            });

            return delay().then(() => {
                expect(onLoadingChanged.mock.calls.length).toBe(2);
            });
        });
    });

    it('should call onError when inner component fired Data too large for display', () => {
        const onError = jest.fn();
        const wrapper = createComponent({
            onError
        });

        return delay().then(() => {
            wrapper.update();
            const inner = wrapper.find(TestInnerComponent);

            onError.mockReset();
            inner.props().onDataTooLarge();

            expect(onError.mock.calls.length).toBe(1);
            expect(onError.mock.calls[0]).toEqual([{
                options: {
                    dateOptionsDisabled: false
                },
                status: 'DATA_TOO_LARGE_TO_DISPLAY'}]
            );
        });
    });

    it('provides default onError property which is logging to the console', () => {
        const wrapper = createComponent();

        const consoleErrorSpy = jest.spyOn(global.console, 'error');
        consoleErrorSpy.mockImplementation(jest.fn());
        wrapper.props().onError({ status: 'test status' });

        expect(consoleErrorSpy).toHaveBeenCalledWith({ status: 'test status' });

        consoleErrorSpy.mockRestore();
    });

    it('should call pushData callback with execution result', () => {
        const pushData = jest.fn();
        createComponent({
            pushData
        });

        return delay().then(() => {
            expect(pushData).toHaveBeenCalledWith({
                result: oneMeasureResponse,
                options: {
                    dateOptionsDisabled: false
                }
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

        return delay().then(() => {
            wrapper.update();
            wrapper.setProps({
                dataSource: oneMeasureDataSource
            });

            return delay().then(() => {
                wrapper.update();
                const innerWrapped = wrapper.find(TestInnerComponent);

                expect(innerWrapped.props()).toMatchObject({
                    isLoading: false,
                    error: ErrorStates.OK,
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

        return delay().then(() => {
            wrapper.update();
            const visualization = wrapper.find(TestInnerComponent);
            onError.mockReset();

            visualization.props().onNegativeValues();

            expect(onError).toHaveBeenCalledWith({
                options: {
                    dateOptionsDisabled: false
                },
                status: 'NEGATIVE_VALUES'
            });
        });
    });
});
