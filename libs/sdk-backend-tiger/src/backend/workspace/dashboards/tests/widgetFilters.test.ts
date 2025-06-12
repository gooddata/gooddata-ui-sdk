// (C) 2020-2021 GoodData Corporation
import {
    idRef,
    isUriRef,
    newAllTimeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    uriRef,
} from "@gooddata/sdk-model";
import { resolveWidgetFilters } from "../widgetFilters.js";
import { describe, expect, it } from "vitest";

describe("resolveWidgetFilters", () => {
    const objRefsToIdentifiersMock: Parameters<typeof resolveWidgetFilters>[3] = (refs) =>
        Promise.resolve(
            refs.map((ref) => {
                if (isUriRef(ref)) {
                    const regex = /\/([^/]+)\/?$/;
                    const matches = regex.exec(ref.uri);
                    if (!matches) {
                        throw new Error(`Unexpected URI: "${ref.uri}"`);
                    }
                    return matches[1];
                }
                return ref.identifier;
            }),
        );

    it("should return all attribute filters if ignoredFilters are empty", async () => {
        const filterToKeep = newPositiveAttributeFilter(idRef("to-keep"), ["foo"]);

        const filters = [filterToKeep];

        const actual = await resolveWidgetFilters(filters, [], undefined, objRefsToIdentifiersMock);

        expect(actual).toEqual([filterToKeep]);
    });

    it("should remove ignored attribute filters", async () => {
        const filterToKeep = newPositiveAttributeFilter(idRef("to-keep"), ["foo"]);

        const filters = [
            newPositiveAttributeFilter(idRef("to-ignore"), ["foo"]),
            filterToKeep,
            newNegativeAttributeFilter(idRef("to-ignore"), ["bar"]),
        ];

        const actual = await resolveWidgetFilters(
            filters,
            [{ type: "attributeFilterReference", displayForm: uriRef("/gdc/md/to-ignore") }],
            undefined,
            objRefsToIdentifiersMock,
        );

        expect(actual).toEqual([filterToKeep]);
    });

    it("should remove date filters with different dimension", async () => {
        const filterToKeep = newRelativeDateFilter(idRef("dimension"), "GDC.time.date", 1, 1);

        const filters = [
            newRelativeDateFilter(idRef("other1"), "GDC.time.date", 2, 2),
            filterToKeep,
            newRelativeDateFilter(idRef("other2"), "GDC.time.date", 3, 3),
        ];

        const actual = await resolveWidgetFilters(
            filters,
            [],
            uriRef("/gdc/md/dimension"),
            objRefsToIdentifiersMock,
        );

        expect(actual).toEqual([filterToKeep]);
    });

    it("should remove all date filters if the last one with the correct dimension is all time", async () => {
        const filters = [
            newRelativeDateFilter(idRef("dimension"), "GDC.time.date", 1, 1),
            newAllTimeFilter(idRef("dimension")),
        ];

        const actual = await resolveWidgetFilters(
            filters,
            [],
            uriRef("/gdc/md/dimension"),
            objRefsToIdentifiersMock,
        );

        expect(actual).toEqual([]);
    });

    it("should keep the last date filter if the last one with the correct dimension is NOT all time", async () => {
        const filterToKeep = newRelativeDateFilter(idRef("dimension"), "GDC.time.date", 1, 1);
        const filters = [newAllTimeFilter(idRef("dimension")), filterToKeep];

        const actual = await resolveWidgetFilters(
            filters,
            [],
            uriRef("/gdc/md/dimension"),
            objRefsToIdentifiersMock,
        );

        expect(actual).toEqual([filterToKeep]);
    });
});
