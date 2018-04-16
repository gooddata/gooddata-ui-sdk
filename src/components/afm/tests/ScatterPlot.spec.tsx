// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { mount } from 'enzyme';
import { delay } from '../../tests/utils';
import { ScatterPlot } from '../ScatterPlot';
import { ScatterPlot as CoreScatterPlot } from '../../core/ScatterPlot';
import { dummyExecuteAfmAdapterFactory } from './utils/DummyExecuteAfmAdapter';

describe('ScatterPlot', () => {
    const afmWithAttr = {
        attributes: [
            {
                localIdentifier: 'a1',
                displayForm: { uri: 'abc' }
            }
        ]
    };

    it('should provide default resultSpec to core Scatter plot', () => {
        const wrapper = mount((
            <ScatterPlot
                projectId="prId"
                afm={{}}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreScatterPlot).props().resultSpec.dimensions;
            expect(dimensions).toEqual([ { itemIdentifiers: ['measureGroup'] }, { itemIdentifiers: [] } ]);
        });
    });

    it('should provide default resultSpec to core Scatter plot with attributes', () => {
        const wrapper = mount((
            <ScatterPlot
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />));

        return delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreScatterPlot).props().resultSpec.dimensions;
            expect(dimensions).toEqual([ { itemIdentifiers: ['measureGroup'] }, { itemIdentifiers: ['a1'] } ]);
        });
    });

});
