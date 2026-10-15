// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DeclarativePublisherPageTemplateV2 } from "./declarativePublisherTypesV2.js";
import { validateDeclarativePublisherEntityV2 } from "./validateDeclarativePublisherEntityV2.js";

const pageTemplate: DeclarativePublisherPageTemplateV2 = {
    id: "two_charts",
    type: "pageTemplate",
    version: "2",
    title: "Two charts",
    content: { layout: { type: "row", children: [] } },
};

describe("validateDeclarativePublisherEntityV2", () => {
    it("accepts a stored entity named by its id", () => {
        expect(validateDeclarativePublisherEntityV2(pageTemplate)).toEqual([]);
    });

    it("reports an issue on the reference on the id", () => {
        expect(validateDeclarativePublisherEntityV2({ ...pageTemplate, id: "default.cover" })).toEqual([
            {
                path: "id",
                message: 'Ids starting with "default." are reserved for the default page templates.',
            },
        ]);
    });

    it("reports a missing id and a reference the stored shape does not have", () => {
        const { id: _, ...withoutId } = pageTemplate;

        expect(validateDeclarativePublisherEntityV2({ ...withoutId, ref: { identifier: "x" } })).toEqual([
            { path: "ref", message: 'Unknown key "ref".' },
            { path: "id", message: 'Missing required key "id".' },
        ]);
    });

    it.each([
        ["an empty string", ""],
        ["an object reference", { identifier: "two_charts" }],
        ["null", null],
    ])("reports an id that is %s", (_, id) => {
        expect(validateDeclarativePublisherEntityV2({ ...pageTemplate, id })).toEqual([
            { path: "id", message: `Expected a non-empty string, got ${JSON.stringify(id)}.` },
        ]);
    });

    it("reports content issues with the validator's paths", () => {
        const issues = validateDeclarativePublisherEntityV2({ ...pageTemplate, version: "3" });

        expect(issues.map(({ path }) => path)).toEqual(["version"]);
    });
});
