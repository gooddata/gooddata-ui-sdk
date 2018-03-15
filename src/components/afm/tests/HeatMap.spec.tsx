import * as React from 'react';
import { mount } from 'enzyme';
import { testUtils } from '@gooddata/js-utils';

import { HeatMap } from '../HeatMap';
import { HeatMap as CoreHeatMap } from '../../core/HeatMap';
import { dummyExecuteAfmAdapterFactory } from './utils/DummyExecuteAfmAdapter';

describe('HeatMap', () => {
    const afmWithAttr = {
        attributes: [
            {
                localIdentifier: 'heat',
                displayForm: { uri: 'abc' }
            }
        ]
    };

    it('should provide default resultSpec to core HeatMap with attributes', () => {
        const wrapper = mount((
            <HeatMap
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return testUtils.delay().then(() => {
            wrapper.update();

            const dimensions = wrapper.find(CoreHeatMap).props().resultSpec.dimensions;
            expect(dimensions).toEqual([ { itemIdentifiers: ['measureGroup'] }, { itemIdentifiers: ['heat'] } ]);
        });
    });
});
