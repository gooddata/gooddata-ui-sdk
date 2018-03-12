import * as React from 'react';
import { mount } from 'enzyme';
import { delay } from '../../tests/utils';
import { BarChart } from '../BarChart';
import { BarChart as CoreBarChart } from '../../core/BarChart';
import { dummyExecuteAfmAdapterFactory } from './utils/DummyExecuteAfmAdapter';

describe('BarChart', () => {
    const afmWithAttr = {
        attributes: [
            {
                localIdentifier: 'a1',
                displayForm: { uri: 'abc' }
            }
        ]
    };

    it('should provide default resultSpec to core BarChart with attributes', () => {
        const wrapper = mount(
            <BarChart
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />);

        return delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreBarChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([ { itemIdentifiers: ['measureGroup'] }, { itemIdentifiers: ['a1'] } ]);
        });
    });

});
