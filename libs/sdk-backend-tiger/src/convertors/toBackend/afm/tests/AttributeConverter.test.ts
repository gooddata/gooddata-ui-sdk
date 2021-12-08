// (C) 2020-2021 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newAttribute } from "@gooddata/sdk-model";

import { convertAttribute } from "../AttributeConverter";

describe("attribute converter", () => {
    const displayFormRef = ReferenceMd.Account.Name.attribute.displayForm;
    const Scenarios: Array<[string, any]> = [
        ["simple attribute", newAttribute(displayFormRef)],
        ["attribute with empty localId", newAttribute(displayFormRef, (a) => a.localId(""))],
        ["attribute with alias", newAttribute(displayFormRef, (m) => m.alias("alias"))],
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
