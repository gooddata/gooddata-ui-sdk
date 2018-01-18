import * as React from 'react';
import { mount } from 'enzyme';
import { delay } from '../../tests/utils';
import { Table } from '../Table';
import { SortableTable } from '../../core/SortableTable';
import { dummyExecuteAfmAdapterFactory } from './utils/DummyExecuteAfmAdapter';
import { executionRequest } from './utils/dummyFixture';
import { executionRequestWithTotals } from './utils/dummyFixtureWithTotals';

describe('Table', () => {

    it('should provide default resultSpec to the core Table with attributes', () => {
        const wrapper = mount((
            <Table
                projectId="prId"
                afm={executionRequest.execution.afm}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return delay().then(() => {
            const dimensions = wrapper.find(SortableTable).props().resultSpec.dimensions;
            expect(dimensions).toEqual([
                { itemIdentifiers: ['departmentAttribute'] },
                { itemIdentifiers: ['measureGroup'] }
            ]);
        });
    });

    it('should provide totals based on resultSpec to the core Table with attributes', () => {
        const wrapper = mount((
            <Table
                projectId="prId"
                afm={executionRequestWithTotals.execution.afm}
                resultSpec={executionRequestWithTotals.execution.resultSpec}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return delay().then(() => {
            const totals = wrapper.find(SortableTable).props().totals;
            expect(totals).toEqual([{
                outputMeasureIndexes: [0, 1], type: 'sum'
            }, {
                outputMeasureIndexes: [0], type: 'avg'
            }]);
        });
    });
});
