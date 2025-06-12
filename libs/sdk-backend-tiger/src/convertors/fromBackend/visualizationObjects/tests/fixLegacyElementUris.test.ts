// (C) 2019-2022 GoodData Corporation
import { IInsightWidget } from "@gooddata/sdk-model";
import {
    ColorMapping,
    fixInsightLegacyElementUris,
    fixWidgetLegacyElementUris,
} from "../../fixLegacyElementUris.js";
import { mockInsight, mockWidget } from "./fixLegacyElementUris.fixtures.js";
import { describe, expect, it } from "vitest";

describe("fixInsightLegacyElementUris", () => {
    const insightWithUris = mockInsight([
        "/obj/0/elements?id=CZ",
        "/obj/0/elements?id=Czech.Republic",
        "/obj/0/elements?id=Czech Republic",
        "/obj/9999999999/elements?id=CZ",
    ]);
    const insightWithoutUris = mockInsight(["", "Untouched", "Untouched.string", "Should be untouched"]);
    const sanitizedInsightWithUris = fixInsightLegacyElementUris(insightWithUris);
    const sanitizedInsightWithoutUris = fixInsightLegacyElementUris(insightWithoutUris);

    describe("color mapping", () => {
        it("should strip fake uris and keep only label text values", () => {
            expect(sanitizedInsightWithUris.insight.properties.controls?.colorMapping).toMatchSnapshot();
        });

        it("should not change elements with correct primary key", () => {
            expect(insightWithoutUris.insight.properties.controls?.colorMapping).toEqual(
                sanitizedInsightWithoutUris.insight.properties.controls?.colorMapping,
            );
        });

        it("should handle color mapping items with null ids (RAIL-3983)", () => {
            const fakeInsight = mockInsight(["/obj/0/elements?id=CZ", "/obj/0/elements?id=Czech.Republic"]);
            const emptyValueColorMapping: ColorMapping = {
                id: null, // set this color for the (empty value) attribute value
                color: {
                    type: "guid",
                    value: "foo",
                },
            };
            fakeInsight.insight.properties.controls.colorMapping.push(emptyValueColorMapping);

            expect(
                fixInsightLegacyElementUris(fakeInsight).insight.properties.controls.colorMapping,
            ).toMatchSnapshot();
        });
    });

    describe("column widths", () => {
        it("should strip fake uris and keep only label text values", () => {
            expect(sanitizedInsightWithUris.insight.properties.controls?.columnWidths).toMatchSnapshot();
        });

        it("should not change elements with correct primary key", () => {
            expect(insightWithoutUris.insight.properties.controls?.columnWidths).toEqual(
                sanitizedInsightWithoutUris.insight.properties.controls?.columnWidths,
            );
        });
    });

    describe("sort items", () => {
        it("should strip fake uris and keep only label text values", () => {
            expect(sanitizedInsightWithUris.insight.sorts).toMatchSnapshot();
        });

        it("should copy sort items to insight properties", () => {
            expect(sanitizedInsightWithUris.insight.sorts).toEqual(
                sanitizedInsightWithUris.insight.properties.sortItems,
            );
        });

        it("should not change elements with correct primary key", () => {
            expect(insightWithoutUris.insight.sorts).toEqual(
                sanitizedInsightWithoutUris.insight.properties?.sortItems,
            );

            expect(insightWithoutUris.insight.sorts).toEqual(sanitizedInsightWithoutUris.insight.sorts);
        });
    });
});

describe("fixWidgetLegacyElementUris", () => {
    const widgetWithUris = mockWidget([
        "/obj/0/elements?id=CZ",
        "/obj/0/elements?id=Czech.Republic",
        "/obj/0/elements?id=Czech Republic",
        "/obj/9999999999/elements?id=CZ",
    ]);
    const widgetWithoutUris = mockWidget([
        "",
        "Untouched",
        "Untouched.string",
        "Should be untouched",
    ]) as IInsightWidget;
    const sanitizedWidgetWithUris = fixWidgetLegacyElementUris(widgetWithUris) as IInsightWidget;
    const sanitizedWidgetWithoutUris = fixWidgetLegacyElementUris(widgetWithoutUris) as IInsightWidget;

    describe("column widths", () => {
        it("should strip fake uris and keep only label text values", () => {
            expect(sanitizedWidgetWithUris.properties?.controls?.columnWidths).toMatchSnapshot();
        });

        it("should not change elements with correct primary key", () => {
            expect(widgetWithoutUris.properties?.controls?.columnWidths).toEqual(
                sanitizedWidgetWithoutUris.properties?.controls?.columnWidths,
            );
        });
    });
});
