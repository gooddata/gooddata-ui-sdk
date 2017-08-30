import * as React from 'react';
import { mount } from 'enzyme';

import {
    VisualizationObject
} from '@gooddata/data-layer';

import {
    initTableDataLoading,
    TableTransformation,
    ResponsiveTable
} from '../tests/mocks';
jest.mock('../../helpers/load', () => ({
    initTableDataLoading
}));
jest.mock('@gooddata/indigo-visualizations', () => ({
    TableTransformation,
    ResponsiveTable
}));

import { Table, ITableProps } from '../Table';
import { ErrorStates } from '../../constants/errorStates';
import { postpone } from '../../helpers/test_helpers';

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
                getFingerprint: () => ''
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
            expect(pushData).toHaveBeenCalledWith({ warnings: [] });
            done();
        });
    });
});
