// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { Headline } from '../Headline';
import { Headline as AfmHeadline } from '../afm/Headline';

describe('Headline', () => {
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

    it('should render headline with one measure and convert the bucket to AFM', () => {
        const wrapper = shallow(
            <Headline projectId="foo" primaryMeasure={measure} />
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
            ]
        };

        expect(wrapper.find(AfmHeadline)).toHaveLength(1);
        expect(wrapper.find(AfmHeadline).prop('afm')).toEqual(expectedAfm);
    });

    it('should render headline with two measures and convert the bucket to AFM', () => {
        const secondaryMeasure: VisualizationObject.IMeasure = {
            measure: {
                localIdentifier: 'm2',
                definition: {
                    measureDefinition: {
                        item: {
                            identifier: 'abc123'
                        }
                    }
                }
            }
        };
        const wrapper = shallow(
            <Headline projectId="foo" primaryMeasure={measure} secondaryMeasure={secondaryMeasure} />
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
                },
                {
                    localIdentifier: 'm2',
                    definition: {
                        measure: {
                            item: {
                                identifier: 'abc123'
                            }
                        }
                    }
                }
            ]
        };

        expect(wrapper.find(AfmHeadline)).toHaveLength(1);
        expect(wrapper.find(AfmHeadline).prop('afm')).toEqual(expectedAfm);
    });
});
