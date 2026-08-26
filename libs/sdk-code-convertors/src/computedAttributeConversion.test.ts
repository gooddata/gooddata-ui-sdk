// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DeclarativeComputedAttribute } from "@gooddata/api-client-tiger";
import type { ComputedAttribute } from "@gooddata/sdk-code-schemas/v1";

import { declarativeComputedAttributeToYaml } from "./from/declarativeComputedAttributeToYaml.js";
import { yamlComputedAttributeToDeclarative } from "./to/yamlComputedAttributeToDeclarative.js";

const BUCKETING_MAQL =
    'SELECT CASE WHEN {metric/won_activities} > 100 THEN "High" WHEN {metric/won_activities} > 50 THEN "Mid" ELSE "Low" END BY {label/sales_rep.name}';

function makeYaml(overrides: Partial<ComputedAttribute> = {}): ComputedAttribute {
    return {
        type: "computed_attribute",
        id: "rep_performance",
        maql: BUCKETING_MAQL,
        ...overrides,
    } as ComputedAttribute;
}

function makeDeclarative(
    overrides: Partial<DeclarativeComputedAttribute> = {},
): DeclarativeComputedAttribute {
    return {
        id: "rep_performance",
        title: "Rep performance",
        description: "",
        tags: [],
        content: { maql: BUCKETING_MAQL },
        dataType: "STRING",
        valueType: "TEXT",
        ...overrides,
    } as DeclarativeComputedAttribute;
}

describe("computed attribute conversion", () => {
    describe("yamlComputedAttributeToDeclarative", () => {
        it("should convert the minimal definition and default the value type", () => {
            const result = yamlComputedAttributeToDeclarative(makeYaml());

            expect(result).toEqual({
                id: "rep_performance",
                // derived from the id, because the yaml carries no title
                title: "Rep Performance",
                description: "",
                tags: [],
                content: { maql: BUCKETING_MAQL },
                dataType: "STRING",
                valueType: "TEXT",
            });
        });

        it("should keep the explicit title, description, tags and locale", () => {
            const result = yamlComputedAttributeToDeclarative(
                makeYaml({
                    title: "Rep performance",
                    description: "Reps bucketed by won activities",
                    tags: ["Sales"],
                    locale: "en-US",
                }),
            );

            expect(result).toMatchObject({
                title: "Rep performance",
                description: "Reps bucketed by won activities",
                tags: ["Sales"],
                locale: "en-US",
            });
        });

        it("should omit locale when it is not set", () => {
            expect(yamlComputedAttributeToDeclarative(makeYaml())).not.toHaveProperty("locale");
        });
    });

    describe("declarativeComputedAttributeToYaml", () => {
        it("should write the yaml document with the type discriminator and the maql", () => {
            const { content, json } = declarativeComputedAttributeToYaml(makeDeclarative());

            expect(content).toContain("type: computed_attribute");
            expect(content).toContain("id: rep_performance");
            expect(content).toContain("maql:");
            expect(json.type).toEqual("computed_attribute");
            expect(json.maql).toEqual(BUCKETING_MAQL);
        });

        it("should not write out the data and value type defaults", () => {
            const { content } = declarativeComputedAttributeToYaml(makeDeclarative());

            expect(content).not.toContain("dataType");
            expect(content).not.toContain("valueType");
        });

        it("should write out locale when the backend has one", () => {
            const { content, json } = declarativeComputedAttributeToYaml(
                makeDeclarative({ locale: "en-US" }),
            );

            expect(content).toContain("locale: en-US");
            expect(json.locale).toEqual("en-US");
        });
    });

    describe("round trip", () => {
        it("should survive declarative -> yaml -> declarative unchanged", () => {
            const original = makeDeclarative({ description: "Reps bucketed", tags: ["Sales"] });

            const { json } = declarativeComputedAttributeToYaml(original);
            const result = yamlComputedAttributeToDeclarative(json);

            expect(result).toEqual(original);
        });
    });
});
