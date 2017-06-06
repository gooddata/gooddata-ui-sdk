jest.mock('gooddata');

import * as React from 'react';
import { mount } from 'enzyme';
import { Afm } from '@gooddata/data-layer';
import LineFamilyChartTransformation from '@gooddata/indigo-visualizations/lib/Chart/LineFamilyChartTransformation';
import PieChartTransformation from '@gooddata/indigo-visualizations/lib/Chart/PieChartTransformation';

import { BaseChart, IChartProps } from '../BaseChart';
import {
    DATA_TOO_LARGE_DISPLAY,
    DATA_TOO_LARGE_TO_COMPUTE,
    NEGATIVE_VALUES,
    NO_DATA
} from '../../../constants/errorStates';

describe('BaseChart', () => {
    function createComponent(props: IChartProps) {
        return mount(<BaseChart {...props} />);
    }

    function createProps(customProps = {}) {
        return {
            projectId: 'myprojectid',
            transformation: {},
            type: 'line',
            config: {
                legend: {
                    enabled: false
                }
            },
            ...customProps
        } as IChartProps;
    }

    it('should render line chart', (done) => {
        const afm: Afm.IAfm = {
            measures: [
                {
                    id: '1',
                    definition: {
                        baseObject: {
                            id: '/gd/md/m1'
                        }
                    }
                }
            ]
        };

        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            afm,
            onError,
            onLoadingChanged
        });
        const wrapper = createComponent(props);

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);
        setTimeout(() => {
            try {
                expect(onLoadingChanged).toHaveBeenCalledTimes(2);
                expect(wrapper.find('.gdc-line-chart')).toBeDefined();
                expect(wrapper.find(LineFamilyChartTransformation).length).toBe(1);
                expect(onError).toHaveBeenCalledTimes(0);
                done();
            } catch (error) {
                console.error(error);
            }
        }, 1);
    });

    it('should call onError on 413 entity too large and render nothing', (done) => {
        const afm: Afm.IAfm = {
            measures: [
                {
                    id: 'too-large-measure',
                    definition: {
                        baseObject: {
                            id: '/gd/md/m1'
                        }
                    }
                }
            ]
        };

        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            afm,
            onError,
            onLoadingChanged
        });
        const wrapper = createComponent(props);

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);
        setTimeout(() => {
            try {
                expect(onLoadingChanged).toHaveBeenCalledTimes(2);
                expect(wrapper.find('.gdc-line-chart').length).toEqual(0);
                expect(wrapper.find(LineFamilyChartTransformation).length).toBe(0);
                expect(onError).toHaveBeenCalledTimes(1);
                expect(onError).toHaveBeenCalledWith({
                    status: DATA_TOO_LARGE_TO_COMPUTE,
                    error: {
                        response: {
                            status: 413
                        }
                    }
                });
                done();
            } catch (error) {
                console.error(error);
            }
        }, 1);
    });

    it('should call onError callback when data too large and render nothing', (done) => {
        const afm: Afm.IAfm = {
            measures: [
                {
                    id: '1',
                    definition: {
                        baseObject: {
                            id: '/gd/md/m1'
                        }
                    }
                }
            ]
        };

        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            afm,
            onError,
            onLoadingChanged,
            config: {
                legend: {
                    enabled: false
                },
                limits: {
                    series: 0,
                    categories: 0
                }
            }
        });
        const wrapper = createComponent(props);

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);
        setTimeout(() => {
            try {
                expect(onLoadingChanged).toHaveBeenCalledTimes(2);
                expect(wrapper.find('.gdc-line-chart').length).toEqual(0);
                expect(wrapper.find(LineFamilyChartTransformation).length).toBe(0);
                expect(onError).toHaveBeenCalledTimes(1);
                expect(onError).toHaveBeenCalledWith({ status: DATA_TOO_LARGE_DISPLAY });
                done();
            } catch (error) {
                console.error(error);
            }
        }, 1);
    });

    it('should call onError callback if pie chart limit is exceeded and render nothing', (done) => {
        const afm: Afm.IAfm = {
            measures: [
                {
                    id: 'too-large-for-pie',
                    definition: {
                        baseObject: {
                            id: '/gd/md/m1'
                        }
                    }
                }
            ]
        };

        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            afm,
            onError,
            onLoadingChanged,
            config: {
                legend: {
                    enabled: false
                }
            },
            type: 'pie'
        });
        const wrapper = createComponent(props);

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);
        setTimeout(() => {
            try {
                expect(onLoadingChanged).toHaveBeenCalledTimes(2);
                expect(wrapper.find('.gdc-pie-chart').length).toEqual(0);
                expect(wrapper.find(PieChartTransformation).length).toBe(0);
                expect(onError).toHaveBeenCalledTimes(1);
                expect(onError).toHaveBeenCalledWith({ status: DATA_TOO_LARGE_DISPLAY });
                done();
            } catch (error) {
                console.error(error);
            }
        }, 1);
    });

    it('should call onError callback for negative data in pie chart and render nothing', (done) => {
        const afm: Afm.IAfm = {
            measures: [
                {
                    id: 'negative-values-measure',
                    definition: {
                        baseObject: {
                            id: '/gd/md/m1'
                        }
                    }
                }
            ]
        };

        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            afm,
            onError,
            onLoadingChanged,
            config: {
                legend: {
                    enabled: false
                }
            },
            type: 'pie'
        });
        const wrapper = createComponent(props);

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);
        setTimeout(() => {
            try {
                expect(onLoadingChanged).toHaveBeenCalledTimes(2);
                expect(wrapper.find('.gdc-pie-chart').length).toEqual(0);
                expect(wrapper.find(PieChartTransformation).length).toBe(0);
                expect(onError).toHaveBeenCalledTimes(1);
                expect(onError).toHaveBeenCalledWith({ status: NEGATIVE_VALUES });
                done();
            } catch (error) {
                console.error(error);
            }
        }, 1);
    });

    it('should call onError callback for empty data result and render nothing', (done) => {
        const afm: Afm.IAfm = {
            measures: [
                {
                    id: 'empty-result',
                    definition: {
                        baseObject: {
                            id: '/gd/md/m1'
                        }
                    }
                }
            ]
        };

        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            afm,
            onError,
            onLoadingChanged,
            config: {
                legend: {
                    enabled: false
                }
            }
        });
        const wrapper = createComponent(props);

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);
        setTimeout(() => {
            try {
                expect(onLoadingChanged).toHaveBeenCalledTimes(2);
                expect(wrapper.find('.gdc-line-chart').length).toEqual(0);
                expect(wrapper.find(LineFamilyChartTransformation).length).toBe(0);
                expect(onError).toHaveBeenCalledTimes(1);
                expect(onError).toHaveBeenCalledWith({ status: NO_DATA });
                done();
            } catch (error) {
                console.error(error);
            }
        }, 1);
    });
});
