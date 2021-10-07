// (C) 2007-2021 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";

import cloneDeep from "lodash/cloneDeep";
import * as fixtures from "./catalogue.fixtures";
import { CatalogueModule } from "../catalogue";
import { XhrModule } from "../xhr";
import { ExecutionModule } from "../execution";
import { MetadataModule } from "../metadata";

function createCatalogue() {
    const xhr = new XhrModule(fetch, {});

    return new CatalogueModule(xhr, new ExecutionModule(xhr, new MetadataModule(xhr)));
}

function getRequestBody() {
    const request = fetchMock.lastOptions()!;

    if (request?.body) {
        return JSON.parse(request.body.toString());
    }

    throw new Error("Unexpected type of request");
}

describe("Catalogue", () => {
    const projectId = "some_id";

    describe("#loadItems", () => {
        beforeEach(() => {
            fetchMock.mock(`/gdc/internal/projects/${projectId}/loadCatalog`, {
                status: 200,
                body: JSON.stringify(fixtures.loadCatalogResponse),
            });
        });

        afterEach(() => {
            fetchMock.restore();
        });

        it("should load items from loadCatalog server end point", () => {
            return createCatalogue()
                .loadItems(projectId, fixtures.optionsForEmptySelection)
                .then(() => {
                    expect(getRequestBody()).toEqual(fixtures.requestForEmptySelection);
                });
        });

        it("should send maql for fact base measures", () => {
            const options = fixtures.optionsForMeasureWithFilterAndCategory;

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody()).toEqual(fixtures.requestForMeasureWithFilterAndCategory);

                    const attributeDF = (options.bucketItems.buckets[1].items[0] as any)
                        .visualizationAttribute.displayForm.uri;

                    expect(getRequestBody().catalogRequest.bucketItems[0]).toBe(
                        options.attributesMap[attributeDF]!.attribute.meta.uri,
                    );
                });
        });

        it("should send identifier for attribute base measure", () => {
            const options = fixtures.optionsForTwoMeasuresFactAndAtrribute;

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody()).toEqual(fixtures.requestForTwoMeasureFactAndAttribute);
                });
        });

        it("should send maql with select identifier when visualization contains measure fact and category", () => {
            const options = fixtures.optionsForMeasureWithShowInPercent;

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody()).toEqual(fixtures.requestForMeasureWithShowInPercent);

                    const attributeDF = (options.bucketItems.buckets[1].items[0] as any)
                        .visualizationAttribute.displayForm.uri;

                    expect(getRequestBody().catalogRequest.bucketItems[0]).toBe(
                        options.attributesMap[attributeDF]!.attribute.meta.uri,
                    );
                });
        });

        it("should send select for fact base measure with filter", () => {
            const options = fixtures.optionsForMeasureTypeFactWithFilter;

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody()).toEqual(fixtures.requestForMeasureTypeFactWithFilter);
                });
        });

        it("should send identifier for measure type metric", () => {
            const options = fixtures.optionsForMetric;

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody()).toEqual(fixtures.requestForMetric);
                });
        });

        it("should not override bucketItems prop", () => {
            const dummyUri = "__dummy_uri__";

            return createCatalogue()
                .loadItems(projectId, { bucketItems: [dummyUri] })
                .then(() => {
                    const { bucketItems } = getRequestBody().catalogRequest;

                    expect(bucketItems).toEqual([dummyUri]);
                });
        });

        it("should correctly resolve items with nested maql expressions", () => {
            const options = fixtures.optionsForMeasureWithFilterAndCategoryShowInPercent;

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody()).toEqual(
                        fixtures.requestForMeasureWithFilterAndCategoryShowInPercent,
                    );
                });
        });

        it("should correctly resolve items with nested maql expressions and negative filter element selection", () => {
            const options = fixtures.optionsForMeasureWithNotInFilterAndCategoryShowInPercent;

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody()).toEqual(
                        fixtures.requestForMeasureWithNotInFilterAndCategoryShowInPercent,
                    );
                });
        });

        it("should send from ALL dataSets type when passing returnAllDateDataSets param", () => {
            const options: any = cloneDeep(fixtures.optionsForEmptySelection);
            options.returnAllDateDataSets = true;

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody().catalogRequest.requiredDataSets).toEqual({ type: "ALL" });
                });
        });

        it("should send CUSTOM requiredDataSets structure for dataSetIdentifier param", () => {
            const options: any = cloneDeep(fixtures.optionsForEmptySelection);

            options.dataSetIdentifier = "identifier";

            return createCatalogue()
                .loadItems(projectId, options)
                .then(() => {
                    expect(getRequestBody().catalogRequest.requiredDataSets).toEqual({
                        type: "CUSTOM",
                        customIdentifiers: [options.dataSetIdentifier],
                    });
                });
        });
    });

    describe("#loadDateDataSets", () => {
        beforeEach(() => {
            fetchMock.mock(`/gdc/internal/projects/${projectId}/loadDateDataSets`, {
                status: 200,
                body: JSON.stringify(fixtures.loadDateDataSetsResponse),
            });
        });

        afterEach(() => {
            fetchMock.restore();
        });

        it("should generate basic request structure", () => {
            return createCatalogue()
                .loadDateDataSets(projectId, {})
                .then(() => {
                    expect(getRequestBody().dateDataSetsRequest).toEqual({
                        includeUnavailableDateDataSetsCount: true,
                        includeAvailableDateAttributes: true,
                        bucketItems: undefined,
                        requiredDataSets: {
                            type: "PRODUCTION",
                        },
                    });
                });
        });

        it("should send convert dataSetIdentifier to customIdentifiers", () => {
            const dataSetIdentifier = "my_identifier";

            return createCatalogue()
                .loadDateDataSets(projectId, { dataSetIdentifier })
                .then(() => {
                    const { requiredDataSets } = getRequestBody().dateDataSetsRequest;
                    expect(requiredDataSets).toEqual({
                        type: "CUSTOM",
                        customIdentifiers: [dataSetIdentifier],
                    });
                });
        });

        it("should send type ALL when sending returnAllDateDataSets", () => {
            const returnAllDateDataSets = true;

            return createCatalogue()
                .loadDateDataSets(projectId, { returnAllDateDataSets })
                .then(() => {
                    const { requiredDataSets } = getRequestBody().dateDataSetsRequest;
                    expect(requiredDataSets).toEqual({
                        type: "ALL",
                    });
                });
        });

        it("should omit requiredDataSets parameter when sending returnAllRelatedDateDataSets", () => {
            const returnAllRelatedDateDataSets = true;

            return createCatalogue()
                .loadDateDataSets(projectId, { returnAllRelatedDateDataSets })
                .then(() => {
                    const { requiredDataSets } = getRequestBody().dateDataSetsRequest;
                    expect(requiredDataSets).toBe(undefined);
                });
        });

        it("should send empty columns if only date buckets are in the request", () => {
            const mockPayload = fixtures.optionsForOnlyDateBuckets;

            return createCatalogue()
                .loadDateDataSets(projectId, mockPayload)
                .then(() => {
                    const { bucketItems } = getRequestBody().dateDataSetsRequest;

                    expect(bucketItems).toEqual(["/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233"]);
                });
        });

        it("should replace identifiers with pure MAQL", () => {
            const mockPayload = fixtures.optionsForPureMAQL;

            return createCatalogue()
                .loadDateDataSets(projectId, mockPayload)
                .then(() => {
                    const { bucketItems } = getRequestBody().dateDataSetsRequest;

                    expect(bucketItems).toEqual([
                        "/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274",
                        "SELECT (SELECT (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706])) / (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) BY ALL [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274] WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706]))) FOR PREVIOUS ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2167])",
                        "SELECT (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706])) / (SELECT SUM([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276]) BY ALL [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274] WHERE [/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266] NOT IN ([/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706]))",
                    ]);
                });
        });

        it("should use option includeObjectsWithTags if provided", () => {
            const includeObjectsWithTags = ["a", "b", "c"];

            return createCatalogue()
                .loadDateDataSets(projectId, { includeObjectsWithTags })
                .then(() => {
                    expect(getRequestBody().dateDataSetsRequest.includeObjectsWithTags).toEqual([
                        "a",
                        "b",
                        "c",
                    ]);
                });
        });

        it("should use option excludeObjectsWithTags if provided", () => {
            const excludeObjectsWithTags = ["a", "b", "c"];

            return createCatalogue()
                .loadDateDataSets(projectId, { excludeObjectsWithTags })
                .then(() => {
                    expect(getRequestBody().dateDataSetsRequest.excludeObjectsWithTags).toEqual([
                        "a",
                        "b",
                        "c",
                    ]);
                });
        });

        it("should use option includeObjectsWithTags and omit excludeObjectsWithTags if both provided", () => {
            const includeObjectsWithTags = ["a", "b", "c"];
            const excludeObjectsWithTags = ["d", "e", "f"];

            const options = { includeObjectsWithTags, excludeObjectsWithTags };

            return createCatalogue()
                .loadDateDataSets(projectId, options)
                .then(() => {
                    const data = getRequestBody();

                    expect(data.dateDataSetsRequest.includeObjectsWithTags).toEqual(["a", "b", "c"]);
                    expect(data.dateDataSetsRequest.excludeObjectsWithTags).toBe(undefined);
                });
        });
    });

    describe("loadItemDescriptions", () => {
        function mockedCatalogueModule(execution: any = {}) {
            return new CatalogueModule({} as any, execution);
        }

        const loadItemDescriptionObjectsMockResult = [{ expression: "expression" }, { uri: "/uri/2" }];

        const mdToExecutionDefinitionAndColumnsMock = {
            columns: ["/uri/1", "/uri/2"],
            definitions: [
                {
                    metricDefinition: {
                        identifier: "/uri/1",
                        expression: "expression",
                    },
                },
            ],
        };

        it("should get itemDescriptionObjects and unwrap them to strings", async () => {
            const catalogueModule = mockedCatalogueModule();
            catalogueModule.loadItemDescriptionObjects = jest
                .fn()
                .mockReturnValue(Promise.resolve(loadItemDescriptionObjectsMockResult));

            const result = await catalogueModule.loadItemDescriptions(projectId, {}, {});

            expect(result).toEqual(["expression", "/uri/2"]);
        });

        describe("loadItemDescriptionObjects", () => {
            it("should get columns and definitions and convert them to itemDescriptionObjects", async () => {
                const catalogueModule = mockedCatalogueModule({
                    mdToExecutionDefinitionsAndColumns: jest
                        .fn()
                        .mockReturnValue(Promise.resolve(mdToExecutionDefinitionAndColumnsMock)),
                });

                const result = await catalogueModule.loadItemDescriptionObjects(
                    projectId,
                    {
                        visualizationClass: {
                            uri: "/gdc/dummy/uri",
                        },
                        buckets: [],
                    },
                    [],
                );

                expect(result).toEqual(loadItemDescriptionObjectsMockResult);
            });
        });
    });
});
