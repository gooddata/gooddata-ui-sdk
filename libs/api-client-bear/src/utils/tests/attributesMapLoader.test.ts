// (C) 2007-2018 GoodData Corporation
import "isomorphic-fetch";
import { describe, afterEach, expect, it } from "vitest";

import fetchMock from "fetch-mock/esm/client.js";

import { AttributesMapLoaderModule, getMissingUrisInAttributesMap } from "../attributesMapLoader.js";
import { XhrModule } from "../../xhr.js";
import { MetadataModule } from "../../metadata.js";
import * as fixtures from "./attributesMapLoader.fixtures.js";

const createAttributesMapLoader = () =>
    new AttributesMapLoaderModule(new MetadataModule(new XhrModule(fetch, {})));

describe("loadAttributesMap", () => {
    const projectId = "mockProject";

    function setupFetchMock() {
        let callCount = 0;
        const twoCallsMatcher = () => {
            if (callCount === 0) {
                callCount = 1;
                return {
                    status: 200,
                    body: JSON.stringify({
                        objects: {
                            items: fixtures.displayForms,
                        },
                    }),
                };
            }

            return {
                status: 200,
                body: JSON.stringify({
                    objects: {
                        items: fixtures.attributeObjects,
                    },
                }),
            };
        };
        fetchMock.mock(`/gdc/md/${projectId}/objects/get`, twoCallsMatcher);
    }

    afterEach(() => {
        fetchMock.restore();
    });

    it("returns empty map for empty list of URIs", () => {
        return createAttributesMapLoader()
            .loadAttributesMap(projectId, [])
            .then((attributesMap: any) => expect(attributesMap).toEqual({}));
    });

    it("returns map with keys generated from input URIs", () => {
        const URIs = [`/gdc/internal/projects/${projectId}/1028`, `/gdc/internal/projects/${projectId}/43`];

        setupFetchMock();

        return createAttributesMapLoader()
            .loadAttributesMap(projectId, URIs)
            .then((attributesMap: any) => expect(attributesMap).toEqual(fixtures.attributesMap));
    });
});

describe("getMissingUrisInAttributesMap", () => {
    it("should return all uris in displayforms uris", () => {
        expect(getMissingUrisInAttributesMap(fixtures.displayFormUris, {})).toEqual(fixtures.displayFormUris);
    });

    it("should return only one missing uri", () => {
        const attributesMap = {
            "/gdc/md/mockProject/obj/1028": {},
        };

        expect(getMissingUrisInAttributesMap(fixtures.displayFormUris, attributesMap)).toEqual([
            "/gdc/md/mockProject/obj/43",
        ]);
    });

    it("should return empty array when all uris are present in attributes map", () => {
        const attributesMap = {
            "/gdc/md/mockProject/obj/1028": {},
            "/gdc/md/mockProject/obj/43": {},
        };

        expect(getMissingUrisInAttributesMap(fixtures.displayFormUris, attributesMap)).toEqual([]);
    });

    it("should return empty array when displayforms uris are empty", () => {
        const attributesMap = {
            "/gdc/md/mockProject/obj/1028": {},
            "/gdc/md/mockProject/obj/43": {},
        };

        expect(getMissingUrisInAttributesMap([], attributesMap)).toEqual([]);
    });
});
