import * as React from 'react';
import { mount } from 'enzyme';
import {
    Table,
    BaseChart
} from '../../tests/mocks';
import { charts } from '../../../../__mocks__/fixtures';

import { VisualizationObject } from '@gooddata/data-layer';
import { Visualization } from '../Visualization';
import { ErrorStates } from '../../../constants/errorStates';
import { delay } from '../../tests/utils';
import { SortableTable } from '../../core/SortableTable';

const projectId = 'myproject';
const CHART_URI = `/gdc/md/${projectId}/obj/1`;
const TABLE_URI = `/gdc/md/${projectId}/obj/2`;
const CHART_IDENTIFIER = 'chart';
const TABLE_IDENTIFIER = 'table';

const SLOW = 20;
const FAST = 5;

function getResponse(response: string, delay: number): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(response), delay);
    });
}

function fetchVisObject(uri: string): Promise<VisualizationObject.IVisualizationObject> {
    const visObj = charts.find(chart => chart.visualization.meta.uri === uri);

    if (!visObj) {
        throw new Error(`Unknown uri ${uri}`);
    }

    return Promise.resolve(visObj.visualization);
}

// tslint:disable-next-line:variable-name
function uriResolver(_projectId: string, _uri: string, identifier: string): Promise<string> {
    if (identifier === TABLE_IDENTIFIER) {
        return getResponse(TABLE_URI, FAST);
    }

    if (identifier === CHART_IDENTIFIER) {
        return getResponse(CHART_URI, SLOW);
    }

    return Promise.reject('Unknown identifier');
}

describe('Visualization', () => {
    it('should render chart', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={CHART_IDENTIFIER}
                fetchVisObject={fetchVisObject}
                uriResolver={uriResolver}
                BaseChartComponent={BaseChart}
            />
        );

        return delay(SLOW + 1).then(() => {
            expect(wrapper.find(BaseChart).length).toBe(1);
        });
    });

    it('should render table', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={TABLE_IDENTIFIER}
                fetchVisObject={fetchVisObject}
                uriResolver={uriResolver}
            />
        );

        return delay(SLOW).then(() => {
            expect(wrapper.find(SortableTable).length).toBe(1);
        });
    });

    it('should trigger error in case of given uri is not valid', (done) => {
        const errorHandler = (value: { status: string }) => {
            expect(value.status).toEqual(ErrorStates.NOT_FOUND);
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

    it('should handle slow requests', () => {
        // Response from first request comes back later that from the second one
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={CHART_IDENTIFIER}
                uriResolver={uriResolver}
                fetchVisObject={fetchVisObject}
                BaseChartComponent={BaseChart}
                TableComponent={Table}
            />
        );

        wrapper.setProps({ identifier: TABLE_IDENTIFIER });

        return delay(SLOW + 1).then(() => {
            expect(wrapper.find(Table).length).toBe(1);
        });
    });

    it('should not re-render with same props', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                uri={CHART_URI}
                filters={[]}
                uriResolver={uriResolver}
                fetchVisObject={fetchVisObject}
                BaseChartComponent={BaseChart}
                TableComponent={Table}
            />
        );
        const spy = jest.spyOn(wrapper.instance(), 'render');

        wrapper.setProps({
            projectId,
            uri: CHART_URI,
            filters: []
        });

        return delay(SLOW + 1).then(() => {
            // initial render without datasource is called during mount
            expect(spy).toHaveBeenCalledTimes(0);
            spy.mockRestore();
        });
    });

    it('should handle set state on unmounted component', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={TABLE_IDENTIFIER}
                uriResolver={uriResolver}
                fetchVisObject={fetchVisObject}
                BaseChartComponent={BaseChart}
                TableComponent={Table}
            />
        );

        const spy = jest.spyOn(wrapper.instance(), 'setState');

        // Would throw an error if not handled properly
        wrapper.unmount();
        return delay(FAST + 1).then(() => {
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
