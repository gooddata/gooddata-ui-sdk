import { cloneDeep, get } from 'lodash';
import fetchMock from './utils/fetch-mock';
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

        it('should load items from loadCatalog server end point', () => {
            return catalogue.loadItems(projectId, fixtures.optionsForEmptySelection).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).toEqual(fixtures.requestForEmptySelection);
            });
        });

        it('should send maql for fact base measures', () => {
            const options = fixtures.optionsForMeasureWithFilterAndCategory;

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).toEqual(fixtures.requestForMeasureWithFilterAndCategory);

                const attributeDF = get(options, 'bucketItems.buckets.1.items.0.visualizationAttribute.displayForm.uri');
                expect(get(data, 'catalogRequest.bucketItems.0')).toBe(
                    get(options, ['attributesMap', attributeDF, 'attribute', 'meta', 'uri'])
                );
            });
        });

        it('should send identifier for attribute base measure', () => {
            const options = fixtures.optionsForTwoMeasuresFactAndAtrribute;

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).toEqual(fixtures.requestForTwoMeasureFactAndAttribute);
            });
        });

        it('should send maql with select identifier when visualization contains measure fact and category', () => {
            const options = fixtures.optionsForMeasureWithShowInPercent;

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).toEqual(fixtures.requestForMeasureWithShowInPercent);

                const attributeDF = get(options, 'bucketItems.buckets.1.items.0.visualizationAttribute.displayForm.uri');
                expect(get(data, 'catalogRequest.bucketItems[0]')).toBe(
                    get(options, ['attributesMap', attributeDF, 'attribute', 'meta', 'uri'])
                );
            });
        });

        it('should send select for fact base measure with filter', () => {
            const options = fixtures.optionsForMeasureTypeFactWithFilter;

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).toEqual(fixtures.requestForMeasureTypeFactWithFilter);
            });
        });

        it('should send identifier for measure type metric', () => {
            const options = fixtures.optionsForMetric;

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).toEqual(fixtures.requestForMetric);
            });
        });

        it('should not override bucketItems prop', () => {
            const dummyUri = '__dummy_uri__';

            return catalogue.loadItems(projectId, { bucketItems: [dummyUri] }).then(() => {
                const { data } = fetchMock.lastOptions();

                const { bucketItems } = data.catalogRequest;

                expect(bucketItems).toEqual([dummyUri]);
            });
        });

        it('should correctly resolve items with nested maql expressions', () => {
            const options = fixtures.optionsForMeasureWithFilterAndCategoryShowInPercent;

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).toEqual(fixtures.requestForMeasureWithFilterAndCategoryShowInPercent);
            });
        });

        it('should correctly resolve items with nested maql expressions and negative filter element selection', () => {
            const options = fixtures.optionsForMeasureWithNotInFilterAndCategoryShowInPercent;

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data).toEqual(fixtures.requestForMeasureWithNotInFilterAndCategoryShowInPercent);
            });
        });

        it('should send from ALL dataSets type when passing returnAllDateDataSets param', () => {
            const options = cloneDeep(fixtures.optionsForEmptySelection);
            options.returnAllDateDataSets = true;

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.catalogRequest.requiredDataSets).toEqual({ type: 'ALL' });
            });
        });

        it('should send CUSTOM requiredDataSets structure for dataSetIdentifier param', () => {
            const options = cloneDeep(fixtures.optionsForEmptySelection);

            options.dataSetIdentifier = 'identifier';

            return catalogue.loadItems(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.catalogRequest.requiredDataSets).toEqual({
                    type: 'CUSTOM',
                    customIdentifiers: [options.dataSetIdentifier]
                });
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

        it('should generate basic request structure', () => {
            return catalogue.loadDateDataSets(projectId, {}).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.dateDataSetsRequest).toEqual({
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
                const { data } = fetchMock.lastOptions();

                const { requiredDataSets } = data.dateDataSetsRequest;
                expect(requiredDataSets).toEqual({
                    type: 'CUSTOM',
                    customIdentifiers: [dataSetIdentifier]
                });
            });
        });

        it('should send type ALL when sending returnAllDateDataSets', () => {
            const returnAllDateDataSets = true;

            return catalogue.loadDateDataSets(projectId, { returnAllDateDataSets }).then(() => {
                const { data } = fetchMock.lastOptions();

                const { requiredDataSets } = data.dateDataSetsRequest;
                expect(requiredDataSets).toEqual({
                    type: 'ALL'
                });
            });
        });

        it('should omit requiredDataSets parameter when sending returnAllRelatedDateDataSets', () => {
            const returnAllRelatedDateDataSets = true;

            return catalogue.loadDateDataSets(projectId, { returnAllRelatedDateDataSets }).then(() => {
                const { data } = fetchMock.lastOptions();

                const { requiredDataSets } = data.dateDataSetsRequest;
                expect(requiredDataSets).toBe(undefined);
            });
        });

        it('should send empty columns if only date buckets are in the request', () => {
            const mockPayload = fixtures.optionsForOnlyDateBuckets;

            return catalogue.loadDateDataSets(projectId, mockPayload).then(() => {
                const { data } = fetchMock.lastOptions();

                const { bucketItems } = data.dateDataSetsRequest;

                expect(bucketItems).toHaveLength(0);
            });
        });

        it('should replace identifiers with pure MAQL', () => {
            const mockPayload = fixtures.optionsForPureMAQL;

            return catalogue.loadDateDataSets(projectId, mockPayload).then(() => {
                const { data } = fetchMock.lastOptions();

                const { bucketItems } = data.dateDataSetsRequest;

                expect(bucketItems).toEqual([
                    '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274',
                    'SELECT (SELECT (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706])) / (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) BY ALL [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274] WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706]))) FOR PREVIOUS ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2167])',
                    'SELECT (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706])) / (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) BY ALL [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274] WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706]))'
                ]);
            });
        });

        it('should use option includeObjectsWithTags if provided', () => {
            const includeObjectsWithTags = ['a', 'b', 'c'];

            return catalogue.loadDateDataSets(projectId, { includeObjectsWithTags }).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.dateDataSetsRequest.includeObjectsWithTags).toEqual(['a', 'b', 'c']);
            });
        });

        it('should use option excludeObjectsWithTags if provided', () => {
            const excludeObjectsWithTags = ['a', 'b', 'c'];

            return catalogue.loadDateDataSets(projectId, { excludeObjectsWithTags }).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.dateDataSetsRequest.excludeObjectsWithTags).toEqual(['a', 'b', 'c']);
            });
        });

        it('should use option includeObjectsWithTags and omit excludeObjectsWithTags if both provided', () => {
            const includeObjectsWithTags = ['a', 'b', 'c'];
            const excludeObjectsWithTags = ['d', 'e', 'f'];

            const options = { includeObjectsWithTags, excludeObjectsWithTags };

            return catalogue.loadDateDataSets(projectId, options).then(() => {
                const { data } = fetchMock.lastOptions();

                expect(data.dateDataSetsRequest.includeObjectsWithTags).toEqual(['a', 'b', 'c']);
                expect(data.dateDataSetsRequest.excludeObjectsWithTags).toBe(undefined);
            });
        });
    });
});
