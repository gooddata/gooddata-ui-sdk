import * as React from 'react';
import { shallow } from 'enzyme';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { PieChart } from '../PieChart';
import { PieChart as AfmPieChart } from '../afm/PieChart';

describe('PieChart', () => {
    const measure: VisualizationObject.IMeasure = {
        measure: {
            localIdentifier: 'm1',
            definition: {
                measureDefinition: {
                    item: {
                        identifier: 'xyz123'
                    }
                }
            }
        }
    };

    const attribute: VisualizationObject.IVisualizationAttribute = {
        visualizationAttribute: {
            localIdentifier: 'a1',
            displayForm: {
                identifier: 'attribute1'
            }
        }
    };

    it('should render pie chart and convert the buckets to AFM', () => {
        const wrapper = shallow(
            <PieChart projectId="foo" measures={[measure]} viewBy={attribute} />
        );

        const expectedAfm: AFM.IAfm = {
            measures: [
                {
                    localIdentifier: 'm1',
                    definition: {
                        measure: {
                            item: {
                                identifier: 'xyz123'
                            }
                        }
                    }
                }
            ],
            attributes: [
                {
                    localIdentifier: 'a1',
                    displayForm: {
                        identifier: 'attribute1'
                    }
                }
            ]
        };

        expect(wrapper.find(AfmPieChart)).toHaveLength(1);
        expect(wrapper.find(AfmPieChart).prop('afm')).toEqual(expectedAfm);
    });
});
