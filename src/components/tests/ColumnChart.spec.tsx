import * as React from 'react';
import { shallow } from 'enzyme';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { ColumnChart } from '../ColumnChart';
import { ColumnChart as AfmColumnChart } from '../afm/ColumnChart';

describe('ColumnChart', () => {
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

    const attribute2: VisualizationObject.IVisualizationAttribute = {
        visualizationAttribute: {
            localIdentifier: 'a2',
            displayForm: {
                identifier: 'attribute2'
            }
        }
    };

    it('should render column chart and convert the buckets to AFM', () => {
        const wrapper = shallow(
            <ColumnChart
                projectId="foo"
                measures={[measure]}
                viewBy={attribute}
                stackBy={attribute2}
            />
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
                },
                {
                    localIdentifier: 'a2',
                    displayForm: {
                        identifier: 'attribute2'
                    }
                }
            ]
        };

        expect(wrapper.find(AfmColumnChart)).toHaveLength(1);
        expect(wrapper.find(AfmColumnChart).prop('afm')).toEqual(expectedAfm);
    });
});
