import * as fixtures from './fixtures/catalogue';
import * as xhr from '../src/xhr';
import * as catalogue from '../src/catalogue';
import { cloneDeep, get, set } from 'lodash';

import Promise from 'bluebird';

describe('Catalogue', () => {
    const projectId = 'some_id';
    let ajax;

    describe('loadCatalog', () => {
        const loadCatalogUri = `/gdc/internal/projects/${projectId}/loadCatalog`;

        beforeEach(() => {
            ajax = sinon.stub(xhr, 'ajax', () => Promise.resolve(fixtures.loadCatalogResponse));
        });

        afterEach(() => {
            xhr.ajax.restore();
        });

        describe('#loadItems', () => {
            it('should load items from loadCatalog server end point', (done) => {
                catalogue.loadItems(projectId, fixtures.optionsForEmptySelection);

                setTimeout(() => {
                    const ajaxCall = ajax.getCall(0);
                    expect(ajaxCall.args[0]).to.be(loadCatalogUri);
                    expect(ajaxCall.args[1].data).to.be.eql(fixtures.requestForEmptySelection);
                    done();
                }, 0);
            });

            it('should send maql for fact base measures', (done) => {
                const options = fixtures.optionsForMeasureWithFilterAndCategory;

                catalogue.loadItems(projectId, options);

                setTimeout(() => {
                    const ajaxCall = ajax.getCall(0);
                    const data = get(ajaxCall.args[1], 'data');
                    expect(data).to.be.eql(fixtures.requestForMeasureWithFilterAndCategory);
                    expect(get(data, 'catalogRequest.bucketItems[0]')).to.be(
                        get(options, 'bucketItems.buckets.categories[0].category.attribute')
                    );
                    done();
                });
            });

            it('should send identifier for attribute base measure', (done) => {
                const options = fixtures.optionsForTwoMeasuresFactAndAtrribute;

                catalogue.loadItems(projectId, options);

                setTimeout(() => {
                    const ajaxCall = ajax.getCall(0);
                    expect(ajaxCall.args[1].data).to.be.eql(fixtures.requestForTwoMeasureFactAndAttribute);
                    done();
                }, 0);
            });

            it('should send maql with select identifier when visualization contains measure fact and category', (done) => {
                const options = fixtures.optionsForMeasureWithShowInPercent;
                catalogue.loadItems(projectId, options);
                setTimeout(() => {
                    const ajaxCall = ajax.getCall(0);
                    const data = get(ajaxCall.args[1], 'data');
                    expect(data).to.be.eql(fixtures.requestForMeasureWithShowInPercent);
                    expect(get(data, 'catalogRequest.bucketItems[0]')).to.be(
                        get(options, 'bucketItems.buckets.categories[0].category.attribute')
                    );
                    done();
                });
            });

            it('should send select for fact base measure with filter', (done) => {
                const options = fixtures.optionsForMeasureTypeFactWithFilter;
                catalogue.loadItems(projectId, options);
                setTimeout(() => {
                    const ajaxCall = ajax.getCall(0);
                    expect(ajaxCall.args[1].data).to.be.eql(fixtures.requestForMeasureTypeFactWithFilter);
                    done();
                });
            });

            it('should send identifier for measure type metric', (done) => {
                const options = fixtures.optionsForMetric;
                catalogue.loadItems(projectId, options);
                setTimeout(() => {
                    const ajaxCall = ajax.getCall(0);
                    expect(ajaxCall.args[1].data).to.be.eql(fixtures.requestForMetric);
                    done();
                });
            });

            it('should not override bucketItems prop', (done) => {
                const dummyUri = '__dummy_uri__';
                catalogue.loadItems(projectId, { bucketItems: [dummyUri] });
                setTimeout(() => {
                    const ajaxCall = ajax.getCall(0);
                    const { bucketItems } = ajaxCall.args[1].data.catalogRequest;
                    expect(bucketItems).to.be.eql([dummyUri]);
                    done();
                }, 0);
            });

            it('should correctly resolve items with nested maql expressions', () => {
                const options = fixtures.optionsForMeasureWithFilterAndCategoryShowInPercent;

                catalogue.loadItems(projectId, options);

                const ajaxCall = ajax.getCall(0);
                const data = get(ajaxCall.args[1], 'data');
                expect(data).to.be.eql(fixtures.requestForMeasureWithFilterAndCategoryShowInPercent);
            });

            it('should correctly resolve items with nested maql expressions and negative filter element selection', () => {
                const options = fixtures.optionsForMeasureWithFilterAndCategoryShowInPercent;
                set(options, 'bucketItems.buckets.measures[0].measure.measureFilters[0].listAttributeFilter.default.negativeSelection', true);

                catalogue.loadItems(projectId, options);

                const ajaxCall = ajax.getCall(0);
                const data = get(ajaxCall.args[1], 'data');
                expect(data).to.be.eql(fixtures.requestForMeasureWithNotInFilterAndCategoryShowInPercent);
            });

            it('should send from ALL dataSets type when passing returnAllDateDataSets param', () => {
                const options = cloneDeep(fixtures.optionsForEmptySelection);
                options.returnAllDateDataSets = true;

                catalogue.loadItems(projectId, options);

                const ajaxCall = ajax.getCall(0);
                const data = get(ajaxCall.args[1], 'data');
                expect(data.catalogRequest.requiredDataSets).to.be.eql({ type: 'ALL' });
            });

            it('should send CUSTOM requiredDataSets structure for dataSetIdentifier param', () => {
                const options = cloneDeep(fixtures.optionsForEmptySelection);

                options.dataSetIdentifier = 'identifier';

                catalogue.loadItems(projectId, options);

                const ajaxCall = ajax.getCall(0);
                const data = get(ajaxCall.args[1], 'data');
                expect(data.catalogRequest.requiredDataSets).to.be.eql({
                    type: 'CUSTOM',
                    customIdentifiers: [options.dataSetIdentifier]
                });
            });
        });
    });

    describe('loadDateDataSets', () => {
        const loadDateDataSetsUri = `/gdc/internal/projects/${projectId}/loadDateDataSets`;

        beforeEach(() => {
            ajax = sinon.stub(xhr, 'ajax', () => Promise.resolve(fixtures.loadDateDataSetsResponse));
        });

        afterEach(() => {
            xhr.ajax.restore();
        });

        it('should generate basic request structure', () => {
            return catalogue.loadDateDataSets(projectId, {}).then(() => {
                const ajaxCall = ajax.getCall(0);
                expect(ajaxCall.args[0]).to.be(loadDateDataSetsUri);

                const dateDataSetsRequest = ajaxCall.args[1].data.dateDataSetsRequest;
                expect(dateDataSetsRequest).to.be.eql({
                    includeUnavailableDateDataSetsCount: true,
                    includeAvailableDateAttributes: true,
                    bucketItems: undefined,
                    requiredDataSets: {
                        type: 'PRODUCTION'
                    }
                });
            });
        });

        it('should send convert dataSetIdentifier to customIdentifiers', () => {
            const dataSetIdentifier = 'my_identifier';
            return catalogue.loadDateDataSets(projectId, { dataSetIdentifier }).then(() => {
                const ajaxCall = ajax.getCall(0);
                const { requiredDataSets } = ajaxCall.args[1].data.dateDataSetsRequest;
                expect(requiredDataSets).to.eql({
                    type: 'CUSTOM',
                    customIdentifiers: [ dataSetIdentifier ]
                });
            });
        });

        it('should send type ALL when sending returnAllDateDataSets', () => {
            const returnAllDateDataSets = true;
            return catalogue.loadDateDataSets(projectId, { returnAllDateDataSets }).then(() => {
                const ajaxCall = ajax.getCall(0);
                const { requiredDataSets } = ajaxCall.args[1].data.dateDataSetsRequest;
                expect(requiredDataSets).to.eql({
                    type: 'ALL'
                });
            });
        });

        it('should omit requiredDataSets parameter when sending returnAllRelatedDateDataSets', () => {
            const returnAllRelatedDateDataSets = true;
            return catalogue.loadDateDataSets(projectId, { returnAllRelatedDateDataSets }).then(() => {
                const ajaxCall = ajax.getCall(0);
                const { requiredDataSets } = ajaxCall.args[1].data.dateDataSetsRequest;
                expect(requiredDataSets).to.be(undefined);
            });
        });

        it('should send empty columns if only date buckets are in the request', () => {
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
            return catalogue.loadDateDataSets(projectId, mockPayload).then(() => {
                const call = ajax.getCall(0);
                const items = call.args[1].data.dateDataSetsRequest.bucketItems;
                expect(items).to.have.length(0);
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

            return catalogue.loadDateDataSets(projectId, mockPayload).then(() => {
                const call = ajax.getCall(0);
                const items = call.args[1].data.dateDataSetsRequest.bucketItems;
                expect(items).to.have.eql([
                    '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274',
                    'SELECT (SELECT (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706])) / (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) BY ALL [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274] WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706]))) FOR PREVIOUS ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2167])',
                    'SELECT (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706])) / (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) BY ALL [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274] WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706]))'
                ]);
            });
        });
    });
});
