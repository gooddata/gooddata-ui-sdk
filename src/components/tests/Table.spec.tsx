jest.mock('gooddata');

import * as React from 'react';
import { mount } from 'enzyme';
import { Afm } from '@gooddata/data-layer';
import TableTransformation from '@gooddata/indigo-visualizations/lib/Table/TableTransformation';

import { Execute } from '../../execution/Execute';
import { IntlWrapper } from '../base/IntlWrapper';
import { Table } from '../Table';

describe('Table', () => {
    const validAfm: Afm.IAfm = {
        measures: [
            {
                id: '1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/1'
                    }
                }
            }
        ],
        attributes: [
            {
                id: '/gdc/md/project/obj/2'
            }
        ]
    };

    function createComponent(props) {
        return mount(<Table {...props} />);
    }

    it('should render table', (done) => {
        const onError = jest.fn();
        const onLoadingChanged = jest.fn();

        const wrapper = createComponent({
            projectId: 'myprojectid',
            afm: validAfm,
            onError,
            onLoadingChanged
        });

        expect(onLoadingChanged.mock.calls[0]).toEqual([{ isLoading: true }]);

        setTimeout(() => {
            try {
                expect(onLoadingChanged.mock.calls[1]).toEqual([{ isLoading: false }]);

                const execute = wrapper.find(Execute);
                expect(execute.length).toBe(1);

                const intlWrapper = execute.find(IntlWrapper);
                expect(intlWrapper.length).toBe(1);

                const tableTransformation = wrapper.find(TableTransformation);
                expect(tableTransformation.length).toBe(1);

                expect(onError).toHaveBeenCalledTimes(0);
                done();
            } catch (error) {
                console.error(error);
            }
        }, 0);
    });

    it('should trigger error in case of given afm is not valid', (done) => {
        const onError = jest.fn();

        const invalidAfm: Afm.IAfm = {
            invalidObjectKey: ''
        };

        createComponent({
            projectId: 'myprojectid',
            afm: invalidAfm,
            onError
        });

        setTimeout(() => {
            try {
                expect(onError).toBeCalled();
            } catch (error) {
                console.log(error); // tslint:disable-line no-console
            } finally {
                done();
            }
        }, 0);
    });

    it('should add sorting into transformation', (done) => {
        const wrapper = createComponent({
            projectId: 'myprojectid',
            afm: validAfm
        });

        setTimeout(() => {
            try {
                const execute = wrapper.find(Execute);
                wrapper.setState({ sorting: { column: 'foo', direction: 'asc' } });
                expect(execute.props().transformation).toHaveProperty('sorting');
                done();
            } catch (error) {
                console.error(error);
            }
        }, 0);
    });

    it('should change state onSortChange', (done) => {
        const wrapper = createComponent({
            projectId: 'myprojectid',
            afm: validAfm
        });

        setTimeout(() => {
            try {
                expect(wrapper.state().sorting).toBe(null);
                wrapper.find('.gd-table-header-title').simulate('click');
                expect(wrapper.state().sorting).toHaveProperty('column');
                expect(wrapper.state().sorting).toHaveProperty('direction');
                done();
            } catch (error) {
                console.error(error);
            }
        }, 0);
    });
});
