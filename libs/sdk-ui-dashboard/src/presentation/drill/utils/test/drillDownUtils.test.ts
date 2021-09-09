// (C) 2021 GoodData Corporation

import { IDrillToAttributeUrl } from "@gooddata/sdk-backend-spi";
import cloneDeep from "lodash/cloneDeep";
import { IDrillDownDefinition } from "../../../../types";
import { filterDrillFromAttributeByPriority } from "../drillDownUtils";

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

    it("should remove duplicities configured once has priority", async () => {
        const drillDefinitions = [drillToAttributeUrl, drillToAttributeUrl];
        const configuredDrills = [drillToAttributeUrl];
        const expectedResult = [drillToAttributeUrl];

        const result = filterDrillFromAttributeByPriority(drillDefinitions, configuredDrills);
        expect(result).toEqual(expectedResult);
    });

    it("should configured once has priority", async () => {
        const drill = cloneDeep(drillToAttributeUrl);
        drill.target.hyperlinkDisplayForm = { uri: "different df than implicit" };

        const drillDefinitions = [drill, drillToAttributeUrl];
        const configuredDrills = [drill];
        const expectedResult = [drill];

        const result = filterDrillFromAttributeByPriority(drillDefinitions, configuredDrills);
        expect(result).toEqual(expectedResult);
    });

    it("should configured once has priority for its origin (Multiple origins drill)", async () => {
        const drill = cloneDeep(drillToAttributeUrl);
        drill.target.hyperlinkDisplayForm = { uri: "different df than implicit" };

        const drillDefinitions = [drill, drillToAttributeUrl, drillDown];
        const configuredDrills = [drill];
        const expectedResult = [drill, drillDown];

        const result = filterDrillFromAttributeByPriority(drillDefinitions, configuredDrills);
        expect(result).toEqual(expectedResult);
    });
});
