// (C) 2007-2018 GoodData Corporation
import { describe, it, expect } from "vitest";
import { getAttributesDisplayForms } from "../utils.js";
import { mdObjectWithAttributes } from "./utils.fixtures.js";

describe("visualizationObjectHelper", () => {
    describe("getAttributesDisplayForms", () => {
        it("should get all display forms from measure filters and attributes", () => {
            const displayForms = getAttributesDisplayForms(mdObjectWithAttributes);
            expect(displayForms).toEqual(["/gdc/md/proj/df5", "/gdc/md/proj/df1", "/gdc/md/proj/df3"]);
        });
    });
});
