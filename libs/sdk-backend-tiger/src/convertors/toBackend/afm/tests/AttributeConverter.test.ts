// (C) 2020-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newAttribute } from "@gooddata/sdk-model";

import { convertAttribute } from "../AttributeConverter.js";

describe("attribute converter", () => {
    const displayFormRef = ReferenceMd.Account.Name.attribute.displayForm;
    const Scenarios: Array<[string, any]> = [
        ["simple attribute", newAttribute(displayFormRef)],
        ["attribute with empty localId", newAttribute(displayFormRef, (a) => a.localId(""))],
        ["attribute with alias", newAttribute(displayFormRef, (m) => m.alias("alias"))],
        ["attribute with show all values", newAttribute(displayFormRef, (m) => m.showAllValues(true))],
    ];

    it.each(Scenarios)("should return %s", (_desc, input) => {
        expect(convertAttribute(input, 0)).toMatchSnapshot();
    });

    it("should throw an error when toObjQualifier gets an URI ref", () => {
        expect(() => {
            convertAttribute(newAttribute({ uri: "/foo" }), 0);
        }).toThrowErrorMatchingSnapshot();
    });
});
