// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { BubbleChart } from '../BubbleChart';
import { BubbleChart as AfmBubbleChart } from '../afm/BubbleChart';

describe('BubbleChart', () => {
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

    const secondaryMeasure: VisualizationObject.IMeasure = {
        measure: {
            localIdentifier: 'm2',
            definition: {
                measureDefinition: {
                    item: {
                        identifier: 'abc321'
                    }
                }
            }
        }
    };

    const tertiaryMeasure: VisualizationObject.IMeasure = {
        measure: {
            localIdentifier: 'm3',
            definition: {
                measureDefinition: {
                    item: {
                        identifier: 'size'
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

    const attributeSortItem: AFM.IAttributeSortItem = {
        attributeSortItem: {
            direction: 'desc',
            attributeIdentifier: 'attribute1'
        }
    };

    it('should render scatter plot and convert the buckets to AFM', () => {
        const wrapper = shallow(
            <BubbleChart
                projectId="foo"
                xAxisMeasure={measure}
                yAxisMeasure={secondaryMeasure}
                size={tertiaryMeasure}
                viewBy={attribute}
                sortBy={[attributeSortItem]}
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
                }, {
                    localIdentifier: 'm2',
                    definition: {
                        measure: {
                            item: {
                                identifier: 'abc321'
                            }
                        }
                    }
                }, {
                    localIdentifier: 'm3',
                    definition: {
                        measure: {
                            item: {
                                identifier: 'size'
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
                        'a1'
                    ]
                },
                {
                    itemIdentifiers: [
                        'measureGroup'
                    ]
                }
            ],
            sorts: [
                {
                    attributeSortItem: {
                        direction: 'desc',
                        attributeIdentifier: 'attribute1'
                    }
                }
            ]
        };

        expect(wrapper.find(AfmBubbleChart)).toHaveLength(1);
        expect(wrapper.find(AfmBubbleChart).prop('afm')).toEqual(expectedAfm);
        expect(wrapper.find(AfmBubbleChart).prop('resultSpec')).toEqual(expectedResultSpec);
    });
});
