// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IAvailableLegends, IGeoLegendItem } from "../../types/common/legends.js";
import type { IAreaGeoData } from "../../types/geoData/area.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import { computeAreaLegend } from "../legend/computeAreaLegend.js";
import { computePushpinLegend } from "../legend/computePushpinLegend.js";

const legendItems: IGeoLegendItem[] = [
    {
        type: "pushpin",
        name: "Czech",
        uri: "/gdc/md/obj/1/elements?id=cz",
        color: "#000000",
        legendIndex: 0,
        isVisible: true,
    },
];

const pushpinGeoData: IPushpinGeoData = {
    color: {
        name: "Revenue",
        index: 0,
        data: [10, 100],
        format: "#,##0",
    },
    segment: {
        name: "Country",
        index: 1,
        data: ["Czech"],
        uris: ["/gdc/md/obj/1/elements?id=cz"],
    },
};

const areaGeoData: IAreaGeoData = {
    color: {
        name: "Revenue",
        index: 0,
        data: [10, 100],
        format: "#,##0",
    },
    segment: {
        name: "Country",
        index: 1,
        data: ["Czech"],
        uris: ["/gdc/md/obj/1/elements?id=cz"],
    },
};

function createAvailableLegends(overrides?: Partial<IAvailableLegends>): IAvailableLegends {
    return {
        hasCategoryLegend: false,
        hasColorLegend: false,
        hasSizeLegend: false,
        ...overrides,
    };
}

describe("legend builders precedence", () => {
    it("does not render pushpin gradient legend when segmentation is present", () => {
        const section = computePushpinLegend({
            layerId: "pushpin",
            layerName: "Pushpin layer",
            geoData: pushpinGeoData,
            legendItems,
            availableLegends: createAvailableLegends({
                hasCategoryLegend: true,
                hasColorLegend: true,
            }),
        });

        expect(section?.groups.map((group) => group.kind)).toEqual(["color"]);
    });

    it("renders pushpin gradient legend when segmentation is absent", () => {
        const section = computePushpinLegend({
            layerId: "pushpin",
            layerName: "Pushpin layer",
            geoData: {
                color: pushpinGeoData.color,
            },
            legendItems: [],
            availableLegends: createAvailableLegends({
                hasCategoryLegend: false,
                hasColorLegend: true,
            }),
        });

        expect(section?.groups.map((group) => group.kind)).toEqual(["colorScale"]);
    });

    it("does not render area gradient legend when segmentation is present", () => {
        const section = computeAreaLegend({
            layerId: "area",
            layerName: "Area layer",
            geoData: areaGeoData,
            legendItems,
            availableLegends: createAvailableLegends({
                hasCategoryLegend: true,
                hasColorLegend: true,
            }),
        });

        expect(section?.groups.map((group) => group.kind)).toEqual(["color"]);
    });

    it("renders area gradient legend when segmentation is absent", () => {
        const section = computeAreaLegend({
            layerId: "area",
            layerName: "Area layer",
            geoData: {
                color: areaGeoData.color,
            },
            legendItems: [],
            availableLegends: createAvailableLegends({
                hasCategoryLegend: false,
                hasColorLegend: true,
            }),
        });

        expect(section?.groups.map((group) => group.kind)).toEqual(["colorScale"]);
    });

    it("renders pushpin attribute-only fallback legend as non-interactive color group", () => {
        const section = computePushpinLegend({
            layerId: "pushpin",
            layerName: "Pushpin layer",
            geoData: {
                location: {
                    name: "Location",
                    index: 0,
                    data: [],
                },
            },
            legendItems: [],
            availableLegends: createAvailableLegends({
                hasCategoryLegend: false,
                hasColorLegend: false,
                hasSizeLegend: false,
            }),
            colorScaleBaseColor: "#14b2e2",
        });

        expect(section).not.toBeNull();
        expect(section?.isAttributeOnlySection).toBe(true);
        expect(section?.groups).toEqual([
            {
                kind: "color",
                title: "",
                items: [
                    {
                        type: "colorCategory",
                        label: "Location",
                        color: "#14b2e2",
                        uri: "__attribute_only__:pushpin",
                        isVisible: true,
                    },
                ],
                isInteractive: false,
            },
        ]);
    });

    it("uses fallback color when colorScaleBaseColor is not provided for pushpin attribute-only legend", () => {
        const section = computePushpinLegend({
            layerId: "pushpin",
            layerName: "Pushpin layer",
            geoData: {
                location: {
                    name: "Location",
                    index: 0,
                    data: [],
                },
            },
            legendItems: [],
            availableLegends: createAvailableLegends({
                hasCategoryLegend: false,
                hasColorLegend: false,
                hasSizeLegend: false,
            }),
        });

        expect(section).not.toBeNull();
        expect(section?.groups[0]?.items[0]).toMatchObject({
            color: "#ccc",
        });
    });

    it("does not render pushpin attribute-only fallback when segment is present", () => {
        const section = computePushpinLegend({
            layerId: "pushpin",
            layerName: "Pushpin layer",
            geoData: {
                location: {
                    name: "Location",
                    index: 0,
                    data: [],
                },
                segment: {
                    name: "Country",
                    index: 1,
                    data: ["Czech"],
                    uris: ["/gdc/md/obj/1/elements?id=cz"],
                },
            },
            legendItems,
            availableLegends: createAvailableLegends({
                hasCategoryLegend: true,
                hasColorLegend: false,
                hasSizeLegend: false,
            }),
        });

        expect(section).not.toBeNull();
        // Should have a regular color group, not attribute-only
        expect(section?.isAttributeOnlySection).toBe(false);
        expect(section?.groups[0]?.isInteractive).toBeUndefined();
    });

    it("does not render area attribute-only fallback when segment is present", () => {
        const section = computeAreaLegend({
            layerId: "area",
            layerName: "Area layer",
            geoData: {
                area: {
                    name: "Area",
                    index: 0,
                    data: [],
                    uris: [],
                },
                segment: {
                    name: "Country",
                    index: 1,
                    data: ["Czech"],
                    uris: ["/gdc/md/obj/1/elements?id=cz"],
                },
            },
            legendItems,
            availableLegends: createAvailableLegends({
                hasCategoryLegend: true,
                hasColorLegend: false,
            }),
        });

        expect(section).not.toBeNull();
        // Should have a regular color group, not attribute-only
        expect(section?.isAttributeOnlySection).toBe(false);
        expect(section?.groups[0]?.isInteractive).toBeUndefined();
    });

    it("renders area attribute-only fallback legend as non-interactive color group", () => {
        const section = computeAreaLegend({
            layerId: "area",
            layerName: "Area layer",
            geoData: {
                area: {
                    name: "Area",
                    index: 0,
                    data: [],
                    uris: [],
                },
            },
            legendItems: [],
            availableLegends: createAvailableLegends({
                hasCategoryLegend: false,
                hasColorLegend: false,
                hasSizeLegend: false,
            }),
            colorScaleBaseColor: "#14b2e2",
        });

        expect(section).not.toBeNull();
        expect(section?.isAttributeOnlySection).toBe(true);
        expect(section?.groups).toEqual([
            {
                kind: "color",
                title: "",
                items: [
                    {
                        type: "colorCategory",
                        label: "Area",
                        color: "#14b2e2",
                        uri: "__attribute_only__:area",
                        isVisible: true,
                    },
                ],
                isInteractive: false,
            },
        ]);
    });
});
