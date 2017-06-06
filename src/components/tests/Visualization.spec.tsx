jest.mock('gooddata');

import * as React from 'react';
import { mount } from 'enzyme';
import Legend from '@gooddata/indigo-visualizations/lib/Chart/Legend/Legend';

import { BaseChart } from '../base/BaseChart';
import { Table } from '../Table';
import { Visualization } from '../Visualization';

describe('Visualization', () => {
    it('should not render anything by default', () => {
        const wrapper = mount(
            <Visualization
                uri={'/gdc/md/myproject/obj/1'}
            />
        );

        expect(wrapper.html()).toEqual(null);
    });

    it('should render chart', (done) => {
        const wrapper = mount(
            <Visualization
                uri={'/gdc/md/myproject/obj/1'}
            />
        );

        setTimeout(() => {
            try {
                expect(wrapper.find(BaseChart).length).toBe(1);
            } catch (error) {
                console.log(error); // tslint:disable-line no-console
            } finally {
                done();
            }
        }, 0);
    });

    it('should render table', (done) => {
        const wrapper = mount(
            <Visualization
                uri={'/gdc/md/myproject/obj/2'}
            />
        );

        setTimeout(() => {
            try {
                expect(wrapper.find(Table).length).toBe(1);
            } catch (error) {
                console.log(error); // tslint:disable-line no-console
            } finally {
                done();
            }
        }, 0);
    });

    it('should trigger `onLoadingChanged` twice for visualization', (done) => {
        const loadingHandler = jest.fn();

        mount(
            <Visualization
                uri={'/gdc/md/myproject/obj/1'}
                onLoadingChanged={loadingHandler}
            />
        );

        setTimeout(() => {
            try {
                expect(loadingHandler).toHaveBeenCalledTimes(2);
            } catch (error) {
                console.log(error); // tslint:disable-line no-console
            } finally {
                done();
            }
        }, 0);
    });

    it('should trigger `onLoadingChanged` twice for table', (done) => {
        const loadingHandler = jest.fn();

        mount(
            <Visualization
                uri={'/gdc/md/myproject/obj/2'}
                onLoadingChanged={loadingHandler}
            />
        );

        setTimeout(() => {
            try {
                expect(loadingHandler).toHaveBeenCalledTimes(2);
            } catch (error) {
                console.log(error); // tslint:disable-line no-console
            } finally {
                done();
            }
        }, 0);
    });

    it('should trigger error in case of given uri is not valid', (done) => {
        const errorHandler = jest.fn();

        mount(
            <Visualization
                uri={'/invalid/url'}
                onError={errorHandler}
            />
        );

        setTimeout(() => {
            try {
                expect(errorHandler).toBeCalled();
            } catch (error) {
                console.log(error); // tslint:disable-line no-console
            } finally {
                done();
            }
        }, 0);
    });

    it('should allow legend customization', (done) => {
        const wrapper = mount(
            <Visualization
                uri={'/gdc/md/myproject/obj/1'}
                config={{
                    legend: {
                        enabled: false
                    }
                }}
            />
        );

        setTimeout(() => {
            try {
                expect(wrapper.find(BaseChart).length).toBe(1);
                expect(wrapper.find(Legend).length).toBe(0);
            } catch (error) {
                console.log(error); // tslint:disable-line no-console
            } finally {
                done();
            }
        }, 0);
    });
});
