import * as fixtures from './fixtures/catalogue';
import * as xhr from '../src/xhr';
import * as catalogue from '../src/catalogue';
import { get } from 'lodash';

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
                    csvDataSetIdentifier: undefined
                });
            });
        });

        it('should send convert dataSetIdentifier to csvDataSetIdentifier', () => {
            const dataSetIdentifier = 'my_identidier';
            return catalogue.loadDateDataSets(projectId, { dataSetIdentifier }).then(() => {
                const ajaxCall = ajax.getCall(0);
                const { csvDataSetIdentifier } = ajaxCall.args[1].data.dateDataSetsRequest;
                expect(csvDataSetIdentifier).to.be(dataSetIdentifier);
            });
        });
    });
});
