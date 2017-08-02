import * as React from 'react';
import { mount } from 'enzyme';

import {
    VisualizationObject
} from '@gooddata/data-layer';

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
import { postpone } from '../../../helpers/test_helpers';

describe('Table', () => {
    const createComponent = (props: ITableProps) => {
        return mount(<Table {...props} />);
    };

    const createProps = (customProps = {}): ITableProps => {
        return {
            height: 200,
            environment: 'dashboards',
            dataSource: {
                getData: () => Promise.resolve({}),
                getAfm: () => ({}),
                getFingerprint: () => ('{}')
            },
            metadataSource: {
                getVisualizationMetadata: () => Promise.resolve({
                    metadata: {},
                    measuresMap: {}
                } as VisualizationObject.IVisualizationMetadataResult),
                getFingerprint: () => '{}'
            },
            locale: 'en-US',
            ...customProps
        } as ITableProps;
    };

    beforeEach(() => {
        initTableDataLoading.mockClear();
    });

    it('should call two times initDataLoading when fingerprint changes', (done) => {
        const onError = jest.fn();
        const props = createProps({
            dataSource: {
                getData: () => Promise.resolve({}),
                getAfm: () => ({}),
                getFingerprint: () => '{}'
            }
        });
        const wrapper = createComponent(props);
        wrapper.setProps({ dataSource: {
            getData: () => Promise.resolve({ foo: 'bar' }),
            getAfm: () => ({}),
            getFingerprint: () => 'differentprint'
        }});

        postpone(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(initTableDataLoading).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledTimes(0);
            done();
        });
    });

    it('should call initDataLoading when sorting changed', (done) => {
        const props = createProps({
            transformation: {}
        });
        const wrapper = createComponent(props);

        const newProps = createProps({
            visualizationProperties: { sorting: 'abc' },
            transformation: {}
        });
        wrapper.setProps(newProps);

        postpone(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(initTableDataLoading).toHaveBeenCalledTimes(2);
            expect(initTableDataLoading).toHaveBeenCalledWith(
                newProps.dataSource,
                newProps.metadataSource,
                newProps.transformation,
                newProps.visualizationProperties.sorting
            );
            done();
        });
    });

    it('should not call initDataLoading second time', (done) => {
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
        wrapper.setProps({ dataSource: {
            getData: () => Promise.resolve({}),
            getAfm: () => ({}),
            getFingerprint: () => '{}'
        }});

        postpone(() => {
            expect(wrapper.find('.gdc-indigo-responsive-table')).toBeDefined();
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(initTableDataLoading).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith({ status: ErrorStates.OK });
            done();
        });
    });

    it('should render responsive table', (done) => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            environment: 'dashboards'
        });
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find('.gdc-indigo-responsive-table')).toBeDefined();
            expect(wrapper.find(TableTransformation).length).toBe(1);
            expect(wrapper.find(TableTransformation).prop('tableRenderer')).toBeDefined();
            expect(initTableDataLoading).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith({ status: ErrorStates.OK });
            done();
        });
    });

    it('should not render responsive table when result is not available', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            wrapper.setState({ result: null }, () => {
                expect(wrapper.find(TableTransformation).length).toBe(0);
            });
        });
    });

    it('should not render responsive table when table is still loading', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            wrapper.setState({ isLoading: true }, () => {
                expect(wrapper.find(TableTransformation).length).toBe(0);
            });
        });
    });

    it('should not render responsive table when error is set', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find(TableTransformation).length).toBe(1);
            wrapper.setState({ error: ErrorStates.UNKNOWN_ERROR }, () => {
                expect(wrapper.find(TableTransformation).length).toBe(0);
            });
        });
    });

    it('should call onError with DATA_TOO_LARGE', (done) => {
        const onError = jest.fn();
        const props = createProps({
            onError
        });
        initTableDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find(TableTransformation).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({ status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE });
            done();
        });
    });

    it('should call pushData with execution result', (done) => {
        const pushData = jest.fn();
        const props = createProps({
            pushData
        });
        const resultMock = {
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

        postpone(() => {
            expect(pushData).toHaveBeenCalledWith({ executionResult: resultMock.result });
            done();
        });
    });

    it('should trigger `onLoadingChanged`', (done) => {
        const loadingHandler = jest.fn();

        const props = createProps({
            onLoadingChanged: loadingHandler
        });

        createComponent(props);

        postpone(() => {
            expect(loadingHandler).toHaveBeenCalled();
            done();
        });
    });
});
