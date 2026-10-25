// (C) 2007-2026 GoodData Corporation

/**
 * The test is absolute mess that is really hard to extend or modify without braking plethora of other tests.
 * Consider to refactor your test case and put it into `metadata_test.ts` file instead of here. Remove the
 * tests that are duplicated in the new file so we can get rid of this horrid file some time in (hopefully)
 * not so distant future.
 */
import { omit } from "lodash-es";
import { beforeEach, describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";
import { BucketNames, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { ATTRIBUTE, GEO_ATTRIBUTE, MEASURES, STACK, VIEW } from "../constants/bucket.js";
import { DEFAULT_DECIMAL_FORMAT, DEFAULT_PERCENTAGE_FORMAT } from "../constants/formats.js";
import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import { initialState } from "../reducers/initial_state.js";
import { getDecoratedBuckets } from "../selectors/buckets_selector.js";
import { type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../store/types.js";
import {
    categoriesBucketItems,
    countryElements,
    dateCreated,
    elements,
    enrichCategoriesBucketItems,
    filterWithUnavailableElements,
    itemCache as itemCacheMock,
    measureBucketItems,
    metadataBucketCategories,
    metadataBucketFilterWithSelection,
    metadataBucketFiltersNoSelection,
    metadataBucketFiltersWithQuarterGranularity,
    metadataBucketMeasures,
    metadataFilterWithNonDefaultDisplayForm,
    seedDateDatasetsMeta,
    stacksBucketItems,
} from "../tests/constants.test.helpers.js";
import {
    filterItemWithNonDefaultDisplayForm,
    filterItems,
    filterItemsWithNoSelection,
    filtersWithQuarterGranularity,
} from "../tests/filter.test.helpers.js";
import {
    seedMeasureDateDatasetSelectedUri,
    seedMeasureDateDatasetStatus,
} from "../tests/measure_date_datasets.test.helpers.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";
import {
    type IBucket as IVisualizationObjectBucket,
    type IVisualizationObjectContent,
} from "../typings/bear/bearTypes.js";
import { type IDecoratedBuckets, type IRawBucket, type IRawBuckets } from "../typings/buckets.js";
import { type IDateDatasets } from "../typings/datasets.js";
import { type ICatalogEntries } from "../typings/state_objects.js";

import { buildBucketItem } from "./bucket_item.js";
import {
    type IAdditionalData,
    type IBucketsToMetadataAdditionalData,
    bucketsToMetadata,
    filtersToMetadata,
    getOverTimeComparisonType,
    isMeasureShowOnSecondaryAxis,
    metadataToBuckets,
    omitAliasFromReportMDObj,
    omitArithmeticMeasuresMDObj,
    omitIrrelevantPropertiesForAvailability,
    omitTotalsFromReportMDObj,
    pickRelevantFromReportMDObj,
} from "./metadata.js";

/** `BucketItem` is a union; these specs assert on the visualizationAttribute member of it. */
const visualizationAttributeOf = (item: unknown) =>
    (item as { visualizationAttribute?: { displayForm?: { uri?: string } } })?.visualizationAttribute;

function omitFiltersLocalIdentifier(filters: ReadonlyArray<IFilter>) {
    return filters.map((item) => omit(item, "localIdentifier"));
}

describe("Buckets to metadata object conversion", () => {
    let state: IAppState;
    // feeds both directions of the conversion
    let additionalData: IBucketsToMetadataAdditionalData & IAdditionalData;
    let buckets: IDecoratedBuckets;
    let filters: IFilter[];
    let itemCache: ICatalogEntries;
    let measuresBucket: IRawBucket;
    let viewBucket: IRawBucket;
    let stackBucket: IRawBucket;
    let dateDatasets: IDateDatasets;

    // the parameter is the `data` BRANCH, not the root
    function getPlainItems(data: { buckets: IRawBuckets }, bucketLocalIdentifier: string) {
        const bucketIndex = state.data.buckets.findIndex(
            (bucket) => bucket.localIdentifier === bucketLocalIdentifier,
        );
        return data.buckets[bucketIndex]?.items;
    }

    beforeEach(() => {
        itemCache = itemCacheMock;

        measuresBucket = {
            localIdentifier: MEASURES,
            items: measureBucketItems.map(buildBucketItem),
        };

        viewBucket = {
            localIdentifier: VIEW,
            items: categoriesBucketItems.map(buildBucketItem),
        };

        stackBucket = {
            localIdentifier: STACK,
            items: stacksBucketItems.map(buildBucketItem),
        };

        dateDatasets = {
            available: [dateCreated],
            unavailable: 1,
        };

        const dateDatasetsMeta: IDateDatasetsMeta = {
            items: [
                {
                    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"),
                    identifier: "created.dataset.dt",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                    type: "dateDataset",
                    title: "Date (Date Created)",
                    summary: "DataSet Date",
                    attributes: [],
                },
            ],
        };

        const stateWithDateDatasetMeta = seedDateDatasetsMeta(initialState, dateDatasetsMeta);

        const stateWithLinkedDateDataset = seedMeasureDateDatasetSelectedUri(
            stateWithDateDatasetMeta,
            "m3",
            "/gdc/md/TeamOneGoodSales1/obj/15174",
        );

        const stateWithMeasureDateDatasets = seedMeasureDateDatasetStatus(
            stateWithLinkedDateDataset,
            "m3",
            [dateCreated],
            0,
        );

        const bootstrapData = {
            bootstrapData: {
                project: { id: "my project" },
            },
        };

        filters = filterItems;

        // PRE-EXISTING: `bootstrapData` is not on the strict appState type — no reducer owns it.
        // Preserved verbatim; the metadata readers reach it through an indexed access.
        state = withRoot(stateWithMeasureDateDatasets, {
            appState: {
                ...stateWithMeasureDateDatasets.appState,
                bootstrapData: bootstrapData.bootstrapData,
            } as IAppState["appState"],
        });
        state = withRoot(state, { data: { ...state.data, itemCache: itemCache } });
        state = withData(state, { dateDatasets: { ...state.data.dateDatasets, ...dateDatasets } });
        state = withData(state, { buckets: [measuresBucket, viewBucket, stackBucket] });
        state = withData(state, {
            filterBar: { ...state.data.filterBar, items: filters },
        });

        buckets = getDecoratedBuckets(state);

        additionalData = {
            itemCache,
            dateDatasets,
            filterItems: {
                "/gdc/md/TeamOneGoodSales1/obj/952": {
                    items: elements,
                    total: Object.keys(elements).length,
                },
                "/gdc/md/TeamOneGoodSales1/obj/902": {
                    items: countryElements,
                    total: Object.keys(countryElements).length,
                },
            },
            properties: { controls: {} },
            dateFilterDateDatasetRef: dateCreated.ref,
        };
    });

    describe("bucketsToMetadata", () => {
        let mdBuckets: IVisualizationObjectBucket[];
        let mdFilters: ReturnType<typeof filtersToMetadata>;
        let reconstructedState: ReturnType<typeof metadataToBuckets>;

        beforeEach(() => {
            mdBuckets = bucketsToMetadata(buckets, additionalData);
            mdFilters = filtersToMetadata(filters);
        });

        describe("serialization", () => {
            it("should return proper measures including proper measure definitions", () => {
                expect(mdBuckets?.[0]).toEqual(metadataBucketMeasures);
            });

            it("should return proper categories", () => {
                expect(mdBuckets?.[1]).toEqual(metadataBucketCategories);
            });

            it("should return proper filters", () => {
                expect(mdFilters).toMatchSnapshot();
            });

            it("should return filters even if no element selected", () => {
                const converted = filtersToMetadata(filterItemsWithNoSelection);
                expect(converted).toEqual(metadataBucketFiltersNoSelection);
            });

            it("should return dateFilter with quarter attribute in uri", () => {
                const converted = filtersToMetadata(filtersWithQuarterGranularity);
                expect(converted).toEqual(metadataBucketFiltersWithQuarterGranularity);
            });
        });

        describe("deserialization", () => {
            beforeEach(() => {
                reconstructedState = metadataToBuckets({
                    // partial content fixture — the transform reads only buckets/filters
                    metadataObject: {
                        buckets: mdBuckets,
                        filters: mdFilters,
                    } as IVisualizationObjectContent,
                    additionalData,
                });
            });

            it("should set proper categories to buckets", () => {
                const enrichViewBucket = {
                    localIdentifier: VIEW,
                    items: enrichCategoriesBucketItems.slice(0, 2).map(buildBucketItem),
                };
                const reconstructedViewItems = getPlainItems(reconstructedState, VIEW);
                expect(reconstructedViewItems).toEqual(enrichViewBucket.items);
            });

            it("should set proper filters to buckets", () => {
                expect(omitFiltersLocalIdentifier(reconstructedState.filters)).toMatchSnapshot();
            });

            it("should set proper filters to bucket if no element selected", () => {
                const reconstructedStateWithNoSelection = metadataToBuckets({
                    metadataObject: {
                        buckets: mdBuckets,
                        filters: metadataBucketFiltersNoSelection,
                    } as IVisualizationObjectContent,
                    additionalData,
                });

                expect(
                    omitFiltersLocalIdentifier(reconstructedStateWithNoSelection.filters),
                ).toMatchSnapshot();
            });

            it("should add unavailable element to selected elements if element is not in filterItems", () => {
                const reconstructedStateWithNoFilterItems = metadataToBuckets({
                    metadataObject: {
                        buckets: mdBuckets,
                        filters: [metadataBucketFilterWithSelection],
                    } as IVisualizationObjectContent,
                    additionalData: {
                        ...additionalData,
                        filterItems: {},
                    },
                });

                expect(omitFiltersLocalIdentifier(reconstructedStateWithNoFilterItems.filters)).toEqual(
                    omitFiltersLocalIdentifier([filterWithUnavailableElements]),
                );
            });

            it("should correctly set the attribute filter if used display form is not the default one", () => {
                const reconstructedStateWithNoSelection = metadataToBuckets({
                    metadataObject: {
                        buckets: mdBuckets,
                        filters: [metadataFilterWithNonDefaultDisplayForm],
                    } as IVisualizationObjectContent,
                    additionalData,
                });

                expect(omitFiltersLocalIdentifier(reconstructedStateWithNoSelection.filters)).toEqual(
                    omitFiltersLocalIdentifier([filterItemWithNonDefaultDisplayForm]),
                );
            });
        });

        describe("deserialization with custom formatting", () => {
            it("should add default formats to ad-hoc measures when the format is missing", () => {
                reconstructedState = metadataToBuckets({
                    metadataObject: {
                        buckets: [metadataBucketMeasures],
                        filters: [],
                    } as IVisualizationObjectContent,
                    additionalData,
                });

                const reconstructedMeasures = getPlainItems(reconstructedState, MEASURES);
                expect(reconstructedMeasures[0].format).toBe(null);
                expect(reconstructedMeasures[1].format).toBe(DEFAULT_PERCENTAGE_FORMAT);
                expect(reconstructedMeasures[2].format).toBe(null);
                expect(reconstructedMeasures[5].format).toBe("#,##0");
                expect(reconstructedMeasures[8].format).toBe("##AM");
                expect(reconstructedMeasures[9].format).toBe(DEFAULT_DECIMAL_FORMAT);
                expect(reconstructedMeasures[11].format).toBe(DEFAULT_PERCENTAGE_FORMAT);
            });
        });
    });

    describe("location bucket to metadata", () => {
        it("should return metadata with location display form uri from location bucket", () => {
            const decoratedLocationBucket = [
                {
                    localIdentifier: "location",
                    accepts: [ATTRIBUTE, GEO_ATTRIBUTE],
                    items: [
                        {
                            localIdentifier: "location",
                            isDate: false,
                            isMeasure: false,
                            attribute: {
                                isLocationIconVisible: true,
                                dfRef: uriRef("/uri/displayForm"),
                                locationDisplayFormRef: uriRef("/uri/locationDisplayFormUri"),
                            },
                        },
                    ],
                },
            ] as IDecoratedBuckets;

            const metadata = bucketsToMetadata(decoratedLocationBucket);
            const displayFormUri = visualizationAttributeOf(metadata?.[0]?.items?.[0])?.displayForm?.uri;
            expect(displayFormUri).toBe("/uri/locationDisplayFormUri");
        });

        it("should return metadata with location display form uri from stored displayForm", () => {
            const decoratedLocationBucket = [
                {
                    localIdentifier: "location",
                    accepts: [],
                    items: [
                        {
                            localIdentifier: "location",
                            isDate: false,
                            isMeasure: false,
                            attribute: {
                                isLocationIconVisible: true,
                                dfRef: uriRef("/uri/displayForm"),
                                displayForm: uriRef("/uri/locationDisplayFormUri"),
                                locationDisplayFormRef: uriRef("/uri/locationDisplayFormUri"),
                            },
                        },
                    ],
                },
            ] as IDecoratedBuckets;

            const metadata = bucketsToMetadata(decoratedLocationBucket);
            const displayFormUri = visualizationAttributeOf(metadata?.[0]?.items?.[0])?.displayForm?.uri;
            expect(displayFormUri).toBe("/uri/locationDisplayFormUri");
        });

        it("should prioritize explicit bucket item display form in location bucket", () => {
            const decoratedLocationBucket = [
                {
                    localIdentifier: "location",
                    accepts: [ATTRIBUTE, GEO_ATTRIBUTE],
                    items: [
                        {
                            localIdentifier: "location",
                            isDate: false,
                            isMeasure: false,
                            // the explicit user choice lives on the RAW item (decorated items
                            // never carried top-level displayForm/dfRef keys)
                            original: {
                                dfRef: uriRef("/uri/latitudeDisplayForm"),
                                displayForm: uriRef("/uri/latitudeDisplayForm"),
                            },
                            attribute: {
                                isLocationIconVisible: true,
                                dfRef: uriRef("/uri/defaultDisplayForm"),
                                locationDisplayFormRef: uriRef("/uri/locationDisplayFormUri"),
                            },
                        },
                    ],
                },
            ] as IDecoratedBuckets;

            const metadata = bucketsToMetadata(decoratedLocationBucket);
            const displayFormUri = visualizationAttributeOf(metadata?.[0]?.items?.[0])?.displayForm?.uri;
            expect(displayFormUri).toBe("/uri/latitudeDisplayForm");
        });

        it("should prioritize original bucket item display form in location bucket", () => {
            const decoratedLocationBucket = [
                {
                    localIdentifier: "location",
                    accepts: [ATTRIBUTE, GEO_ATTRIBUTE],
                    items: [
                        {
                            localIdentifier: "location",
                            isDate: false,
                            isMeasure: false,
                            original: {
                                dfRef: uriRef("/uri/latitudeDisplayForm"),
                                displayForm: uriRef("/uri/latitudeDisplayForm"),
                            },
                            attribute: {
                                isLocationIconVisible: true,
                                dfRef: uriRef("/uri/defaultDisplayForm"),
                                locationDisplayFormRef: uriRef("/uri/locationDisplayFormUri"),
                            },
                        },
                    ],
                },
            ] as IDecoratedBuckets;

            const metadata = bucketsToMetadata(decoratedLocationBucket);
            const displayFormUri = visualizationAttributeOf(metadata?.[0]?.items?.[0])?.displayForm?.uri;
            expect(displayFormUri).toBe("/uri/latitudeDisplayForm");
        });

        it("should return metadata with display form uri from other bucket than location", () => {
            const decoratedLocationBucket = [
                {
                    localIdentifier: "segment",
                    accepts: [ATTRIBUTE],
                    items: [
                        {
                            localIdentifier: "segment",
                            isDate: false,
                            isMeasure: false,
                            attribute: {
                                isLocationIconVisible: true,
                                dfRef: uriRef("/uri/displayForm"),
                                locationDisplayFormUri: "/uri/locationDisplayFormUri",
                            },
                        },
                    ],
                },
            ] as IDecoratedBuckets;

            const metadata = bucketsToMetadata(decoratedLocationBucket);
            const displayFormUri = visualizationAttributeOf(metadata?.[0]?.items?.[0])?.displayForm?.uri;
            expect(displayFormUri).toBe("/uri/displayForm");
        });

        it("should preserve selected geo display form in non-location geo-capable bucket", () => {
            const decoratedAttributeBucket = [
                {
                    localIdentifier: BucketNames.ATTRIBUTE,
                    accepts: [ATTRIBUTE, GEO_ATTRIBUTE],
                    items: [
                        {
                            localIdentifier: "attribute",
                            isDate: false,
                            isMeasure: false,
                            attribute: {
                                isLocationIconVisible: true,
                                dfRef: uriRef("/uri/defaultDisplayForm"),
                                displayForm: uriRef("/uri/latitudeDisplayForm"),
                                locationDisplayFormRef: uriRef("/uri/locationDisplayForm"),
                            },
                        },
                    ],
                },
            ] as IDecoratedBuckets;

            const metadata = bucketsToMetadata(decoratedAttributeBucket);
            const displayFormUri = visualizationAttributeOf(metadata?.[0]?.items?.[0])?.displayForm?.uri;
            expect(displayFormUri).toBe("/uri/latitudeDisplayForm");
        });

        it("should prioritize explicit bucket item display form in non-location bucket", () => {
            const decoratedAttributeBucket = [
                {
                    localIdentifier: BucketNames.ATTRIBUTE,
                    accepts: [ATTRIBUTE],
                    items: [
                        {
                            localIdentifier: "attribute",
                            isDate: false,
                            isMeasure: false,
                            // the explicit user choice lives on the RAW item (decorated items
                            // never carried top-level displayForm/dfRef keys)
                            original: {
                                dfRef: uriRef("/uri/latitudeDisplayForm"),
                                displayForm: uriRef("/uri/latitudeDisplayForm"),
                            },
                            attribute: {
                                isLocationIconVisible: true,
                                dfRef: uriRef("/uri/defaultDisplayForm"),
                                displayForm: uriRef("/uri/defaultDisplayForm"),
                                locationDisplayFormRef: uriRef("/uri/locationDisplayForm"),
                            },
                        },
                    ],
                },
            ] as IDecoratedBuckets;

            const metadata = bucketsToMetadata(decoratedAttributeBucket);
            const displayFormUri = visualizationAttributeOf(metadata?.[0]?.items?.[0])?.displayForm?.uri;
            expect(displayFormUri).toBe("/uri/latitudeDisplayForm");
        });

        it("should return metadata with area display form uri from area bucket", () => {
            const decoratedAreaBucket = [
                {
                    localIdentifier: BucketNames.AREA,
                    accepts: [ATTRIBUTE, GEO_ATTRIBUTE],
                    items: [
                        {
                            localIdentifier: "area",
                            isDate: false,
                            isMeasure: false,
                            attribute: {
                                isLocationIconVisible: true,
                                dfRef: uriRef("/uri/displayForm"),
                                areaDisplayFormRef: uriRef("/uri/areaDisplayFormUri"),
                            },
                        },
                    ],
                },
            ] as IDecoratedBuckets;

            const metadata = bucketsToMetadata(decoratedAreaBucket);
            const displayFormUri = visualizationAttributeOf(metadata?.[0]?.items?.[0])?.displayForm?.uri;
            expect(displayFormUri).toBe("/uri/areaDisplayFormUri");
        });
    });
});

describe("getOverTimeComparisonType", () => {
    it("should return type NOTHING for unknown measure definition", () => {
        const derivedBucketItem = {
            measure: {
                definition: {
                    foo: { bar: "baz" },
                },
            },
        };
        const type = getOverTimeComparisonType(
            derivedBucketItem as unknown as Parameters<typeof getOverTimeComparisonType>[0],
        );

        expect(type).toBe(OverTimeComparisonTypes.NOTHING);
    });

    it("should return type SP for popMeasureDefinition", () => {
        const derivedBucketItem = {
            measure: {
                definition: {
                    popMeasureDefinition: { bar: "baz" },
                },
            },
        };
        const type = getOverTimeComparisonType(
            derivedBucketItem as unknown as Parameters<typeof getOverTimeComparisonType>[0],
        );

        expect(type).toBe(OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR);
    });

    it("should return type PP for previousPeriodMeasureDefinition", () => {
        const derivedBucketItem = {
            measure: {
                definition: {
                    previousPeriodMeasure: { bar: "baz" },
                },
            },
        };
        const type = getOverTimeComparisonType(
            derivedBucketItem as unknown as Parameters<typeof getOverTimeComparisonType>[0],
        );

        expect(type).toBe(OverTimeComparisonTypes.PREVIOUS_PERIOD);
    });
});

describe("omitTotalsFromReportMDObj", () => {
    it("should omit totals from report metadata object", () => {
        const reportMDObj: IVisualizationObjectContent = {
            visualizationClass: { uri: "/gdc/md/p/obj/vc" },
            buckets: [
                {
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: { measureDefinition: { item: { uri: "/gdc/md/p/obj/1" } } },
                                alias: "alias",
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m2",
                                definition: { measureDefinition: { item: { uri: "/gdc/md/p/obj/2" } } },
                                alias: "other alias",
                            },
                        },
                    ],
                    localIdentifier: "measures",
                    totals: [{ measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" }],
                },
            ],
        };

        const mdObjWithoutTotals = omitTotalsFromReportMDObj(reportMDObj);

        expect(mdObjWithoutTotals).toEqual({
            visualizationClass: reportMDObj.visualizationClass,
            buckets: [
                {
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: { measureDefinition: { item: { uri: "/gdc/md/p/obj/1" } } },
                                alias: "alias",
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m2",
                                definition: { measureDefinition: { item: { uri: "/gdc/md/p/obj/2" } } },
                                alias: "other alias",
                            },
                        },
                    ],
                    localIdentifier: "measures",
                },
            ],
        });
    });
});

describe("omitAliasFromReportMDObj", () => {
    it("should omit aliases from report metadata object from all measures", () => {
        const reportMDObj: IVisualizationObjectContent = {
            visualizationClass: { uri: "/gdc/md/p/obj/vc" },
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: { measureDefinition: { item: { uri: "/gdc/md/p/obj/1" } } },
                                alias: "alias",
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m2",
                                definition: { measureDefinition: { item: { uri: "/gdc/md/p/obj/2" } } },
                                alias: "other alias",
                            },
                        },
                    ],
                },
            ],
        };

        expect(omitAliasFromReportMDObj(reportMDObj)).toEqual({
            visualizationClass: reportMDObj.visualizationClass,
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: { measureDefinition: { item: { uri: "/gdc/md/p/obj/1" } } },
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m2",
                                definition: { measureDefinition: { item: { uri: "/gdc/md/p/obj/2" } } },
                            },
                        },
                    ],
                },
            ],
        });
    });

    it("should omit aliases from report metadata object from all categories", () => {
        const reportMDObj: IVisualizationObjectContent = {
            visualizationClass: { uri: "/gdc/md/p/obj/vc" },
            buckets: [
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: "v1",
                                displayForm: { uri: "/gdc/md/p/obj/v1" },
                                alias: "alias",
                            },
                        },
                        {
                            visualizationAttribute: {
                                localIdentifier: "v1",
                                displayForm: { uri: "/gdc/md/p/obj/v1" },
                                alias: "other alias",
                            },
                        },
                    ],
                },
            ],
        };

        expect(omitAliasFromReportMDObj(reportMDObj)).toEqual({
            visualizationClass: reportMDObj.visualizationClass,
            buckets: [
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: "v1",
                                displayForm: { uri: "/gdc/md/p/obj/v1" },
                            },
                        },
                        {
                            visualizationAttribute: {
                                localIdentifier: "v1",
                                displayForm: { uri: "/gdc/md/p/obj/v1" },
                            },
                        },
                    ],
                },
            ],
        });
    });
});

describe("omitArithmeticMeasuresMDObj", () => {
    it("should remove arithmetic measures and derived from arithmetic measures", () => {
        const mdObjectContent: IVisualizationObjectContent = {
            visualizationClass: {
                uri: "local:table",
            },
            buckets: [metadataBucketMeasures],
        };

        const omittedMDObject = omitArithmeticMeasuresMDObj(mdObjectContent);
        expect(omittedMDObject).toEqual({
            visualizationClass: {
                uri: "local:table",
            },
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        metadataBucketMeasures.items[0],
                        metadataBucketMeasures.items[1],
                        metadataBucketMeasures.items[2],
                        metadataBucketMeasures.items[3],
                        metadataBucketMeasures.items[4],
                        metadataBucketMeasures.items[5],
                        metadataBucketMeasures.items[6],
                        metadataBucketMeasures.items[7],
                        metadataBucketMeasures.items[14],
                        metadataBucketMeasures.items[15],
                    ],
                },
            ],
        });
    });
});

describe("pickRelevantFromReportMDObj", () => {
    it("should pick only relevant properties from MD object", () => {
        const result = pickRelevantFromReportMDObj({
            visualizationClass: {
                uri: "local:table",
            },
            buckets: [],
            filters: [],
            properties: "property",
            references: { identifier: "ref" },
        });
        expect(result).toEqual({
            buckets: [],
            filters: [],
        });
    });
});

describe("omitIrrelevantPropertiesForAvailability", () => {
    it("should omit properties not relevant to availability API call from MD object", () => {
        const result = omitIrrelevantPropertiesForAvailability({
            visualizationClass: {
                uri: "local:table",
            },
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                alias: "measure",
                                format: "###00.0$",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: "/md/123",
                                        },
                                    },
                                },
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m2",
                                alias: "arithmetic measure",
                                definition: {
                                    arithmeticMeasure: {
                                        measureIdentifiers: ["m1", "m1"],
                                        operator: "sum",
                                    },
                                },
                            },
                        },
                    ],
                },
                {
                    localIdentifier: "attributes",
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: "a1",
                                alias: "attribute",
                                displayForm: {
                                    uri: "/md/attr",
                                },
                            },
                        },
                    ],
                    totals: [
                        {
                            type: "sum",
                            measureIdentifier: "m1",
                            attributeIdentifier: "a1",
                        },
                    ],
                },
            ],
            filters: [],
            properties: "property",
            references: { identifier: "ref" },
        });

        expect(result).toEqual({
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: "/md/123",
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
                {
                    localIdentifier: "attributes",
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: "a1",
                                displayForm: {
                                    uri: "/md/attr",
                                },
                            },
                        },
                    ],
                },
            ],
            filters: [],
        });
    });
});

describe("isMeasureShowOnSecondaryAxis", () => {
    const properties = {
        controls: {
            secondary_yaxis: {
                measures: ["m1"],
            },
        },
    };

    it("should return true when measure identifier is contained in properties", () => {
        const item = {
            measure: {
                localIdentifier: "m1",
                definition: { measureDefinition: { item: { uri: "/gdc/md/m1" } } },
            },
        };

        expect(isMeasureShowOnSecondaryAxis(item, properties)).toEqual(true);
    });

    it("should return false when measure identifier is NOT contained in properties", () => {
        const item = {
            measure: {
                localIdentifier: "m2",
                definition: { measureDefinition: { item: { uri: "/gdc/md/m2" } } },
            },
        };

        expect(isMeasureShowOnSecondaryAxis(item, properties)).toEqual(false);
    });
});
