// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAttributeDescriptor,
    type IAttributeDisplayFormGeoAreaConfig,
    idRef,
} from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";

import { getLocationCollectionMetadata, resolveGeoCollectionMetadata } from "./geoCollection.js";

const geoAreaConfig: IAttributeDisplayFormGeoAreaConfig = {
    collectionId: "regions",
};

const descriptorWithGeoArea: IAttributeDescriptor = {
    attributeHeader: {
        uri: "/gdc/md/geo.label",
        identifier: "geo.label",
        localIdentifier: "geoAttr",
        ref: idRef("geo.label", "displayForm"),
        name: "Geo Label",
        formOf: {
            ref: idRef("geo.attribute", "attribute"),
            uri: "/gdc/md/geo.attribute",
            identifier: "geo.attribute",
            name: "Geo Attribute",
        },
        primaryLabel: idRef("geo.label", "displayForm"),
        geoAreaConfig,
    },
};

describe("geoCollection utils", () => {
    it("resolveGeoCollectionMetadata returns collection identifier when geoAreaConfig is present", () => {
        expect(resolveGeoCollectionMetadata(descriptorWithGeoArea)).toEqual({
            collectionId: geoAreaConfig.collectionId,
        });
    });

    it("getLocationCollectionMetadata reads first attribute descriptor with geoAreaConfig", () => {
        const dataView = {
            meta: () => ({
                attributeDescriptors: () => [descriptorWithGeoArea],
            }),
        } as unknown as DataViewFacade;

        expect(getLocationCollectionMetadata(dataView)).toEqual({ collectionId: geoAreaConfig.collectionId });
    });
});
