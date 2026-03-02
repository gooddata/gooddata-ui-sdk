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
});
