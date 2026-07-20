// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAttribute,
    type IAttributeDisplayFormMetadataObject,
    type IBucket,
    type ICatalogAttribute,
    type IInsightDefinition,
    type IInsightLayerDefinition,
    type ObjRef,
    areObjRefsEqual,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    idRef,
    insightBucket,
    isAttribute,
    newAttribute,
    newAttributeSort,
    newMeasure,
    newPositiveAttributeFilter,
    sortDirection,
} from "@gooddata/sdk-model";

import { BucketNames } from "../../constants/bucketNames.js";
import { prepareGeoInsightForDataExport, prepareGeoLayerInsightsForDataExport } from "../geoDataExport.js";
import { normalizeGeoInsightForRawExport } from "../geoExportNormalization.js";
import { isGeoVisualizationUsingNewEngine } from "../isGeoVisualizationUsingNewEngine.js";
import { VisualizationTypes } from "../visualizationTypes.js";

function createDisplayForm(
    id: string,
    attributeId: string,
    { isDefault }: { isDefault?: boolean } = {},
): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        title: id,
        description: "",
        uri: `/${id}`,
        id,
        ref: idRef(id, "displayForm"),
        production: true,
        deprecated: false,
        unlisted: false,
        attribute: idRef(attributeId, "attribute"),
        ...(isDefault ? { isDefault: true } : {}),
    };
}

function createCatalogAttribute(
    attributeId: string,
    displayForms: IAttributeDisplayFormMetadataObject[],
): ICatalogAttribute {
    return {
        type: "attribute",
        attribute: {
            type: "attribute",
            title: attributeId,
            description: "",
            uri: `/${attributeId}`,
            id: attributeId,
            ref: idRef(attributeId, "attribute"),
            production: true,
            deprecated: false,
            unlisted: false,
            displayForms,
        },
        defaultDisplayForm: displayForms[0],
        displayForms,
        geoPinDisplayForms: [],
        groups: [],
    };
}

function createInsight(
    visualizationType: string,
    buckets: IBucket[],
    tooltipText?: string,
    layers?: IInsightLayerDefinition[],
): IInsightDefinition {
    return {
        insight: {
            title: "Test",
            visualizationUrl: `local:${visualizationType}`,
            buckets,
            filters: [],
            sorts: [],
            properties: tooltipText ? { controls: { tooltipText } } : {},
            ...(layers ? { layers } : {}),
        },
    };
}

function createLayer(id: string, type: string, buckets: IBucket[], name?: string): IInsightLayerDefinition {
    return { id, type, buckets, ...(name ? { name } : {}) };
}

function getRequiredBucketAttribute(insight: IInsightDefinition, bucketName: string): IAttribute {
    const bucket = insightBucket(insight, bucketName);
    expect(bucket).toBeDefined();

    const attribute = bucket ? bucketAttribute(bucket) : undefined;
    expect(attribute).toBeDefined();

    if (!attribute) {
        throw new Error(`Expected attribute in ${bucketName} bucket`);
    }

    return attribute;
}

describe("normalizeGeoInsightForRawExport", () => {
    const defaultLabel = createDisplayForm("label.default", "geo", { isDefault: true });
    const areaLabel = createDisplayForm("label.area", "geo");
    const locationLabel = createDisplayForm("label.location", "geo");
    const tooltipLabel = createDisplayForm("label.tooltip", "geo");
    const latitudeLabel = createDisplayForm("label.latitude", "geo");
    const longitudeLabel = createDisplayForm("label.longitude", "geo");
    const catalogAttributes = [
        createCatalogAttribute("geo", [
            defaultLabel,
            areaLabel,
            locationLabel,
            tooltipLabel,
            latitudeLabel,
            longitudeLabel,
        ]),
    ];

    const resolveDefaultDisplayFormRef = (displayFormRef: ObjRef) =>
        catalogAttributes.find((attribute) =>
            attribute.displayForms.some((displayForm) => areObjRefsEqual(displayForm.ref, displayFormRef)),
        )?.defaultDisplayForm.ref;

    it("replaces area export column with the default display form and keeps separate tooltip", () => {
        const insight = createInsight(
            VisualizationTypes.CHOROPLETH,
            [
                {
                    localIdentifier: BucketNames.AREA,
                    items: [
                        newAttribute(idRef("label.area", "displayForm"), (attribute) =>
                            attribute.localId("geo"),
                        ),
                    ],
                },
                {
                    localIdentifier: BucketNames.SEGMENT,
                    items: [
                        newAttribute(idRef("segment.df", "displayForm"), (attribute) =>
                            attribute.localId("segment"),
                        ),
                    ],
                },
                {
                    localIdentifier: BucketNames.COLOR,
                    items: [newMeasure(idRef("measure.color"), (measure) => measure.localId("m_color"))],
                },
            ],
            "label.tooltip",
        );

        const normalizedInsight = normalizeGeoInsightForRawExport(insight, { resolveDefaultDisplayFormRef });

        expect(
            attributeDisplayFormRef(getRequiredBucketAttribute(normalizedInsight, BucketNames.AREA)),
        ).toEqual(defaultLabel.ref);
        expect(
            attributeDisplayFormRef(getRequiredBucketAttribute(normalizedInsight, BucketNames.TOOLTIP_TEXT)),
        ).toEqual(tooltipLabel.ref);
        expect(normalizedInsight.insight.sorts).toHaveLength(1);
        expect(sortDirection(normalizedInsight.insight.sorts[0])).toBe("asc");
        expect(insightBucket(normalizedInsight, BucketNames.SEGMENT)?.items).toHaveLength(1);
        expect(insightBucket(normalizedInsight, BucketNames.COLOR)?.items).toHaveLength(1);
    });

    it("replaces pushpin export column with the default display form and preserves alias and localId", () => {
        const insight = createInsight(VisualizationTypes.PUSHPIN, [
            {
                localIdentifier: BucketNames.LOCATION,
                items: [
                    newAttribute(idRef("label.location", "displayForm"), (attribute) =>
                        attribute.localId("geo_location").alias("City label"),
                    ),
                ],
            },
            {
                localIdentifier: BucketNames.LONGITUDE,
                items: [
                    newAttribute(idRef("label.longitude", "displayForm"), (attribute) =>
                        attribute.localId("geo_longitude"),
                    ),
                ],
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: [
                    newAttribute(idRef("segment.df", "displayForm"), (attribute) =>
                        attribute.localId("segment"),
                    ),
                ],
            },
            {
                localIdentifier: BucketNames.SIZE,
                items: [newMeasure(idRef("measure.size"), (measure) => measure.localId("m_size"))],
            },
            {
                localIdentifier: BucketNames.COLOR,
                items: [newMeasure(idRef("measure.color"), (measure) => measure.localId("m_color"))],
            },
        ]);

        const normalizedInsight = normalizeGeoInsightForRawExport(insight, { resolveDefaultDisplayFormRef });
        const normalizedLocation = getRequiredBucketAttribute(normalizedInsight, BucketNames.LOCATION);

        expect(attributeDisplayFormRef(normalizedLocation)).toEqual(defaultLabel.ref);
        expect(attributeLocalId(normalizedLocation)).toBe("geo_location");
        expect(attributeAlias(normalizedLocation)).toBe("City label");
        expect(normalizedInsight.insight.sorts).toHaveLength(1);
        expect(sortDirection(normalizedInsight.insight.sorts[0])).toBe("asc");
        expect(insightBucket(normalizedInsight, BucketNames.LATITUDE)).toBeUndefined();
        expect(insightBucket(normalizedInsight, BucketNames.LONGITUDE)).toBeUndefined();
        expect(insightBucket(normalizedInsight, BucketNames.SEGMENT)?.items).toHaveLength(1);
        expect(insightBucket(normalizedInsight, BucketNames.SIZE)?.items).toHaveLength(1);
        expect(insightBucket(normalizedInsight, BucketNames.COLOR)?.items).toHaveLength(1);
    });

    it("drops tooltip export when it resolves to the same default label as the primary geo column", () => {
        const insight = createInsight(
            VisualizationTypes.PUSHPIN,
            [
                {
                    localIdentifier: BucketNames.LOCATION,
                    items: [
                        newAttribute(idRef("label.location", "displayForm"), (attribute) =>
                            attribute.localId("geo"),
                        ),
                    ],
                },
            ],
            "label.default",
        );

        const normalizedInsight = normalizeGeoInsightForRawExport(insight, { resolveDefaultDisplayFormRef });

        expect(
            attributeDisplayFormRef(getRequiredBucketAttribute(normalizedInsight, BucketNames.LOCATION)),
        ).toEqual(defaultLabel.ref);
        expect(insightBucket(normalizedInsight, BucketNames.TOOLTIP_TEXT)).toBeUndefined();
    });
});

describe("prepareGeoInsightForDataExport", () => {
    const defaultLabel = createDisplayForm("label.default", "geo", { isDefault: true });
    const areaLabel = createDisplayForm("label.area", "geo");
    const locationLabel = createDisplayForm("label.location", "geo");
    const segmentLabel = createDisplayForm("label.segment", "segment");
    const catalogAttributes = [
        createCatalogAttribute("geo", [defaultLabel, areaLabel, locationLabel]),
        createCatalogAttribute("segment", [segmentLabel]),
    ];

    it("uses root geo buckets before additional layers for layered new-geo export", () => {
        const insight = createInsight(
            VisualizationTypes.CHOROPLETH,
            [
                {
                    localIdentifier: BucketNames.AREA,
                    items: [
                        newAttribute(idRef("label.area", "displayForm"), (attribute) =>
                            attribute.localId("geo"),
                        ),
                    ],
                },
                {
                    localIdentifier: BucketNames.SEGMENT,
                    items: [
                        newAttribute(idRef("label.segment", "displayForm"), (attribute) =>
                            attribute.localId("segment"),
                        ),
                    ],
                },
                {
                    localIdentifier: BucketNames.COLOR,
                    items: [newMeasure(idRef("measure.density"), (measure) => measure.localId("m_density"))],
                },
            ],
            undefined,
            [
                createLayer("layer-1", "pushpin", [
                    {
                        localIdentifier: BucketNames.LOCATION,
                        items: [
                            newAttribute(idRef("label.location", "displayForm"), (attribute) =>
                                attribute.localId("city"),
                            ),
                        ],
                    },
                    {
                        localIdentifier: BucketNames.SIZE,
                        items: [
                            newMeasure(idRef("measure.population"), (measure) =>
                                measure.localId("m_population"),
                            ),
                        ],
                    },
                    {
                        localIdentifier: BucketNames.COLOR,
                        items: [
                            newMeasure(idRef("measure.populationColor"), (measure) =>
                                measure.localId("m_color"),
                            ),
                        ],
                    },
                ]),
            ],
        );

        const preparedInsight = prepareGeoInsightForDataExport(insight, {
            settings: {
                enableGeoArea: true,
                enableNewGeoPushpin: true,
            },
            catalogAttributes,
        });

        expect(preparedInsight).toBeDefined();
        expect(insightBucket(preparedInsight!, BucketNames.MEASURES)?.items).toHaveLength(1);
        expect(insightBucket(preparedInsight!, BucketNames.ATTRIBUTE)?.items).toHaveLength(2);

        const preparedAttributes = insightBucket(preparedInsight!, BucketNames.ATTRIBUTE)?.items ?? [];
        expect(isAttribute(preparedAttributes[1])).toBe(true);
        if (!isAttribute(preparedAttributes[1])) {
            throw new Error("Expected prepared geo primary attribute");
        }
        expect(attributeDisplayFormRef(preparedAttributes[1])).toEqual(defaultLabel.ref);

        const preparedMeasures = insightBucket(preparedInsight!, BucketNames.MEASURES)?.items ?? [];
        expect(preparedMeasures).toHaveLength(1);
    });

    it("filters out stale geo sorts and clears geo properties in prepared table insight", () => {
        const insight = createInsight(
            VisualizationTypes.CHOROPLETH,
            [
                {
                    localIdentifier: BucketNames.AREA,
                    items: [
                        newAttribute(idRef("label.area", "displayForm"), (attribute) =>
                            attribute.localId("geo"),
                        ),
                    ],
                },
                {
                    localIdentifier: BucketNames.COLOR,
                    items: [newMeasure(idRef("measure.density"), (measure) => measure.localId("m_density"))],
                },
            ],
            "label.area",
        );

        insight.insight.sorts = [newAttributeSort("geo")];

        const preparedInsight = prepareGeoInsightForDataExport(insight, {
            settings: {
                enableGeoArea: true,
            },
            catalogAttributes,
        });

        expect(preparedInsight).toBeDefined();
        expect(preparedInsight!.insight.sorts).toEqual([]);
        expect(preparedInsight!.insight.properties).toEqual({});
    });
});

describe("prepareGeoLayerInsightsForDataExport", () => {
    const defaultLabel = createDisplayForm("label.default", "geo", { isDefault: true });
    const areaLabel = createDisplayForm("label.area", "geo");
    const locationLabel = createDisplayForm("label.location", "geo");
    const latitudeLabel = createDisplayForm("label.latitude", "geo");
    const catalogAttributes = [
        createCatalogAttribute("geo", [defaultLabel, areaLabel, locationLabel, latitudeLabel]),
    ];

    const settings = {
        enableGeoArea: true,
        enableNewGeoPushpin: true,
        enableGeoChartA11yImprovements: true,
        enableGeoLayersExport: true,
    };

    const createMultiLayerInsight = () =>
        createInsight(
            VisualizationTypes.CHOROPLETH,
            [
                {
                    localIdentifier: BucketNames.AREA,
                    items: [
                        newAttribute(idRef("label.area", "displayForm"), (attribute) =>
                            attribute.localId("geo"),
                        ),
                    ],
                },
                {
                    localIdentifier: BucketNames.COLOR,
                    items: [newMeasure(idRef("measure.density"), (measure) => measure.localId("m_density"))],
                },
            ],
            undefined,
            [
                createLayer(
                    "layer-1",
                    "pushpin",
                    [
                        {
                            localIdentifier: BucketNames.LOCATION,
                            items: [
                                newAttribute(idRef("label.location", "displayForm"), (attribute) =>
                                    attribute.localId("city"),
                                ),
                            ],
                        },
                        {
                            localIdentifier: BucketNames.SIZE,
                            items: [
                                newMeasure(idRef("measure.population"), (measure) =>
                                    measure.localId("m_population"),
                                ),
                            ],
                        },
                    ],
                    "Cities",
                ),
            ],
        );

    it("returns one table insight per layer with root first", () => {
        const layerInsights = prepareGeoLayerInsightsForDataExport(createMultiLayerInsight(), {
            settings,
            catalogAttributes,
        });

        expect(layerInsights).toBeDefined();
        expect(layerInsights).toHaveLength(2);

        const [root, cities] = layerInsights!;
        expect(root.layerId).toBe("root");
        expect(root.layerName).toBe("Test");
        expect(root.tableInsight.insight.visualizationUrl).toBe("local:table");
        // root (area) layer: 1 measure + 1 primary attribute
        expect(insightBucket(root.tableInsight, BucketNames.MEASURES)?.items).toHaveLength(1);
        expect(insightBucket(root.tableInsight, BucketNames.ATTRIBUTE)?.items).toHaveLength(1);

        expect(cities.layerId).toBe("layer-1");
        expect(cities.layerName).toBe("Cities");
        expect(cities.tableInsight.insight.visualizationUrl).toBe("local:table");
        // pushpin layer: 1 measure + 1 primary attribute
        expect(insightBucket(cities.tableInsight, BucketNames.MEASURES)?.items).toHaveLength(1);
        expect(insightBucket(cities.tableInsight, BucketNames.ATTRIBUTE)?.items).toHaveLength(1);

        // the geo label was replaced with the default display form under a new local id;
        // the mapping lets callers remap local-id filter references accordingly
        expect(root.attributeLocalIdMapping).toEqual({ geo: "geo_table_default_label" });
        expect(cities.attributeLocalIdMapping).toEqual({ city: "city_table_default_label" });
    });

    it("returns undefined for a non-geo insight", () => {
        const insight = createInsight(VisualizationTypes.TABLE, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [newMeasure(idRef("measure.density"), (measure) => measure.localId("m_density"))],
            },
        ]);

        expect(
            prepareGeoLayerInsightsForDataExport(insight, { settings, catalogAttributes }),
        ).toBeUndefined();
    });

    it("returns undefined when the new-geo engine flags are off", () => {
        expect(
            prepareGeoLayerInsightsForDataExport(createMultiLayerInsight(), {
                settings: { enableGeoChartA11yImprovements: true, enableGeoLayersExport: true },
                catalogAttributes,
            }),
        ).toBeUndefined();
    });

    it("returns undefined when enableGeoChartA11yImprovements is off", () => {
        expect(
            prepareGeoLayerInsightsForDataExport(createMultiLayerInsight(), {
                settings: { enableGeoArea: true, enableNewGeoPushpin: true, enableGeoLayersExport: true },
                catalogAttributes,
            }),
        ).toBeUndefined();
    });

    it("returns undefined when enableGeoLayersExport is off", () => {
        expect(
            prepareGeoLayerInsightsForDataExport(createMultiLayerInsight(), {
                settings: {
                    enableGeoArea: true,
                    enableNewGeoPushpin: true,
                    enableGeoChartA11yImprovements: true,
                },
                catalogAttributes,
            }),
        ).toBeUndefined();
    });

    it("combines layer-specific filters with the root insight's and applies layer sorts", () => {
        const rootFilter = newPositiveAttributeFilter(idRef("root.df", "displayForm"), ["A"]);
        const layerFilter = newPositiveAttributeFilter(idRef("layer.df", "displayForm"), ["B"]);
        const layerBuckets = [
            {
                localIdentifier: BucketNames.LOCATION,
                items: [
                    newAttribute(idRef("label.location", "displayForm"), (attribute) =>
                        attribute.localId("city"),
                    ),
                ],
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: [
                    newAttribute(idRef("segment.df", "displayForm"), (attribute) => attribute.localId("seg")),
                ],
            },
        ];
        const insight = createMultiLayerInsight();
        insight.insight.filters = [rootFilter];
        insight.insight.layers = [
            {
                ...createLayer("layer-1", "pushpin", layerBuckets, "Own filters"),
                filters: [layerFilter],
                sorts: [newAttributeSort("seg")],
            },
            createLayer("layer-2", "pushpin", layerBuckets, "Inherited"),
        ];

        const layerInsights = prepareGeoLayerInsightsForDataExport(insight, { settings, catalogAttributes });

        expect(layerInsights).toHaveLength(3);
        const [root, ownFilters, inherited] = layerInsights!;
        // root keeps the root insight's filters
        expect(root.tableInsight.insight.filters).toEqual([rootFilter]);
        // layer with its own filters combines them with the root insight's (as at render)
        expect(ownFilters.tableInsight.insight.filters).toEqual([layerFilter, rootFilter]);
        expect(ownFilters.tableInsight.insight.sorts).toEqual([newAttributeSort("seg")]);
        // layer without its own filters gets the root insight's
        expect(inherited.tableInsight.insight.filters).toEqual([rootFilter]);
    });

    it("falls back to a single root entry when there are no additional layers", () => {
        const insight = createInsight(VisualizationTypes.CHOROPLETH, [
            {
                localIdentifier: BucketNames.AREA,
                items: [
                    newAttribute(idRef("label.area", "displayForm"), (attribute) => attribute.localId("geo")),
                ],
            },
            {
                localIdentifier: BucketNames.COLOR,
                items: [newMeasure(idRef("measure.density"), (measure) => measure.localId("m_density"))],
            },
        ]);

        const layerInsights = prepareGeoLayerInsightsForDataExport(insight, { settings, catalogAttributes });

        expect(layerInsights).toHaveLength(1);
        expect(layerInsights![0].layerId).toBe("root");
    });

    it("exports pushpin layers persisted with latitude/longitude buckets instead of location", () => {
        const insight = createMultiLayerInsight();
        insight.insight.layers = [
            createLayer(
                "layer-latlng",
                "pushpin",
                [
                    {
                        localIdentifier: BucketNames.LATITUDE,
                        items: [
                            newAttribute(idRef("label.latitude", "displayForm"), (attribute) =>
                                attribute.localId("lat"),
                            ),
                        ],
                    },
                    {
                        localIdentifier: BucketNames.LONGITUDE,
                        items: [
                            newAttribute(idRef("label.longitude", "displayForm"), (attribute) =>
                                attribute.localId("lng"),
                            ),
                        ],
                    },
                    {
                        localIdentifier: BucketNames.SIZE,
                        items: [
                            newMeasure(idRef("measure.population"), (measure) =>
                                measure.localId("m_population"),
                            ),
                        ],
                    },
                ],
                "LatLng",
            ),
        ];

        const layerInsights = prepareGeoLayerInsightsForDataExport(insight, { settings, catalogAttributes });

        expect(layerInsights).toHaveLength(2);
        const [, latLng] = layerInsights!;
        expect(latLng.layerId).toBe("layer-latlng");
        // the latitude attribute is the effective location attribute; it is exported under
        // the default display form of its attribute
        const attributes = insightBucket(latLng.tableInsight, BucketNames.ATTRIBUTE)?.items ?? [];
        expect(attributes).toHaveLength(1);
        expect(isAttribute(attributes[0])).toBe(true);
        if (!isAttribute(attributes[0])) {
            throw new Error("Expected the exported latitude attribute");
        }
        expect(attributeDisplayFormRef(attributes[0])).toEqual(defaultLabel.ref);
        expect(latLng.attributeLocalIdMapping).toEqual({ lat: "lat_table_default_label" });
    });
});

describe("isGeoVisualizationUsingNewEngine", () => {
    it("returns true for new geo pushpin", () => {
        expect(
            isGeoVisualizationUsingNewEngine(VisualizationTypes.PUSHPIN, {
                enableNewGeoPushpin: true,
            }),
        ).toBe(true);
    });

    it("returns true for new geo area chart", () => {
        expect(
            isGeoVisualizationUsingNewEngine(VisualizationTypes.CHOROPLETH, {
                enableGeoArea: true,
            }),
        ).toBe(true);
    });

    it("returns false for regular area chart", () => {
        expect(
            isGeoVisualizationUsingNewEngine(VisualizationTypes.AREA, {
                enableGeoArea: true,
            }),
        ).toBe(false);
    });

    it("returns false for legacy geo", () => {
        expect(
            isGeoVisualizationUsingNewEngine(VisualizationTypes.PUSHPIN, {
                enableNewGeoPushpin: false,
            }),
        ).toBe(false);
    });
});
