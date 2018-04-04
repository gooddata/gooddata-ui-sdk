import { getAttributesDisplayForms } from '../../src/utils/visualizationObjectHelper';

describe('visualizationObjectHelper', () => {
    describe('getAttributesDisplayForms', () => {
        it('should get all display forms from measure filters and attributes', () => {
            const mdObject = {
                buckets: [{
                    localIdentifier: 'view',
                    items: [{
                        visualizationAttribute: { displayForm: { uri: '/gdc/md/proj/df1' } }
                    }, {
                        invalid: { displayForm: { uri: '/gdc/md/proj/df2' } }
                    }]
                }, {
                    localIdentifier: 'measures',
                    items: [{
                        visualizationAttribute: { displayForm: { uri: '/gdc/md/proj/df3' } }
                    }, {
                        invalid: { displayForm: { uri: '/gdc/md/proj/df4' } }
                    }, {
                        measure: {
                            definition: {
                                measureDefinition: {
                                    filters: [{
                                        positiveAttributeFilter: { displayForm: { uri: '/gdc/md/proj/df5' } }
                                    }]
                                }
                            }
                        }
                    }
                    ]
                }]
            };

            const displayForms = getAttributesDisplayForms(mdObject);

            expect(displayForms).toEqual(['/gdc/md/proj/df5', '/gdc/md/proj/df1', '/gdc/md/proj/df3']);
        });
    });
});
