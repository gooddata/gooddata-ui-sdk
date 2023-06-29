// (C) 2019-2022 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { uriRef, CatalogItem } from "@gooddata/sdk-model";
import { filterAvailableItems } from "../availableItemsFactory.js";
import { describe, expect, it } from "vitest";

describe("available item filtering", () => {
    describe("item filtering", () => {
        /*
         * Note: reference workspace is created from bear. The 'refs' are thus UriRefs as that's what bear returns;
         * the filtering must thus use uriRefs for available items.
         *
         * This does not diminish the benefit of those tests as they do not verify ref matching itself but rather
         * whether simple objects or composite objects are filtered in correctly.
         */
        const AllItems: CatalogItem[] = ReferenceRecordings.Recordings.metadata.catalog.items;

        it("should return empty result if none match", () => {
            expect(filterAvailableItems([uriRef("nonsense")], AllItems)).toEqual([]);
        });
        it("should filter-in simple object if ref matches", () => {
            expect(
                filterAvailableItems([uriRef("/gdc/md/referenceworkspace/obj/1267")], AllItems),
            ).toMatchSnapshot();
        });

        it("should filter-in date dataset if attribute ref matches", () => {
            expect(
                filterAvailableItems([uriRef("/gdc/md/referenceworkspace/obj/827")], AllItems),
            ).toMatchSnapshot();
        });
    });
});
