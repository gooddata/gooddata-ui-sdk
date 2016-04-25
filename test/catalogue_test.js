import * as catalogue from '../src/catalogue';
import * as fixtures from './fixtures/catalogue';

describe('Catalogue', () => {
    const projectId = 'some_id';
    let server;

    beforeEach(() => {
        server = sinon.fakeServer.create({
            respondImmediately: true
        });
    });

    afterEach(() => {
        server.restore();
    });

    describe('#loadItems', () => {
        it('should load items from loadCatalog server end point', (done) => {
            server.respondWith(
                'POST',
                `/gdc/internal/projects/${projectId}/loadCatalog`,
                [
                    200,
                    { 'Content-Type': 'application/json' },
                    JSON.stringify(fixtures.loadItems)
                ]
            );
            const promise = catalogue.loadItems(projectId, {});

            promise.then((response) => {
                expect(response).to.be.ok();
                expect(response.totals).to.be.eql({
                    'available': fixtures.loadItems.catalogResponse.catalog.length,
                    'unavailable': 0
                });
                expect(response.paging).to.eql({
                        'count': fixtures.loadItems.catalogResponse.catalog.length,
                        'offset': 0
                });
                expect(response.catalog.length).to.be(4);
                done();
            });
        });
    });
});
