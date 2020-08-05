// (C) 2007-2020 GoodData Corporation
import { removeMetadata } from "../translationUtils";

const translations = {
    "some.key.1": {
        value: "value1",
        comment: "Some comment",
        limit: 0,
    },
    "some.key.2": {
        value: "value2",
        comment: "Some comment",
        limit: 0,
    },
};

const translationsWithoutMetadata = {
    "some.key.1": "value1",
    "some.key.2": "value2",
};

describe("translations removeMetadata", () => {
    it("should remove metadata from translations", () => {
        expect(removeMetadata(translations)).toEqual(translationsWithoutMetadata);
    });
});
