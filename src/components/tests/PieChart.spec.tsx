// (C) 2007-2018 GoodData Corporation
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

    const measureSortItem: AFM.IMeasureSortItem = {
        measureSortItem: {
            direction: 'asc',
            locators: [{
                measureLocatorItem: {
                    measureIdentifier: 'm1'
                }
            }]
        }
    };

    it('should render pie chart and convert the buckets to AFM', () => {
        const wrapper = shallow(
            <PieChart
                projectId="foo"
                measures={[measure]}
                viewBy={attribute}
                sortBy={[measureSortItem]}
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
                }
            ]
        };

        const expectedResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: [
                        'measureGroup'
                    ]
                },
                {
                    itemIdentifiers: [
                        'a1'
                    ]
                }
            ],
            sorts: [
                {
                    measureSortItem: {
                        direction: 'asc',
                        locators: [
                            {
                                measureLocatorItem: {
                                    measureIdentifier: 'm1'
                                }
                            }
                        ]
                    }
                }
            ]
        };

        expect(wrapper.find(AfmPieChart)).toHaveLength(1);
        expect(wrapper.find(AfmPieChart).prop('afm')).toEqual(expectedAfm);
        expect(wrapper.find(AfmPieChart).prop('resultSpec')).toEqual(expectedResultSpec);
    });
});
