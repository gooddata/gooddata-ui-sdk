// (C) 2021-2022 GoodData Corporation

import { IDrillToAttributeUrl } from "@gooddata/sdk-model";
import cloneDeep from "lodash/cloneDeep.js";
import { IDrillDownDefinition } from "../../../../types.js";
import { filterDrillFromAttributeByPriority } from "../drillDownUtils.js";
import { describe, it, expect } from "vitest";

describe("filterDrillFromAttributeByPriority", () => {
    const drillToAttributeUrl: IDrillToAttributeUrl = {
        type: "drillToAttributeUrl",
        transition: "new-window",
        origin: {
            type: "drillFromAttribute",
            attribute: {
                localIdentifier: "attributeId",
            },
        },
        target: {
            displayForm: {
                uri: "/gdc/md/referenceworkspace/obj/1067",
            },
            hyperlinkDisplayForm: {
                uri: "/gdc/md/referenceworkspace/obj/1069",
            },
        },
    };

    const drillDown: IDrillDownDefinition = {
        type: "drillDown",
        origin: {
            localIdentifier: "attributeId2",
        },
        target: {
            uri: "some target",
        },
    };

    it("should remove duplicities configured once has priority", () => {
        const drillDefinitions = [drillToAttributeUrl, drillToAttributeUrl];
        const configuredDrills = [drillToAttributeUrl];
        const expectedResult = [drillToAttributeUrl];

        const result = filterDrillFromAttributeByPriority(drillDefinitions, configuredDrills);
        expect(result).toEqual(expectedResult);
    });

    it("should ignore implicit drill and return just configured drill that has priority", () => {
        const drill = cloneDeep(drillToAttributeUrl);
        drill.target.hyperlinkDisplayForm = { uri: "different df than implicit" };

        const drillDefinitions = [drill, drillToAttributeUrl];
        const configuredDrills = [drill];
        const expectedResult = [drill];

        const result = filterDrillFromAttributeByPriority(drillDefinitions, configuredDrills);
        expect(result).toEqual(expectedResult);
    });

    it("should return configured drill that has priority for each origin (Multiple origins drill)", () => {
        const drill = cloneDeep(drillToAttributeUrl);
        drill.target.hyperlinkDisplayForm = { uri: "different df than implicit" };

        const drillDefinitions = [drill, drillToAttributeUrl, drillDown];
        const configuredDrills = [drill];
        const expectedResult = [drill, drillDown];

        const result = filterDrillFromAttributeByPriority(drillDefinitions, configuredDrills);
        expect(result).toEqual(expectedResult);
    });
});
