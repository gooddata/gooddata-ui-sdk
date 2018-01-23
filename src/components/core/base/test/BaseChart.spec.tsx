import * as React from 'react';
import { mount } from 'enzyme';
import { noop } from 'lodash';
import { Execution, AFM } from '@gooddata/typings';
import { delay } from '../../../tests/utils';
import { IDataSource } from '../../../../interfaces/DataSource';
import { Visualization } from '../../../tests/mocks';
import { BaseChart, IBaseChartProps } from '../BaseChart';
import { ErrorStates } from '../../../../constants/errorStates';
import { VisualizationTypes } from '../../../../constants/visualizationTypes';
import {
    oneMeasureResponse,
    tooLargeResponse,
    emptyResponse,
    badRequestResponse
} from '../../../../execution/fixtures/ExecuteAfm.fixtures';

function createDataSource(result: Execution.IExecutionResponses): IDataSource {
    return {
        getData: () => Promise.resolve(result),
        getAfm: () => ({}),
        getFingerprint: () => JSON.stringify(result)
    };
}

function createRejectingDataSource(error: Execution.IError): IDataSource {
    return {
        getData: () => Promise.reject(error),
        getAfm: () => ({}),
        getFingerprint: () => JSON.stringify(error)
    };
}

describe('BaseChart', () => {
    const dataSource = createDataSource(oneMeasureResponse);
    const createProps = (customProps = {}) => {
        const props: IBaseChartProps = {
            height: 200,
            dataSource,
            locale: 'en-US',
            type: VisualizationTypes.LINE,
            visualizationComponent: Visualization,
            ...customProps
        };
        return props;
    };

    function createComponent(props: IBaseChartProps) {
        return mount(<BaseChart {...props}/>);
    }

    it('should render a chart', () => {
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            onError,
            onLoadingChanged
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(1);
        });
    });

    it('should not render responsive table when result is not available', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(1);
            expect(wrapper.find('.gdc-line-chart')).toBeDefined();
            wrapper.setState({ result: null }, () => {
                expect(wrapper.find(Visualization).length).toBe(0);
            });
        });
    });

    it('should not render responsive table when table is still loading', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(1);
            wrapper.setState({ isLoading: true }, () => {
                expect(wrapper.find(Visualization).length).toBe(0);
            });
        });
    });

    it('should not render responsive table when error is set', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(1);
            wrapper.setState({ error: ErrorStates.UNKNOWN_ERROR }, () => {
                expect(wrapper.find(Visualization).length).toBe(0);
            });
        });
    });

    it('should correctly set loading state and call initDataLoading once', () => {
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            onError,
            onLoadingChanged,
            type: VisualizationTypes.PIE
        });
        createComponent(props);

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);

        return delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith({ status: ErrorStates.OK });
        });
    });

    it('should not call initDataLoading when forceExecutionResult', () => {
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const wrapper = createComponent(createProps({
            onError,
            onLoadingChanged,
            type: VisualizationTypes.PIE,
            forceExecutionResult: oneMeasureResponse
        }));

        expect(onLoadingChanged).toHaveBeenCalledTimes(0);
        expect(wrapper.state('result')).toEqual(oneMeasureResponse);

        return delay().then(() => {
            wrapper.setProps({ forceExecutionResult: emptyResponse });
            expect(onLoadingChanged).toHaveBeenCalledTimes(0);
            expect(onError).toHaveBeenCalledTimes(0);
            expect(wrapper.state('result')).toEqual(emptyResponse);
        });
    });

    it('should call pushData on execution finish', () => {
        const pushData = jest.fn();
        const props = createProps({ pushData });
        createComponent(props);

        return delay().then(() => {
            expect(pushData).toHaveBeenCalledTimes(1);
        });
    });

    it('should call onError with DATA_TOO_LARGE_TO_COMPUTE', () => {
        const onError = jest.fn();
        const tooLargeDataSource = createRejectingDataSource(tooLargeResponse);
        const props = createProps({
            onError,
            dataSource: tooLargeDataSource
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({
                status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE,
                options: expect.any(Object)
            });
        });
    });

    it('should NOT call onError when forceExecutionResult', () => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            forceExecutionResult: oneMeasureResponse
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(1);
            expect(onError).toHaveBeenCalledTimes(0);
        });
    });

    it('should be able to restore after rejected datasource', () => {
        const onError = jest.fn();
        const pushData = jest.fn();
        const tooLargeDataSource = createRejectingDataSource(tooLargeResponse);
        const props = createProps({
            onError,
            pushData,
            dataSource: tooLargeDataSource
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({
                status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE,
                options: expect.any(Object)
            });

            wrapper.setProps({
                dataSource
            });
            return delay().then(() => {
                expect(pushData).toHaveBeenCalledTimes(1);
            });
        });
    });

    it('should call onError with BAD_REQUEST', () => {
        const onError = jest.fn();
        const badRequestDataSource = createRejectingDataSource(badRequestResponse);
        const props = createProps({
            onError,
            dataSource: badRequestDataSource
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({
                status: ErrorStates.BAD_REQUEST,
                options: expect.any(Object)
            });
        });
    });

    it('should call onError with NO_DATA', () => {
        const onError = jest.fn();
        const emptyResultDataSource = createDataSource(emptyResponse);
        const props = createProps({
            onError,
            dataSource: emptyResultDataSource
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({
                status: ErrorStates.NO_DATA,
                options: expect.any(Object)
            });
        });
    });

    it('should use default onError when is not provided', () => {
        const origin = global.console.error;
        global.console.error = jest.fn();

        const emptyResultDataSource = createDataSource(emptyResponse);
        const props = createProps({ dataSource: emptyResultDataSource });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(global.console.error).toHaveBeenCalledWith({
                status: ErrorStates.NO_DATA,
                options: expect.any(Object)
            });
            global.console.error = origin;
        });
    });

    it('should load data when dataSource change', () => {
        const dataSource1 = createDataSource(oneMeasureResponse);
        const dataSource1Init = jest.spyOn(dataSource1, 'getData');
        const props = createProps({ dataSource: dataSource1, onError: noop });
        const wrapper = createComponent(props);
        expect(dataSource1Init).toHaveBeenCalledTimes(1);

        return delay().then(() => {
            expect(wrapper.state().result).toEqual(oneMeasureResponse);

            const dataSource2 = createDataSource(emptyResponse);
            const dataSource2Init = jest.spyOn(dataSource2, 'getData');
            wrapper.setProps({
                dataSource: dataSource2
            });
            expect(wrapper.state().result).toBeNull();
            expect(dataSource2Init).toHaveBeenCalledTimes(1);
        });
    });

    it('should load data when result spec change', () => {
        const dataSource = createDataSource(oneMeasureResponse);
        const getData = jest.spyOn(dataSource, 'getData');
        const props = createProps({ dataSource });

        const wrapper = createComponent(props);

        const resultSpec: AFM.IResultSpec = { dimensions: [] };

        wrapper.setProps({
            resultSpec
        });

        return delay().then(() => {
            // Once it should have been called on init
            // Second time on result spec change
            expect(getData).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger `onLoadingChanged`', () => {
        const loadingHandler = jest.fn();

        const props = createProps({
            onLoadingChanged: loadingHandler
        });

        createComponent(props);

        return delay().then(() => {
            expect(loadingHandler).toHaveBeenCalledTimes(2);
        });
    });
});
