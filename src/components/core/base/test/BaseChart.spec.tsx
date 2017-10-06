import * as React from 'react';
import { mount } from 'enzyme';
import { ISimpleExecutorResult } from 'gooddata';
import { Afm, VisualizationObject, DataSource } from '@gooddata/data-layer';
import { delay } from '../../../tests/utils';

import {
    initChartDataLoading,
    Visualization
} from '../../../tests/mocks';
jest.mock('../../../../helpers/load', () => ({
    initChartDataLoading
}));
jest.mock('@gooddata/indigo-visualizations', () => ({
    Visualization
}));

import { BaseChart, IBaseChartProps } from '../BaseChart';
import { ErrorStates } from '../../../../constants/errorStates';
import { VisualizationTypes } from '../../../../constants/visualizationTypes';

describe('BaseChart', () => {
    function createComponent(props: IBaseChartProps) {
        return mount(
            <BaseChart {...props} />
        );
    }

    const afm: Afm.IAfm = { measures: [] };
    const dataSource: DataSource.IDataSource<ISimpleExecutorResult> = {
        getData: (): Promise<ISimpleExecutorResult> => Promise.resolve({}),
        getAfm: jest.fn().mockReturnValue(afm),
        getFingerprint: jest.fn().mockReturnValue(JSON.stringify(afm))
    };

    const createProps = (customProps = {}) => {
        const props: IBaseChartProps = {
            height: 200,
            dataSource,
            metadataSource: {
                getVisualizationMetadata: () => Promise.resolve({
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
                }),
                getFingerprint: () => ''
            },
            locale: 'en-US',
            type: VisualizationTypes.LINE,
            ...customProps
        };
        return props;
    };

    beforeEach(() => {
        initChartDataLoading.mockClear();
    });

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
        expect(initChartDataLoading).toHaveBeenCalledTimes(1);

        return delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith({ status: ErrorStates.OK });
            expect(initChartDataLoading).toHaveBeenCalledTimes(1);
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
        const props = createProps({
            onError
        });
        initChartDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
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

    it('should call onError with UNKNOWN_ERROR', () => {
        const onError = jest.fn();
        const props = createProps({
            onError
        });
        initChartDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.UNKNOWN_ERROR));
        const wrapper = createComponent(props);

        return delay().then(() => {
            expect(wrapper.find(Visualization).length).toBe(0);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenLastCalledWith({
                status: ErrorStates.UNKNOWN_ERROR,
                options: expect.any(Object)
            });
        });
    });

    it('should call onError with NO_DATA', () => {
        const onError = jest.fn();
        const props = createProps({
            onError
        });
        initChartDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.NO_DATA));
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
        initChartDataLoading.mockImplementationOnce(() => Promise.reject(ErrorStates.NO_DATA));
        createComponent(createProps());

        return delay().then(() => {
            expect(global.console.error).toHaveBeenCalledWith({
                status: ErrorStates.NO_DATA,
                options: expect.any(Object)
            });
            global.console.error = origin;
        });
    });

    it('should reload data when dataSource changed', () => {
        const wrapper = createComponent(createProps());
        wrapper.setProps({
            dataSource: {
                getFingerprint: jest.fn().mockReturnValue('asdf'),
                getData: () => Promise.resolve(),
                getAfm: jest.fn().mockReturnValue(afm)
            }
        });
        return delay().then(() => {
            expect(initChartDataLoading).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger initDataLoading on props change', (done) => {
        const wrapper = createComponent(createProps());
        const node: any = wrapper.getNode();
        node.initDataLoading = jest.fn();

        wrapper.setProps({
            dataSource: {
                getFingerprint: () => 'asdf'
            }
        }, () => {
            expect(node.initDataLoading).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should return config for dashboard', () => {
        const props = createProps({ environment: 'dashboards' });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const config = wrapper.find(Visualization).prop('config');
            expect(config).toEqual({
                type: VisualizationTypes.LINE,
                buckets: undefined,
                legend: {
                    enabled: true,
                    position: 'right',
                    responsive: true
                }
            });
        });
    });

    it('should return config for AD', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return delay().then(() => {
            const config = wrapper.find(Visualization).prop('config');
            expect(config).toEqual({
                type: VisualizationTypes.LINE,
                buckets: undefined,
                legend: {
                    enabled: true,
                    position: 'top'
                }
            });
        });
    });

    it('should detect stacked by category and move legend to right', () => {
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

        return delay().then(() => {
            const config = wrapper.find(Visualization).prop('config');
            expect(config).toEqual({
                type: VisualizationTypes.LINE,
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
        });
    });

    it('should detect segment by category and move legend to right', () => {
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

        return delay().then(() => {
            const config = wrapper.find(Visualization).prop('config');
            expect(config).toEqual({
                type: VisualizationTypes.LINE,
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
        });
    });

    it('should set new metadata when new metadtaSource came', () => {
        const wrapper = createComponent(createProps());
        const getVisualizationMetadata = jest.fn().mockReturnValue(
            Promise.resolve({ metadata: 'meta' })
        );

        wrapper.setProps({
            metadataSource: {
                getFingerprint: jest.fn().mockReturnValue('asdf'),
                getVisualizationMetadata
            }
        });
        return delay().then(() => {
            expect(getVisualizationMetadata).toHaveBeenCalledTimes(1);
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
