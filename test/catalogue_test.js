import * as fixtures from './fixtures/catalogue';
import * as xhr from '../src/xhr';
import * as catalogue from '../src/catalogue';

import Promise from 'bluebird';

describe('Catalogue', () => {
    const projectId = 'some_id';
    const loadCatalogUri = `/gdc/internal/projects/${projectId}/loadCatalog`;
    let ajax;

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

                expect(ajaxCall.args[1].data).to.be.eql(fixtures.requestForMeasureWithFilterAndCategory);

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

                expect(ajaxCall.args[1].data).to.be.eql(fixtures.requestForMeasureWithShowInPercent);

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
