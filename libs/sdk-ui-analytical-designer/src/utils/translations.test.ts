// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { type IntlShape } from "react-intl";
import { describe, expect, it } from "vitest";

import { getCatalogItemTitle } from "./translations.js";

const getTranslatedTitle = (intlId: string) => `translated-${intlId}`;

const fakeIntl = {
    formatMessage: (item: { id: string }) => getTranslatedTitle(item.id),
} as IntlShape;

describe("getCatalogItemTitle", () => {
    it("should return item title", () => {
        const title = "Title";
        const itemWithoutTranslation = {
            title,
        };

        const itemTitle = getCatalogItemTitle(itemWithoutTranslation, fakeIntl);
        expect(itemTitle).toEqual(title);
    });

    it("should return translated item title", () => {
        const title = "title";
        const translatedTitle = getTranslatedTitle(title);
        const itemWithTranslation = {
            title,
            intl: true,
        };

        const itemTitle = getCatalogItemTitle(itemWithTranslation, fakeIntl);
        expect(itemTitle).toEqual(translatedTitle);
    });
});
