// (C) 2007-2024 GoodData Corporation
import { describe, it, expect } from "vitest";
import { transformToTypescript } from "../toTypescript.js";
import { WorkspaceMetadata } from "../../base/types.js";

function createObjMetaMock(title: string) {
    return {
        title,
        identifier: `identifier-${title}`,
        tags: `tags-${title}`,
    };
}

function createFactMock(title: string) {
    return {
        fact: {
            meta: createObjMetaMock(title),
        },
    };
}

function createMetricMock(title: string) {
    return {
        metric: {
            meta: createObjMetaMock(title),
        },
    };
}

function createAttributeMock(title: string) {
    return {
        attribute: {
            content: {
                displayForms: [],
            },
            meta: createObjMetaMock(title),
        },
    };
}

const projectMeta: WorkspaceMetadata = {
    workspaceId: "workspaceId",
    catalog: {
        attributes: [createAttributeMock("attribute1")],
        metrics: [createMetricMock("metric1"), createMetricMock("metric2")],
        facts: [createFactMock("fact1")],
    },
    dateDataSets: [],
    insights: [createObjMetaMock("insight1")],
    analyticalDashboards: [],
};

describe("transformToTypescript", () => {
    it("creates new catalog", async () => {
        const transformResult = transformToTypescript(await projectMeta, "testOutput.ts");

        /*
         * NOTE: source.getFullText() should not be used here as it includes the leading comments that
         * contains timestamp describing when was the file generated.
         */
        expect(transformResult.sourceFile.getText()).toMatchSnapshot();
    });
});
