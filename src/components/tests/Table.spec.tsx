import * as React from 'react';
import { shallow } from 'enzyme';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { Table } from '../Table';
import { Table as AfmTable } from '../afm/Table';

describe('Table', () => {
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

    it('should render table and convert the buckets to AFM', () => {
        const wrapper = shallow(
            <Table projectId="foo" measures={[measure]} attributes={[attribute]} />
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

        expect(wrapper.find(AfmTable)).toHaveLength(1);
        expect(wrapper.find(AfmTable).prop('afm')).toEqual(expectedAfm);
    });
});
