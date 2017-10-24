import * as React from 'react';
import { mount } from 'enzyme';

import {
    VisualizationObject
} from '@gooddata/data-layer';
import { ISimpleExecutorResult } from 'gooddata';
import { delay } from '../../tests/utils';

import {
    initTableDataLoading,
    TableTransformation,
    ResponsiveTable
} from '../../tests/mocks';
jest.mock('../../../helpers/load', () => ({
    initTableDataLoading
}));
jest.mock('@gooddata/indigo-visualizations', () => ({
    TableTransformation,
    ResponsiveTable
}));

import { Table, ITableProps } from '../Table';
import { ErrorStates } from '../../../constants/errorStates';
import { VisualizationTypes } from '../../../constants/visualizationTypes';
import { getResultWithTwoMeasures } from '../../../execution/fixtures/SimpleExecutor.fixtures';

describe('Table', () => {
    const createComponent = (props: ITableProps) => {
        return mount<ITableProps>(<Table {...props} />);
    };

    const createProps = (customProps = {}): ITableProps => {
        const metadataResult: VisualizationObject.IVisualizationMetadataResult = {
            metadata: {
                meta: {
                    title: 'foo'
                },
                content: {
                    type: VisualizationTypes.COLUMN as VisualizationObject.VisualizationType,
                    buckets: {
                        measures: [],
                        categories: [],
                        filters: []
                    }
                }
            },
            measuresMap: {}
        };
        return {
            height: 200,
            environment: 'dashboards',
            dataSource: {
                getData: () => Promise.resolve({}),
                getAfm: () => ({}),
                getFingerprint: () => ('{}')
            },
            metadataSource: {
                getVisualizationMetadata: () => Promise.resolve(metadataResult),
                getFingerprint: () => '{}'
            },
            ...customProps
        };
    };

    beforeEach(() => {
        initTableDataLoading.mockClear();
    });

    it('should call two times initDataLoading when fingerprint changes', () => {
        const onError = jest.fn();
        const props = createProps({
            dataSource: {
                getData: () => Promise.resolve({}),
                getAfm: () => ({}),
                getFingerprint: () => '{}'
            }
        });
        const wrapper = createComponent(props);
        wrapper.setProps({
            dataSource: {
                getData() {
                    return Promise.resolve(getResultWithTwoMeasures());
                },
                getAfm: () => ({}),
                getFingerprint: () => 'differentprint'
            }
        });

        return delay().then(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(initTableDataLoading).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledTimes(0);
        });
    });

    it('should call initDataLoading when sorting changed', () => {
        const props = createProps({
            transformation: {}
        });
        const wrapper = createComponent(props);

        const newProps = createProps({
            visualizationProperties: { sorting: 'abc' },
            transformation: {}
        });
        wrapper.setProps(newProps);

        return delay().then(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(initTableDataLoading).toHaveBeenCalledTimes(2);
            expect(initTableDataLoading).toHaveBeenCalledWith(
                newProps.dataSource,
                newProps.metadataSource,
                newProps.transformation,
                newProps.visualizationProperties.sorting
            );
        });
    });

    it('should not call initDataLoading second time', () => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            dataSource: {
                getData: () => Promise.resolve({}),
                getAfm: () => ({}),
                getFingerprint: () => '{}'
            }
        });
        const wrapper = createComponent(props);
        wrapper.setProps({
            dataSource: {
                getData: () => Promise.resolve({}),
                getAfm: () => ({}),
                getFingerprint: () => '{}'
            }
        });

        return delay().then(() => {
            expect(wrapper.find('.gdc-indigo-responsive-table')).toBeDefined();
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(initTableDataLoading).toHaveBeenCalledTimes(1);
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
            expect(initTableDataLoading).toHaveBeenCalledTimes(1);
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
            onError
        });
        initTableDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(TableTransformation).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({
                status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE,
                options: expect.any(Object)
            });
        });
    });

    it('should call pushData with execution result', () => {
        const pushData = jest.fn();
        const props = createProps({
            pushData
        });
        const resultMock: { result: ISimpleExecutorResult, sorting: Object, metadata: Object } = {
            result: {
                isLoaded: true,
                headers: [
                    {
                        type: 'attrLabel',
                        id: 'label.csv_test.polozka',
                        uri: '/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/75662',
                        title: 'Polozka'
                    }
                ],
                rawData: [
                    [
                        {
                            id: '1',
                            name: 'sesit'
                        }
                    ]
                ],
                warnings: [],
                isEmpty: false
            },
            sorting: {},
            metadata: {}
        };
        initTableDataLoading.mockImplementationOnce(() => Promise.resolve(resultMock));
        createComponent(props);

        return delay().then(() => {
            expect(pushData).toHaveBeenCalledWith({
                executionResult: resultMock.result,
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
            expect(loadingHandler).toHaveBeenCalled();
        });
    });
});
