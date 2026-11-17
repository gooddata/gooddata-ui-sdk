// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IEffectiveSettings } from "@gooddata/sdk-pluggable-application-model";

import { canSearchDocuments, getSearchObjectTypes } from "./searchObjectTypes.js";

const DOCUMENT_FLAGS = {
    enableBusinessBriefingReportsApp: true,
    enablePublisherV2: true,
    enableCatalogDocuments: true,
};

describe("canSearchDocuments", () => {
    it("is true when all document flags are on", () => {
        expect(canSearchDocuments(DOCUMENT_FLAGS as IEffectiveSettings)).toBe(true);
    });

    it.each([
        ["reports app off", { ...DOCUMENT_FLAGS, enableBusinessBriefingReportsApp: false }],
        ["publisher v2 off", { ...DOCUMENT_FLAGS, enablePublisherV2: false }],
        ["catalog documents off", { ...DOCUMENT_FLAGS, enableCatalogDocuments: false }],
        ["no flags", {}],
    ])("is false when %s", (_, settings) => {
        expect(canSearchDocuments(settings as IEffectiveSettings)).toBe(false);
    });
});

describe("getSearchObjectTypes", () => {
    it("returns dashboards and visualizations by default", () => {
        expect(getSearchObjectTypes({ canManage: false, includeDocuments: false })).toEqual([
            "dashboard",
            "visualization",
        ]);
    });

    it("adds metrics for users who can manage the workspace", () => {
        expect(getSearchObjectTypes({ canManage: true, includeDocuments: false })).toEqual([
            "dashboard",
            "visualization",
            "metric",
        ]);
    });

    it("adds documents when document search is enabled", () => {
        expect(getSearchObjectTypes({ canManage: false, includeDocuments: true })).toEqual([
            "dashboard",
            "visualization",
            "document",
        ]);
    });
});
