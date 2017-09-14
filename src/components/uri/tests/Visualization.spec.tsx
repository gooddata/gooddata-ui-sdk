jest.mock('gooddata');

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
import { delay } from '../../tests/utils';

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

// tslint:disable-next-line:variable-name
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
    it('should render chart', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={CHART_URI}
            />
        );

        return delay().then(() => {
            expect(wrapper.find(BaseChart).length).toBe(1);
        });
    });

    it('should render table', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={TABLE_URI}
            />
        );

        return delay().then(() => {
            expect(wrapper.find(Table).length).toBe(1);
        });
    });

    it('should trigger error in case of given uri is not valid', (done) => {
        const errorHandler = (value: string) => {
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

    it('should replace date filter, if it has same id', () => {
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

        return delay().then(() => {
            const node: any = wrapper.getNode();
            expect(node.dataSource.afm.filters).toHaveLength(1);
            expect(node.dataSource.afm.filters[0]).toEqual(visFilters[0]);
        });
    });

    it('should add date filter, if it has different id', () => {
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

        return delay().then(() => {
            const node: any = wrapper.getNode();
            expect(node.dataSource.afm.filters).toHaveLength(2);
            expect(node.dataSource.afm.filters[1]).toEqual(visFilters[0]);
        });
    });

    it('should add attribute filter', () => {
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

        return delay().then(() => {
            const node: any = wrapper.getNode();
            expect(node.dataSource.afm.filters).toHaveLength(2);
            expect(node.dataSource.afm.filters[0]).toEqual(visFilters[0]);
        });
    });

    it('should handle slow requests', () => {
        // Response from first request comes back later that from the second one
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={'chart'}
                uriResolver={uriResolver}
            />
        );

        wrapper.setProps({ identifier: 'table' });

        return delay(300).then(() => {
            expect(wrapper.find(Table).length).toBe(1);
        });
    });

    it('should not re-render with same props', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={CHART_URI}
                filters={[]}
            />
        );
        const spy = jest.spyOn(wrapper.instance(), 'render');

        wrapper.setProps({
            projectId,
            uri: CHART_URI,
            filters: []
        });

        return delay(300).then(() => {
            // initial render without datasources is called during mount
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockRestore();
        });
    });

    it('should handle set state on unmounted component', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={'chart'}
                uriResolver={uriResolver}
            />
        );

        const spy = jest.spyOn(wrapper.instance(), 'setState');

        // Would throw an error if not handled properly
        wrapper.unmount();
        return delay(300).then(() => {
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
