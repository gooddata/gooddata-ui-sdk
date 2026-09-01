// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { definitionToComputedAttributeYaml } from "./computedAttributeConverter.js";
import { serializeComputedAttributeToYaml } from "./computedAttributeSerialization.js";
import { validateComputedAttributeYaml } from "./computedAttributeValidation.js";

const MAQL = 'SELECT CASE WHEN {metric/won_activities} > 50 THEN "High" ELSE "Low" END';

describe("serializeComputedAttributeToYaml", () => {
    it("renders the canonical field order as a gap-free document, maql last", () => {
        const yaml = serializeComputedAttributeToYaml({
            type: "computed_attribute",
            id: "rep_performance",
            title: "Rep Performance",
            description: "Sales rep performance band",
            tags: ["sales"],
            maql: MAQL,
            locale: "en-US",
        });

        expect(yaml).toBe(`id: rep_performance
type: computed_attribute
title: Rep Performance
description: Sales rep performance band
tags:
  - sales
locale: en-US
maql: ${MAQL}`);
    });

    it("renders an empty description as a quoted blank so the field is offered", () => {
        const yaml = serializeComputedAttributeToYaml({
            type: "computed_attribute",
            title: "Draft",
            maql: MAQL,
        });

        expect(yaml).toContain(`description: ""`);
    });

    it("renders an empty maql as a key with a trailing space, so typing is valid YAML", () => {
        const yaml = serializeComputedAttributeToYaml({
            type: "computed_attribute",
            title: "My computed attribute",
            maql: "",
        });

        expect(yaml).toBe(`id: 
type: computed_attribute
title: My computed attribute
description: ""
maql: `);
    });

    it("offers an empty id line when the computed attribute has none, so the author can choose one", () => {
        const yaml = serializeComputedAttributeToYaml({
            type: "computed_attribute",
            id: undefined,
            title: "Draft",
            maql: "SELECT 1",
        });
        expect(yaml.split("\n")[0]).toBe("id: ");
        expect(yaml).toContain("maql: SELECT 1");
    });

    it("leaves an untouched id line out of the validated computed attribute, for the server to derive", () => {
        const yaml = serializeComputedAttributeToYaml({
            type: "computed_attribute",
            title: "Draft",
            maql: "SELECT 1",
        });

        const result = validateComputedAttributeYaml(yaml);

        expect(result.isValid).toBe(true);
        expect(result.isValid && result.computedAttribute).not.toHaveProperty("id");
    });

    it("emits locale only when one is set", () => {
        expect(
            serializeComputedAttributeToYaml({
                type: "computed_attribute",
                id: "ca",
                title: "CA",
                maql: "SELECT 1",
            }),
        ).not.toContain("locale");
    });

    it("round-trips a computed attribute through serialize and validate", () => {
        const yaml = serializeComputedAttributeToYaml(
            definitionToComputedAttributeYaml({
                type: "computedAttribute",
                id: "rep_performance",
                title: "Rep Performance",
                description: "Band",
                tags: ["sales"],
                expression: MAQL,
            }),
        );

        expect(validateComputedAttributeYaml(yaml)).toEqual({
            isValid: true,
            computedAttribute: {
                type: "computedAttribute",
                id: "rep_performance",
                title: "Rep Performance",
                description: "Band",
                tags: ["sales"],
                expression: MAQL,
            },
        });
    });
});
