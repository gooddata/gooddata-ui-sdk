// (C) 2019-2022 GoodData Corporation

import {
    getAttributeIdentifiersPlaceholdersFromUrl,
    joinDrillUrlParts,
    splitDrillUrlParts,
} from "../drillUrl.js";

describe("drill url placeholders", () => {
    it("should extracted placeholders", () => {
        const attributeIdentifiers = getAttributeIdentifiersPlaceholdersFromUrl(
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}",
        );
        expect(attributeIdentifiers).toMatchSnapshot();
    });

    it("should split and join parts", () => {
        const url =
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}";

        const urlParts = splitDrillUrlParts(url);
        expect(urlParts).toMatchSnapshot();

        expect(joinDrillUrlParts(urlParts)).toBe(url);
    });

    it("should accept string in join (back compatibility with old saved dashboards)", () => {
        const url =
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}";

        expect(joinDrillUrlParts(url)).toBe(url);
    });
});
