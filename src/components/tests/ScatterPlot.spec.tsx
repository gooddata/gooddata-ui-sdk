// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { ScatterPlot } from '../ScatterPlot';
import { ScatterPlot as AfmScatterPlot } from '../afm/ScatterPlot';

describe('ScatterPlot', () => {
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

    const attribute: VisualizationObject.IVisualizationAttribute = {
        visualizationAttribute: {
            localIdentifier: 'a1',
            displayForm: {
                identifier: 'attribute1'
            }
        }
    };

    it('should render scatter plot and convert the buckets to AFM', () => {
        const wrapper = shallow(
            <ScatterPlot
                projectId="foo"
                xAxisMeasure={measure}
                yAxisMeasure={secondaryMeasure}
                attribute={attribute}
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

        expect(wrapper.find(AfmScatterPlot)).toHaveLength(1);
        expect(wrapper.find(AfmScatterPlot).prop('afm')).toEqual(expectedAfm);
    });
});
