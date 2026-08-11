// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITimezoneSelectSpecialItem, buildListboxItems, getSelectedItemId } from "../TimezoneSelect.js";

const specialItems: ITimezoneSelectSpecialItem[] = [
    { id: undefined, label: "Workspace time zone" },
    { id: "$browserDetected", label: "From browser (Europe/Prague)" },
];

describe("TimezoneSelect listbox items", () => {
    it("should key special items by their unfiltered index so selection survives search", () => {
        // "browser" filters out the first special item; the remaining one must keep its original id
        const items = buildListboxItems(specialItems, "browser", false);
        const browserItem = items.find(
            (item) => item.type === "interactive" && item.stringTitle.startsWith("From browser"),
        );

        expect(browserItem).toMatchObject({ id: "special-item-1" });
        expect(getSelectedItemId("$browserDetected", specialItems)).toBe("special-item-1");
    });

    it("should not let a filtered list re-assign the selected id to a different special item", () => {
        // "Workspace" selected; search keeps only the browser item — nothing may match the selected id
        const items = buildListboxItems(specialItems, "browser", false);
        const selectedId = getSelectedItemId(undefined, specialItems);

        expect(selectedId).toBe("special-item-0");
        expect(items.some((item) => item.type === "interactive" && item.id === selectedId)).toBe(false);
    });

    it("should resolve the selected id of a regular timezone to its IANA id", () => {
        expect(getSelectedItemId("Europe/Prague", specialItems)).toBe("Europe/Prague");
    });
});
