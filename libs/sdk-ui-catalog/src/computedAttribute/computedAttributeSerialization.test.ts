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

    it("renders an empty maql as a bare key, the create template's state", () => {
        const yaml = serializeComputedAttributeToYaml({
            type: "computed_attribute",
            title: "My computed attribute",
            maql: "",
        });

        expect(yaml).toBe(`type: computed_attribute
title: My computed attribute
description: ""
maql:`);
    });

    it("omits the id line when the computed attribute has none", () => {
        const yaml = serializeComputedAttributeToYaml({
            type: "computed_attribute",
            id: undefined,
            title: "Draft",
            maql: "SELECT 1",
        });
        expect(yaml).not.toContain("id:");
        expect(yaml).toContain("maql: SELECT 1");
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
