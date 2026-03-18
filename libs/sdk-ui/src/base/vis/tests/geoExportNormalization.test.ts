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
    sortDirection,
} from "@gooddata/sdk-model";

import { BucketNames } from "../../constants/bucketNames.js";
import { prepareGeoInsightForDataExport } from "../geoDataExport.js";
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
