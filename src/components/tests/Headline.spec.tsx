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

    it('should render headline and convert the bucket to AFM', () => {
        const wrapper = shallow(
            <Headline projectId="foo" measure={measure} />
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
});
