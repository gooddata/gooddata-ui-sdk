// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type JsonApiVisualizationObjectOutDocument,
    type JsonApiVisualizationObjectOutList,
} from "@gooddata/api-client-tiger";
import { type IInsight, uriRef } from "@gooddata/sdk-model";

import { convertInsight } from "../toBackend/InsightConverter.js";

import {
    convertVisualizationObjectsToInsights,
    visualizationObjectDocumentToInsight,
} from "./InsightConverter.js";

const source: IInsight = {
    insight: {
        visualizationUrl: "local:bar",
        title: "Revenue by region",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
        identifier: "insight-1",
        uri: "/insight-1",
        ref: uriRef("/insight-1"),
    },
};

const visualizationObject = {
    id: "insight-1",
    type: "visualizationObject" as const,
    attributes: {
        title: "Revenue by region",
        description: "",
        content: convertInsight(source),
    },
};

describe("visualizationObjectDocumentToInsight", () => {
    it("carries the caller's permissions from the document meta", () => {
        const document: JsonApiVisualizationObjectOutDocument = {
            data: { ...visualizationObject, meta: { permissions: ["EDIT", "VIEW"] } },
            links: { self: "/api/v1/entities/workspaces/ws/visualizationObjects/insight-1" },
        };

        const insight = visualizationObjectDocumentToInsight(document);

        expect(insight.insight.permissions).toEqual(["EDIT", "VIEW"]);
        expect(insight.insight.uri).toBe("/api/v1/entities/workspaces/ws/visualizationObjects/insight-1");
        expect(insight.insight.identifier).toBe("insight-1");
    });

    it("leaves the permissions undefined when they were not requested", () => {
        const document: JsonApiVisualizationObjectOutDocument = { data: visualizationObject };

        expect(visualizationObjectDocumentToInsight(document).insight.permissions).toBeUndefined();
    });
});

describe("convertVisualizationObjectsToInsights", () => {
    it("carries each row's permissions from its meta", () => {
        const list: JsonApiVisualizationObjectOutList = {
            data: [
                { ...visualizationObject, meta: { permissions: ["SHARE", "VIEW"] }, links: { self: "/row" } },
            ],
        };

        const [insight] = convertVisualizationObjectsToInsights(list);

        expect(insight.insight.permissions).toEqual(["SHARE", "VIEW"]);
        expect(insight.insight.uri).toBe("/row");
    });
});
