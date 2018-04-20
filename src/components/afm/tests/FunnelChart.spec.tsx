// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { mount } from 'enzyme';
import { delay } from '../../tests/utils';
import { FunnelChart } from '../FunnelChart';
import { FunnelChart as CoreFunnelChart } from '../../core/FunnelChart';
import { dummyExecuteAfmAdapterFactory } from './utils/DummyExecuteAfmAdapter';

describe('FunnelChart', () => {
    const afmWithAttr = {
        attributes: [
            {
                localIdentifier: 'a1',
                displayForm: { uri: 'abc' }
            }
        ]
    };

    it('should provide default resultSpec to core FunnelChart', () => {
        const wrapper = mount((
            <FunnelChart
                projectId="prId"
                afm={{}}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreFunnelChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([ { itemIdentifiers: [] }, { itemIdentifiers: ['measureGroup'] } ]);
        });
    });

    it('should provide default resultSpec to core FunnelChart with attributes', () => {
        const wrapper = mount((
            <FunnelChart
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreFunnelChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([ { itemIdentifiers: ['measureGroup'] }, { itemIdentifiers: ['a1'] } ]);
        });
    });
});
