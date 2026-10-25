// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { removeMetadata } from "@gooddata/util";

import rawTranslations from "../../../translations/en-US.json" with { type: "json" };

import { EmptySearchResult } from "./EmptySearchResult.js";

const translations = removeMetadata(rawTranslations);

describe("EmptySearchResult", () => {
    it("should render not found string", () => {
        const searchPhrase = "search phrase";

        const { container } = render(
            <IntlProvider locale="en-US" messages={translations}>
                <EmptySearchResult searchPhrase={searchPhrase} />
            </IntlProvider>,
        );

        const notFoundString = container.querySelector(".s-not-matching-message").textContent;
        expect(notFoundString).toContain(searchPhrase);
        expect(notFoundString).toContain("No data matching");
    });
});
