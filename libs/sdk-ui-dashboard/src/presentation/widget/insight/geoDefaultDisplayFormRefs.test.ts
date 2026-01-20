// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDisplayFormMetadataObject,
    type IBucket,
    type ICatalogAttribute,
    type IInsight,
    type ISettings,
    idRef,
    newAttribute,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { getGeoDefaultDisplayFormRefs } from "./geoDefaultDisplayFormRefs.js";

function createDisplayForm(
    id: string,
    attributeId: string,
    { isDefault, isPrimary }: { isDefault?: boolean; isPrimary?: boolean } = {},
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
        ...(isPrimary ? { isPrimary: true } : {}),
    };
}

function createCatalogAttribute(
    attributeId: string,
    displayForms: IAttributeDisplayFormMetadataObject[],
): ICatalogAttribute {
    const attributeDisplayForms = displayForms;
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
            displayForms: attributeDisplayForms,
        },
        defaultDisplayForm: attributeDisplayForms[0],
        displayForms: attributeDisplayForms,
        geoPinDisplayForms: [],
        groups: [],
    };
}

function createInsight(visualizationUrl: string, buckets: IBucket[]): IInsight {
    return {
        insight: {
            title: "Test",
            visualizationUrl,
            buckets,
            filters: [],
            sorts: [],
            properties: {},
            identifier: "test",
            uri: "/test",
            ref: idRef("test"),
        },
    };
}

describe("getGeoDefaultDisplayFormRefs", () => {
    it("maps choropleth area display form to default label", () => {
        const defaultLabel = createDisplayForm("label.default", "attr", { isDefault: true });
        const areaLabel = createDisplayForm("label.area", "attr");
        const catalogAttributes = [createCatalogAttribute("attr", [defaultLabel, areaLabel])];

        const insight = createInsight(`local:${VisualizationTypes.CHOROPLETH}`, [
            {
                localIdentifier: BucketNames.AREA,
                items: [newAttribute(idRef("label.area", "displayForm"))],
            },
        ]);
        const settings: ISettings = { enableGeoArea: true };

        const result = getGeoDefaultDisplayFormRefs(insight, settings, catalogAttributes);
        const key = serializeObjRef(idRef("label.area", "displayForm"));
        expect(result?.get(key)).toEqual(defaultLabel.ref);
    });

    it("maps pushpin location display form to default label using preloaded attributes", () => {
        const defaultLabel = createDisplayForm("label.default", "attr", { isDefault: true });
        const locationLabel = createDisplayForm("label.location", "attr");
        const preloaded: IAttributeWithReferences[] = [
            {
                attribute: {
                    type: "attribute",
                    title: "attr",
                    description: "",
                    uri: "/attr",
                    id: "attr",
                    ref: idRef("attr", "attribute"),
                    production: true,
                    deprecated: false,
                    unlisted: false,
                    displayForms: [defaultLabel, locationLabel],
                },
            },
        ];

        const insight = createInsight(`local:${VisualizationTypes.PUSHPIN}`, [
            {
                localIdentifier: BucketNames.LOCATION,
                items: [newAttribute(idRef("label.location", "displayForm"))],
            },
        ]);
        const settings: ISettings = { enableNewGeoPushpin: true };

        const result = getGeoDefaultDisplayFormRefs(insight, settings, [], preloaded);
        const key = serializeObjRef(idRef("label.location", "displayForm"));
        expect(result?.get(key)).toEqual(defaultLabel.ref);
    });

    it("maps pushpin location display form using catalog geoPinDisplayForms", () => {
        const defaultLabel = createDisplayForm("label.default", "attr", { isDefault: true });
        const locationLabel = createDisplayForm("label.location", "attr");
        const catalogAttributes = [
            {
                ...createCatalogAttribute("attr", [defaultLabel]),
                geoPinDisplayForms: [locationLabel],
            },
        ];

        const insight = createInsight(`local:${VisualizationTypes.PUSHPIN}`, [
            {
                localIdentifier: BucketNames.LOCATION,
                items: [newAttribute(idRef("label.location", "displayForm"))],
            },
        ]);
        const settings: ISettings = { enableNewGeoPushpin: true };

        const result = getGeoDefaultDisplayFormRefs(insight, settings, catalogAttributes);
        const key = serializeObjRef(idRef("label.location", "displayForm"));
        expect(result?.get(key)).toEqual(defaultLabel.ref);
    });

    it("returns undefined when geo flags are off or insight is not geo", () => {
        const defaultLabel = createDisplayForm("label.default", "attr", { isDefault: true });
        const areaLabel = createDisplayForm("label.area", "attr");
        const catalogAttributes = [createCatalogAttribute("attr", [defaultLabel, areaLabel])];

        const insight = createInsight("local:bar", [
            {
                localIdentifier: BucketNames.ATTRIBUTE,
                items: [newAttribute(idRef("label.area", "displayForm"))],
            },
        ]);
        const settings: ISettings = { enableGeoArea: true };

        expect(getGeoDefaultDisplayFormRefs(insight, settings, catalogAttributes)).toBeUndefined();
        expect(getGeoDefaultDisplayFormRefs(insight, {}, catalogAttributes)).toBeUndefined();
    });
});
