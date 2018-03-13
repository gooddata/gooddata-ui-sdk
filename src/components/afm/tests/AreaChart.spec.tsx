import * as React from 'react';
import { mount } from 'enzyme';
import { delay } from '../../tests/utils';

import { AreaChart } from '../AreaChart';
import { AreaChart as CoreAreaChart } from '../../core/AreaChart';
import { dummyExecuteAfmAdapterFactory } from './utils/DummyExecuteAfmAdapter';

describe('Area chart', () => {
    const afmWithAttr = {
        attributes: [
            {
                localIdentifier: 'area1',
                displayForm: { uri: 'abc' }
            }
        ]
    };

    it('should provide default resultSpec to core AreaChart with attributes', () => {
        const wrapper = mount((
            <AreaChart
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return delay().then(() => {
            wrapper.update();

            const dimensions = wrapper.find(CoreAreaChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([ { itemIdentifiers: ['measureGroup'] }, { itemIdentifiers: ['area1'] } ]);
        });
    });
});
