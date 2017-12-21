import * as React from 'react';
import { mount } from 'enzyme';

import { delay } from '../../tests/utils';

import {
    TableTransformation,
    ResponsiveTable,
    LoadingComponent,
    ErrorComponent
} from '../../tests/mocks';

// Replace this with optional prop
jest.mock('@gooddata/indigo-visualizations', () => ({
    TableTransformation,
    ResponsiveTable
}));

import { IDataSource } from '../../../interfaces/DataSource';
import { PureTable, ITableProps, ITableState } from '../PureTable';
import { ErrorStates } from '../../../constants/errorStates';
import {
    oneMeasureResponse,
    oneMeasureAfm,
    tooLargeResponse,
    executionObjectWithTotals,
    responseWithTotals
} from '../../../execution/fixtures/ExecuteAfm.fixtures';
import { AFM } from '@gooddata/typings';
import { IIndexedTotalItem } from '../../../interfaces/Totals';

const oneMeasureDataSource: IDataSource = {
    getData: () => Promise.resolve(oneMeasureResponse),
    getAfm: () => oneMeasureAfm,
    getFingerprint: () => JSON.stringify(oneMeasureResponse)
};

const executionObjectWithTotalsDataSource: IDataSource = {
    getData: () => Promise.resolve(responseWithTotals),
    getAfm: () => executionObjectWithTotals.execution.afm,
    getFingerprint: () => JSON.stringify(responseWithTotals)
};

const tooLargeDataSource: IDataSource = {
    getData: () => Promise.reject(tooLargeResponse),
    getAfm: () => ({}),
    getFingerprint: () => JSON.stringify(tooLargeDataSource)
};
const delayedTooLargeDataSource: IDataSource = {
    // tslint:disable-next-line:variable-name
    getData: () => (new Promise((_resolve, reject) => {
        setTimeout(reject(tooLargeResponse), 20);
    })),
    getAfm: () => ({}),
    getFingerprint: () => JSON.stringify(tooLargeDataSource)
};

describe('PureTable', () => {
    const createComponent = (props: ITableProps) => {
        return mount<ITableProps, ITableState>(<PureTable {...props} />);
    };

    const createProps = (customProps = {}): ITableProps => {
        return {
            height: 200,
            environment: 'dashboards',
            dataSource: oneMeasureDataSource,
            ...customProps
        };
    };

    it('should call trigger loading changed when sorting changed', () => {
        const onLoadingChanged = jest.fn();
        const props = createProps({
            resultSpec: {},
            onLoadingChanged
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            expect(wrapper.find(TableTransformation).length).toBe(1);
            const newProps = createProps({
                resultSpec: {
                    sorts: [{
                        attributeSortItem: {
                            direction: 'desc',
                            attributeIdentifier: 'a1'
                        }
                    }]
                }
            });
            wrapper.setProps(newProps);
            return delay().then(() => {
                expect(onLoadingChanged).toHaveBeenCalledTimes(4);
            });
        });
    });

    it('should call trigger loading changed when totals changed', () => {
        const onLoadingChanged = jest.fn();

        const resultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ['a1'],
                    totals: [
                        {
                            measureIdentifier: 'm1',
                            type: 'max',
                            attributeIdentifier: 'a1'
                        }
                    ]
                }
            ]
        };

        const props = createProps({
            resultSpec,
            onLoadingChanged
        });

        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            expect(wrapper.find(TableTransformation).length).toBe(1);

            const newResultSpec: AFM.IResultSpec = {
                dimensions: [
                    {
                        itemIdentifiers: ['a1'],
                        totals: [
                            {
                                measureIdentifier: 'm1',
                                type: 'max',
                                attributeIdentifier: 'a1'
                            },
                            {
                                measureIdentifier: 'm1',
                                type: 'min',
                                attributeIdentifier: 'a1'
                            }
                        ]
                    }
                ]
            };
            const newProps = createProps({resultSpec: newResultSpec});
            wrapper.setProps(newProps);
            return delay().then(() => {
                expect(onLoadingChanged).toHaveBeenCalledTimes(4);
            });
        });
    });

    it('should not call initDataLoading second time', () => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            dataSource: oneMeasureDataSource
        });
        const wrapper = createComponent(props);
        wrapper.setProps({
            dataSource: oneMeasureDataSource
        });

        return delay().then(() => {
            expect(wrapper.find('.gdc-indigo-responsive-table')).toBeDefined();
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith({ status: ErrorStates.OK });
        });
    });

    it('should render responsive table', () => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            environment: 'dashboards'
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find('.gdc-indigo-responsive-table')).toBeDefined();
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(wrapper.find(TableTransformation).prop('tableRenderer')).toBeDefined();
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith({ status: ErrorStates.OK });
        });
    });

    it('should not render responsive table when result is not available', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            wrapper.setState({ result: null }, () => {
                expect(wrapper.find(TableTransformation).length).toBe(0);
            });
        });
    });

    it('should not render responsive table when table is still loading', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            wrapper.setState({ isLoading: true }, () => {
                expect(wrapper.find(TableTransformation).length).toBe(0);
            });
        });
    });

    it('should not render responsive table when error is set', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            wrapper.setState({ error: ErrorStates.UNKNOWN_ERROR }, () => {
                expect(wrapper.find(TableTransformation).length).toBe(0);
            });
        });
    });

    it('should call onError with DATA_TOO_LARGE', () => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            dataSource: tooLargeDataSource
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(TableTransformation).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({
                status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE,
                options: {
                    dateOptionsDisabled: false
                }
            });
        });
    });

    it('should call pushData with execution result', () => {
        const pushData = jest.fn();
        const props = createProps({
            pushData
        });
        createComponent(props);

        return delay().then(() => {
            expect(pushData).toHaveBeenCalledWith({
                result: oneMeasureResponse,
                options: {
                    dateOptionsDisabled: false
                }
            });
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

    it('should provide totals based on resultSpec to the TableTransformation', () => {
        const props = createProps({
            dataSource: executionObjectWithTotalsDataSource,
            resultSpec: executionObjectWithTotals.execution.resultSpec
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const totals = wrapper.find(TableTransformation).props().totals;
            expect(totals).toEqual([{
                outputMeasureIndexes: [0, 1], type: 'sum'
            }, {
                outputMeasureIndexes: [0], type: 'avg'
            }]);
        });
    });

    it('should call pushData with totals', () => {
        const onTotalsEdit = jest.fn();
        const pushData = jest.fn();
        const props = createProps({
            pushData,
            onTotalsEdit,
            dataSource: executionObjectWithTotalsDataSource
        });
        const wrapper = createComponent(props);
        const totals: IIndexedTotalItem[] = [
            {
                type: 'sum',
                outputMeasureIndexes: [0]
            }
        ];

        return delay().then(() => {
            expect(pushData).toHaveBeenCalledTimes(1);
            expect(wrapper.find(TableTransformation).prop('onTotalsEdit')).toBeDefined();

            const callback: any = wrapper.find(TableTransformation).prop('onTotalsEdit');
            callback(totals);

            expect(pushData).toHaveBeenCalledTimes(2);
            expect(pushData).toHaveBeenCalledWith({
                properties: {
                    totals: [{
                        type: 'sum',
                        measureIdentifier: 'm1',
                        attributeIdentifier: 'a1'
                    }]
                }
            });
        });
    });

    it('should display LoadingComponent during loading and pass props to it', () => {
        const onError = jest.fn();
        let onLoadingChanged;
        const startedLoading = new Promise((resolve) => {
            onLoadingChanged = resolve;
        });
        const dataSource = delayedTooLargeDataSource;
        const props = createProps({
            onError,
            onLoadingChanged,
            dataSource,
            LoadingComponent
        });
        const wrapper = createComponent(props);
        return startedLoading.then(() => {
            expect(wrapper.find(LoadingComponent).length).toBe(1);
            const LoadingElement = wrapper.find(LoadingComponent).get(0);
            expect(LoadingElement.props.props.dataSource).toEqual(dataSource);
        });
    });

    it('should display ErrorComponent on error and pass error and props to it', () => {
        let onError;
        const threwError = new Promise((resolve) => {
            onError = (error: { status: string }) => {
                if (error && error.status !== ErrorStates.OK) {
                    resolve();
                }
            };
        });
        const dataSource = delayedTooLargeDataSource;
        const props = createProps({
            onError,
            dataSource,
            ErrorComponent
        });
        const wrapper = createComponent(props);
        return threwError.then(() => {
            expect(wrapper.find(ErrorComponent).length).toBe(1);
            const ErrorElement = wrapper.find(ErrorComponent).get(0);
            expect(ErrorElement.props.error.status).toBe(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);
            expect(ErrorElement.props.props.dataSource).toEqual(dataSource);
        });
    });
});
