// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { PivotTable } from '../PivotTable';

describe('PivotTable', () => {
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

    it('should render table and convert the buckets to AFM and resultSpec', () => {
        const wrapper = shallow(
            <PivotTable
                projectId="foo"
                measures={[measure]}
                rows={[attribute]}
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
                        'a1'
                    ]
                },
                {
                    itemIdentifiers: [
                        'measureGroup'
                    ]
                }
            ]
        };

        expect(wrapper.find('WrappedComponent')).toHaveLength(1);
        expect(wrapper.find('WrappedComponent').prop('afm')).toEqual(expectedAfm);
        expect(wrapper.find('WrappedComponent').prop('resultSpec')).toEqual(expectedResultSpec);
    });
    it('should render table and convert the buckets to AFM and resultSpec', () => {
        const wrapper = shallow(
            <PivotTable
                projectId="foo"
                measures={[measure]}
                rows={[attribute]}
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
                        'a1'
                    ]
                },
                {
                    itemIdentifiers: [
                        'measureGroup'
                    ]
                }
            ]
        };

        expect(wrapper.find('WrappedComponent')).toHaveLength(1);
        expect(wrapper.find('WrappedComponent').prop('afm')).toEqual(expectedAfm);
        expect(wrapper.find('WrappedComponent').prop('resultSpec')).toEqual(expectedResultSpec);
    });

    it('should render table with pivot buckets and convert the buckets to AFM and resultSpec', () => {
        const wrapper = shallow(
            <PivotTable
                projectId="foo"
                measures={[measure]}
                rows={[attribute]}
                columns={[attribute2]}
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

        const expectedResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: [
                        'a1'
                    ]
                },
                {
                    itemIdentifiers: [
                        'a2',
                        'measureGroup'
                    ]
                }
            ]
        };

        expect(wrapper.find('WrappedComponent')).toHaveLength(1);
        expect(wrapper.find('WrappedComponent').prop('afm')).toEqual(expectedAfm);
        expect(wrapper.find('WrappedComponent').prop('resultSpec')).toEqual(expectedResultSpec);
    });
});
