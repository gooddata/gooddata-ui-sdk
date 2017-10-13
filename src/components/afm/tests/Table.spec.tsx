import * as React from 'react';
import { mount } from 'enzyme';
import { delay } from '../../tests/utils';
import { Table } from '../Table';
import { Table as CoreTable } from '../../core/Table';
import { dummyExecuteAfmAdapterFactory } from './utils/DummyExecuteAfmAdapter';
import { executionRequest } from './utils/dummyFixture';

describe('Table', () => {

    it('should provide default resultSpec to core Table with attributes', () => {
        const wrapper = mount((
            <Table
                projectId="prId"
                afm={executionRequest.execution.afm}
                resultSpec={executionRequest.execution.resultSpec}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return delay().then(() => {
            const dimensions = wrapper.find(CoreTable).props().resultSpec.dimensions;
            expect(dimensions).toEqual([
                { itemIdentifiers: ['departmentAttribute'] },
                { itemIdentifiers: ['measureGroup'] }
            ]);
        });
    });

});
