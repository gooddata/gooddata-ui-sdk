jest.mock('gooddata');

import { test } from '@gooddata/js-utils';
import * as React from 'react';
import { mount } from 'enzyme';
import { Afm } from '@gooddata/data-layer';

import {
    Table,
    BaseChart
} from '../../tests/mocks';

jest.mock('../../core/Table', () => ({
    Table
}));
jest.mock('../../core/base/BaseChart', () => ({
    BaseChart
}));

import { Visualization } from '../Visualization';
import { ErrorStates } from '../../../constants/errorStates';

const { postpone } = test;
const projectId = 'myproject';
const CHART_URI = `/gdc/md/${projectId}/obj/1`;
const TABLE_URI = `/gdc/md/${projectId}/obj/2`;

const SLOW = 100;
const FAST = 10;

function getResponse(response: string, delay: number): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(response), delay);
    });
}

function uriResolver(_projectId: string, _uri: string, identifier: string): Promise<string> {
    if (identifier === 'table') {
        return getResponse(TABLE_URI, FAST);
    }

    if (identifier === 'chart') {
        return getResponse(CHART_URI, SLOW);
    }

    return Promise.reject('Unknown identifier');
}

describe('Visualization', () => {
    it('should render chart', (done) => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={CHART_URI}
            />
        );

        postpone(() => {
            expect(wrapper.find(BaseChart).length).toBe(1);
            done();
        });
    });

    it('should render table', (done) => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={TABLE_URI}
            />
        );

        postpone(() => {
            expect(wrapper.find(Table).length).toBe(1);
            done();
        });
    });

    it('should trigger error in case of given uri is not valid', (done) => {
        const errorHandler = (value) => {
            expect(value).toEqual(ErrorStates.NOT_FOUND);
            done();
        };

        mount(
            <Visualization
                projectId={projectId}
                uri={'/invalid/url'}
                onError={errorHandler}
            />
        );
    });

    it('should replace date filter, if it has same id', (done) => {
        const visFilters: Afm.IDateFilter[] = [
            {
                id: '/gdc/md/myproject/obj/921',
                intervalType: 'relative',
                type: 'date',
                between: [-51, 0],
                granularity: 'date'
            }
        ];

        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={CHART_URI}
                filters={visFilters}
            />
        );

        postpone(() => {
            expect(wrapper.node.dataSource.afm.filters).toHaveLength(1);
            expect(wrapper.node.dataSource.afm.filters[0]).toEqual(visFilters[0]);
            done();
        });
    });

    it('should add date filter, if it has different id', (done) => {
        const visFilters = [
            {
                id: '/gdc/md/myproject/obj/922',
                type: 'date',
                between: [-51, 0],
                granularity: 'date',
                intervalType: 'relative'
            }
        ] as Afm.IDateFilter[];

        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={CHART_URI}
                filters={visFilters}
            />
        );

        postpone(() => {
            expect(wrapper.node.dataSource.afm.filters).toHaveLength(2);
            expect(wrapper.node.dataSource.afm.filters[1]).toEqual(visFilters[0]);
            done();
        });
    });

    it('should add attribute filter', (done) => {
        const visFilters: Afm.IPositiveAttributeFilter[] = [
            {
                id: '/gdc/md/myproject/obj/925',
                type: 'attribute',
                in: ['11', '22', '33']
            }
        ];

        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={CHART_URI}
                filters={visFilters}
            />
        );

        postpone(() => {
            expect(wrapper.node.dataSource.afm.filters).toHaveLength(2);
            expect(wrapper.node.dataSource.afm.filters[0]).toEqual(visFilters[0]);
            done();
        });
    });

    it('should handle slow requests', (done) => {
        // Response from first request comes back later that from the second one
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={'chart'}
                uriResolver={uriResolver}
            />
        );

        wrapper.setProps({ identifier: 'table' });

        postpone(() => {
            expect(wrapper.find(Table).length).toBe(1);
            done();
        }, 300);
    });

    it('should not re-render with same props', (done) => {
        const spy = jest.spyOn(Visualization.prototype, 'render');
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={CHART_URI}
                filters={[]}
            />
        );

        wrapper.setProps({
            projectId,
            uri: CHART_URI,
            filters: []
        });

        postpone(() => {
            // initial render without datasources & with created datasources
            expect(spy).toHaveBeenCalledTimes(2);

            spy.mockRestore();
            done();
        }, 300);
    });

    it('should handle set state on unmounted component', (done) => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={'chart'}
                uriResolver={uriResolver}
            />
        );

        // Would throw an error if not handled properly
        wrapper.unmount();

        postpone(done, 300);
    });
});
