import * as React from 'react';
import { mount } from 'enzyme';
import { VisualizationObject } from '@gooddata/data-layer';

import {
    initChartDataLoading,
    Visualization
} from '../../tests/mocks';
jest.mock('../../../helpers/load', () => ({
    initChartDataLoading
}));
jest.mock('@gooddata/indigo-visualizations', () => ({
    Visualization
}));

import { BaseChart, IChartProps } from '../BaseChart';
import { ErrorStates } from '../../../constants/errorStates';
import { postpone } from '../../../helpers/test_helpers';

describe('BaseChart', () => {
    function createComponent(props: IChartProps) {
        return mount(
            <BaseChart {...props} />
        );
    }

    const afm = { measures: [] };
    const createProps = (customProps = {}) => {
        return {
            height: 200,
            dataSource: {
                getData: () => Promise.resolve(),
                getAfm: jest.fn().mockReturnValue(afm),
                getFingerprint: jest.fn().mockReturnValue(JSON.stringify(afm))
            },
            metadataSource: {
                getVisualizationMetadata: () => Promise.resolve({
                    metadata: {
                        meta: {},
                        content: {
                            type: 'column' as VisualizationObject.VisualizationType,
                            buckets: {
                                measures: [],
                                categories: [],
                                filters: []
                            }
                        }
                    },
                    measuresMap: {}
                })
            },
            locale: 'en-US',
            type: 'line',
            ...customProps
        } as IChartProps;
    };

    beforeEach(() => {
        initChartDataLoading.mockClear();
    });

    it('should render pie chart', (done) => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            type: 'pie'
        });
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find('.gdc-line-chart')).toBeDefined();
            expect(wrapper.find(Visualization).length).toBe(1);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith({ status: ErrorStates.OK });
            expect(initChartDataLoading).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should render line chart', (done) => {
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            onError,
            onLoadingChanged
        });
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find('.gdc-line-chart')).toBeDefined();
            expect(wrapper.find(Visualization).length).toBe(1);
            done();
        });
    });

    it('should correctly set loading state and call initDataLoading once', (done) => {
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            onError,
            onLoadingChanged,
            type: 'pie'
        });
        createComponent(props);

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);
        expect(initChartDataLoading).toHaveBeenCalledTimes(1);

        postpone(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith({ status: ErrorStates.OK });
            expect(initChartDataLoading).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should call onError with DATA_TOO_LARGE_TO_COMPUTE', (done) => {
        const onError = jest.fn();
        const props = createProps({
            onError
        });
        initChartDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({ status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE });
            done();
        });
    });

    it('should call onError with UNKNOWN_ERROR', (done) => {
        const onError = jest.fn();
        const props = createProps({
            onError
        });
        initChartDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.UNKNOWN_ERROR));
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({ status: ErrorStates.UNKNOWN_ERROR });
            done();
        });
    });


    it('should call onError with NO_DATA', (done) => {
        const onError = jest.fn();
        const props = createProps({
            onError
        });
        initChartDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.NO_DATA));
        const wrapper = createComponent(props);

        postpone(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({ status: ErrorStates.NO_DATA });
            done();
        });
    });

    it('should use default onError when is not provided', (done) => {
        const origin = global.console.error;
        global.console.error = jest.fn();
        initChartDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.NO_DATA));
        createComponent(createProps());

        postpone(() => {
            expect(global.console.error).toHaveBeenCalledWith({ status: ErrorStates.NO_DATA });
            global.console.error = origin;
            done();
        });
    });

    it('should reload data when dataSource changed', (done) => {
        const wrapper = createComponent(createProps());
        wrapper.setProps({
            dataSource: {
                getFingerprint: jest.fn().mockReturnValue('asdf'),
                getData: () => Promise.resolve(),
                getAfm: jest.fn().mockReturnValue(afm)
            }
        }, () => {
            postpone(() => {
                expect(initChartDataLoading).toHaveBeenCalledTimes(2);
                done();
            });
        });
    });

    it('should cancel promise when data loading with new dataSources is started', (done) => {
        const wrapper = createComponent(createProps());
        expect(initChartDataLoading).toHaveBeenCalledTimes(1);
        wrapper.node.dataCancellable.cancel = jest.fn();
        // turn off this function for call from componentWillReceiveProps,
        // otherwise it would overwrite promise
        wrapper.node.initDataLoading = jest.fn();

        wrapper.setProps({
            dataSource: {
                getFingerprint: () => 'asdf'
            }
        }, () => {
            expect(wrapper.node.dataCancellable.cancel).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should return config for dashboard', (done) => {
        const props = createProps({ environment: 'dashboards' });
        const wrapper = createComponent(props);

        postpone(() => {
            const config = wrapper.find(Visualization).prop('config');
            expect(config).toEqual({
                type: 'line',
                buckets: undefined,
                legend: {
                    enabled: true,
                    position: 'right',
                    responsive: true
                }
            });
            done();
        });
    });

    it('should return config for AD', (done) => {
        const props = createProps();
        const wrapper = createComponent(props);

        postpone(() => {
            const config = wrapper.find(Visualization).prop('config');
            expect(config).toEqual({
                type: 'line',
                buckets: undefined,
                legend: {
                    enabled: true,
                    position: 'top'
                }
            });
            done();
        });
    });

    it('should detect stacked by category and move legend to right', (done) => {
        const props = createProps();

        const p = Promise.resolve({
            result: {},
            metadata: {
                content: {
                    buckets: {
                        categories: [{
                            category: {
                                collection: 'stack'
                            }
                        }]
                    }
                }
            }
        });
        initChartDataLoading.mockImplementationOnce(() => {
            return p;
        });

        const wrapper = createComponent(props);

        postpone(() => {
            const config = wrapper.find(Visualization).prop('config');
            expect(config).toEqual({
                type: 'line',
                buckets: {
                    categories: [{
                        category: {
                            collection: 'stack'
                        }
                    }]
                },
                legend: {
                    enabled: true,
                    position: 'right'
                }
            });
            done();
        });
    });

    it('should detect segment by category and move legend to right', (done) => {
        const props = createProps();

        const p = Promise.resolve({
            result: {},
            metadata: {
                content: {
                    buckets: {
                        categories: [{
                            category: {
                                collection: 'segment'
                            }
                        }]
                    }
                }
            }
        });
        initChartDataLoading.mockImplementationOnce(() => {
            return p;
        });

        const wrapper = createComponent(props);

        postpone(() => {
            const config = wrapper.find(Visualization).prop('config');
            expect(config).toEqual({
                type: 'line',
                buckets: {
                    categories: [{
                        category: {
                            collection: 'segment'
                        }
                    }]
                },
                legend: {
                    enabled: true,
                    position: 'right'
                }
            });
            done();
        });
    });
});
