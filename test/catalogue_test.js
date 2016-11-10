import { cloneDeep, get, set } from 'lodash';
import fetchMock from 'fetch-mock';
import * as fixtures from './fixtures/catalogue';
import * as catalogue from '../src/catalogue';

describe('Catalogue', () => {
    const projectId = 'some_id';

    describe('#loadItems', () => {
        beforeEach(() => {
            fetchMock.mock(`/gdc/internal/projects/${projectId}/loadCatalog`, {
                status: 200,
                body: JSON.stringify(fixtures.loadCatalogResponse)
            });
        });

        afterEach(() => {
            fetchMock.restore();
        });

        it('should load items from loadCatalog server end point', (done) => {
            catalogue.loadItems(projectId, fixtures.optionsForEmptySelection).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).to.be.eql(fixtures.requestForEmptySelection);

                done();
            });
        });

        it('should send maql for fact base measures', (done) => {
            const options = fixtures.optionsForMeasureWithFilterAndCategory;

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).to.be.eql(fixtures.requestForMeasureWithFilterAndCategory);
                expect(get(data, 'catalogRequest.bucketItems.0')).to.be(
                    get(options, 'bucketItems.buckets.categories.0.category.attribute')
                );

                done();
            });
        });

        it('should send identifier for attribute base measure', (done) => {
            const options = fixtures.optionsForTwoMeasuresFactAndAtrribute;

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).to.be.eql(fixtures.requestForTwoMeasureFactAndAttribute);

                done();
            });
        });

        it('should send maql with select identifier when visualization contains measure fact and category', (done) => {
            const options = fixtures.optionsForMeasureWithShowInPercent;

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).to.be.eql(fixtures.requestForMeasureWithShowInPercent);
                expect(get(data, 'catalogRequest.bucketItems[0]')).to.be(
                    get(options, 'bucketItems.buckets.categories[0].category.attribute')
                );

                done();
            });
        });

        it('should send select for fact base measure with filter', (done) => {
            const options = fixtures.optionsForMeasureTypeFactWithFilter;

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).to.be.eql(fixtures.requestForMeasureTypeFactWithFilter);

                done();
            });
        });

        it('should send identifier for measure type metric', (done) => {
            const options = fixtures.optionsForMetric;

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).to.be.eql(fixtures.requestForMetric);

                done();
            });
        });

        it('should not override bucketItems prop', (done) => {
            const dummyUri = '__dummy_uri__';

            catalogue.loadItems(projectId, { bucketItems: [dummyUri] }).then(() => {
                const { data } = fetchMock.lastOptions();

                const { bucketItems } = data.catalogRequest;

                expect(bucketItems).to.be.eql([dummyUri]);

                done();
            });
        });

        it('should correctly resolve items with nested maql expressions', (done) => {
            const options = fixtures.optionsForMeasureWithFilterAndCategoryShowInPercent;

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).to.be.eql(fixtures.requestForMeasureWithFilterAndCategoryShowInPercent);

                done();
            });
        });

        it('should correctly resolve items with nested maql expressions and negative filter element selection', (done) => {
            const options = fixtures.optionsForMeasureWithFilterAndCategoryShowInPercent;
            set(options, 'bucketItems.buckets.measures[0].measure.measureFilters[0].listAttributeFilter.default.negativeSelection', true);

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).to.be.eql(fixtures.requestForMeasureWithNotInFilterAndCategoryShowInPercent);

                done();
            });
        });

        it('should send from ALL dataSets type when passing returnAllDateDataSets param', (done) => {
            const options = cloneDeep(fixtures.optionsForEmptySelection);
            options.returnAllDateDataSets = true;

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.catalogRequest.requiredDataSets).to.be.eql({ type: 'ALL' });

                done();
            });
        });

        it('should send CUSTOM requiredDataSets structure for dataSetIdentifier param', (done) => {
            const options = cloneDeep(fixtures.optionsForEmptySelection);

            options.dataSetIdentifier = 'identifier';

            catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.catalogRequest.requiredDataSets).to.be.eql({
                    type: 'CUSTOM',
                    customIdentifiers: [options.dataSetIdentifier]
                });

                done();
            });
        });
    });

    describe('#loadDateDataSets', () => {
        beforeEach(() => {
            fetchMock.mock(`/gdc/internal/projects/${projectId}/loadDateDataSets`, {
                status: 200,
                body: JSON.stringify(fixtures.loadDateDataSetsResponse)
            });
        });

        afterEach(() => {
            fetchMock.restore();
        });

        it('should generate basic request structure', (done) => {
            catalogue.loadDateDataSets(projectId, {}).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.dateDataSetsRequest).to.be.eql({
                    includeUnavailableDateDataSetsCount: true,
                    includeAvailableDateAttributes: true,
                    bucketItems: undefined,
                    requiredDataSets: {
                        type: 'PRODUCTION'
                    }
                });

                done();
            });
        });

        it('should send convert dataSetIdentifier to customIdentifiers', (done) => {
            const dataSetIdentifier = 'my_identifier';

            catalogue.loadDateDataSets(projectId, { dataSetIdentifier }).then(() => {
                const { data } = fetchMock.lastOptions();

                const { requiredDataSets } = data.dateDataSetsRequest;
                expect(requiredDataSets).to.eql({
                    type: 'CUSTOM',
                    customIdentifiers: [ dataSetIdentifier ]
                });

                done();
            });
        });

        it('should send type ALL when sending returnAllDateDataSets', (done) => {
            const returnAllDateDataSets = true;

            catalogue.loadDateDataSets(projectId, { returnAllDateDataSets }).then(() => {
                const { data } = fetchMock.lastOptions();

                const { requiredDataSets } = data.dateDataSetsRequest;
                expect(requiredDataSets).to.eql({
                    type: 'ALL'
                });

                done();
            });
        });

        it('should omit requiredDataSets parameter when sending returnAllRelatedDateDataSets', (done) => {
            const returnAllRelatedDateDataSets = true;

            catalogue.loadDateDataSets(projectId, { returnAllRelatedDateDataSets }).then(() => {
                const { data } = fetchMock.lastOptions();

                const { requiredDataSets } = data.dateDataSetsRequest;
                expect(requiredDataSets).to.be(undefined);

                done();
            });
        });

        it('should send empty columns if only date buckets are in the request', (done) => {
            const mockPayload = {
                bucketItems: {
                    buckets: {
                        categories: [{
                            category: {
                                type: 'date',
                                attribute: '/attr1'
                            }
                        }],
                        filters: [{
                            dateFilter: {
                                type: 'relative', // does not matter
                                attribute: '/attr1'
                            }
                        }]
                    }
                }
            };

            catalogue.loadDateDataSets(projectId, mockPayload).then(() => {
                const { data } = fetchMock.lastOptions();

                const { bucketItems } = data.dateDataSetsRequest;

                expect(bucketItems).to.have.length(0);

                done();
            });
        });

        it('should replace identifiers with pure MAQL', () => {
            const mockPayload = {
                bucketItems: {
                    buckets: {
                        measures: [
                            {
                                measure: {
                                    measureFilters: [
                                        {
                                            listAttributeFilter: {
                                                attribute: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266',
                                                displayForm: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2267',
                                                'default': {
                                                    negativeSelection: true,
                                                    attributeElements: [
                                                        '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706'
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    showInPercent: true,
                                    objectUri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276',
                                    aggregation: 'sum',
                                    format: '#,##0.00',
                                    showPoP: true,
                                    title: 'Measure title',
                                    type: 'fact'
                                }
                            }
                        ],
                        filters: [
                            {
                                listAttributeFilter: {
                                    attribute: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274',
                                    displayForm: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2275',
                                    'default': {
                                        negativeSelection: true,
                                        attributeElements: []
                                    }
                                }
                            },
                            {
                                dateFilter: {
                                    attribute: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2167',
                                    to: '2016-09-30',
                                    granularity: 'GDC.time.date',
                                    from: '2000-07-01',
                                    dataset: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2180',
                                    type: 'absolute'
                                }
                            }
                        ],
                        categories: [
                            {
                                category: {
                                    attribute: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274',
                                    type: 'attribute',
                                    displayForm: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2275',
                                    collection: 'trend'
                                }
                            }
                        ]
                    },
                    type: 'line'
                }
            };

            catalogue.loadDateDataSets(projectId, mockPayload).then((done) => {
                const { data } = fetchMock.loadOptions();

                const { bucketItems } = data.dateDataSetsRequest;

                expect(bucketItems).to.have.eql([
                    '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274',
                    'SELECT (SELECT (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706])) / (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) BY ALL [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274] WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706]))) FOR PREVIOUS ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2167])',
                    'SELECT (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706])) / (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) BY ALL [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274] WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706]))'
                ]);

                done();
            });
        });
    });
});
