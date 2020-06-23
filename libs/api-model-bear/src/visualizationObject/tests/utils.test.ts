// (C) 2007-2018 GoodData Corporation
import { getAttributesDisplayForms } from "../utils";
import { mdObjectWithAttributes } from "./utils.fixtures";

describe("visualizationObjectHelper", () => {
    describe("getAttributesDisplayForms", () => {
        it("should get all display forms from measure filters and attributes", () => {
            const displayForms = getAttributesDisplayForms(mdObjectWithAttributes);
            expect(displayForms).toEqual(["/gdc/md/proj/df5", "/gdc/md/proj/df1", "/gdc/md/proj/df3"]);
        });
    });
});
