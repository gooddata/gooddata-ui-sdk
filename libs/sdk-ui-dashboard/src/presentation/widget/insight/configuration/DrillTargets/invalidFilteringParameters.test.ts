// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAttributeFilter,
    areObjRefsEqual,
    filterObjRef,
    idRef,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import {
    dashboardAttributeFilterToPlaceholder,
    displayFormPlaceholderRef,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    placeholderIdentifierText,
} from "@gooddata/sdk-model/internal";

/**
 * The editor sanitizes every filter's display form ref, the parameter panel builds placeholder text,
 * and the invalid-parameter check matches the two back together. All three have to agree on how a
 * computed attribute is named, so they are pinned together here: a placeholder the panel would insert
 * must match the filter the editor sanitized, and must not be reported as invalid.
 */
describe("custom URL filtering parameters for a computed attribute", () => {
    // a computed attribute's display form and a label that happen to share an identifier
    const computedAttributeDf = { id: "shared_id", ref: idRef("shared_id", "computedAttribute") } as never;
    const labelDf = { id: "shared_id", ref: idRef("shared_id", "displayForm") } as never;

    function sanitize(df: never): IAttributeFilter {
        // mirrors useSanitizeAttributeFilter: the ref is rewritten to the canonical placeholder ref
        return newPositiveAttributeFilter(displayFormPlaceholderRef(df), ["a"]);
    }

    function placeholderRefIn(url: string) {
        return getDashboardAttributeFilterPlaceholdersFromUrl(url)[0].ref;
    }

    it("inserts a placeholder that matches the sanitized filter", () => {
        const inserted = dashboardAttributeFilterToPlaceholder(
            displayFormPlaceholderRef(computedAttributeDf),
        );

        expect(inserted).toBe("{dash_attribute_filter_selection(computed_attribute/shared_id)}");

        const filter = sanitize(computedAttributeDf);
        // this is the comparison useInvalidFilteringParametersIdentifiers makes; a mismatch here would
        // report a perfectly good placeholder as an invalid parameter
        expect(
            areObjRefsEqual(displayFormPlaceholderRef(computedAttributeDf), placeholderRefIn(inserted)),
        ).toBe(true);
        expect(areObjRefsEqual(filterObjRef(filter), placeholderRefIn(inserted))).toBe(true);
    });

    it("does not match a label sharing the identifier", () => {
        const inserted = dashboardAttributeFilterToPlaceholder(
            displayFormPlaceholderRef(computedAttributeDf),
        );
        const labelFilter = sanitize(labelDf);

        expect(areObjRefsEqual(filterObjRef(labelFilter), placeholderRefIn(inserted))).toBe(false);
    });

    it("keeps a display form placeholder unprefixed and matching its own filter", () => {
        const inserted = dashboardAttributeFilterToPlaceholder(displayFormPlaceholderRef(labelDf));

        expect(inserted).toBe("{dash_attribute_filter_selection(shared_id)}");

        const filter = sanitize(labelDf);
        expect(areObjRefsEqual(filterObjRef(filter), placeholderRefIn(inserted))).toBe(true);
    });

    it("names an invalid parameter with the text that is actually in the URL", () => {
        // the warning quotes these back to the user, so a stripped identifier would name text the
        // user cannot find anywhere in the URL they wrote
        const url = dashboardAttributeFilterToPlaceholder(displayFormPlaceholderRef(computedAttributeDf));
        const { ref } = getDashboardAttributeFilterPlaceholdersFromUrl(url)[0];

        expect(placeholderIdentifierText(ref)).toBe("computed_attribute/shared_id");
        expect(url).toContain(placeholderIdentifierText(ref));

        expect(placeholderIdentifierText(displayFormPlaceholderRef(labelDf))).toBe("shared_id");
    });
});
