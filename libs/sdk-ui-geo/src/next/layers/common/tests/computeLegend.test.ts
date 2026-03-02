// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { IGeoCommonData } from "../../../types/geoData/common.js";
import { computeLegend } from "../computeLegend.js";

function createColorStrategy(): IColorStrategy {
    return {
        getColorAssignment: () =>
            [
                {
                    headerItem: {
                        attributeHeaderItem: {
                            name: "Czech",
                            uri: "/gdc/md/obj/1/elements?id=cz",
                        },
                    },
                },
                {
                    headerItem: {
                        attributeHeaderItem: {
                            name: "French",
                            uri: "/gdc/md/obj/1/elements?id=fr",
                        },
                    },
                },
            ] as ReturnType<IColorStrategy["getColorAssignment"]>,
        getFullColorAssignment: () => [],
        getColorByIndex: (index: number) => (index === 0 ? "#000000" : "#111111"),
    };
}

describe("computeLegend", () => {
    it("sorts category legend items alphabetically while preserving color assignment mapping", () => {
        const geoData: IGeoCommonData = {
            segment: {
                name: "Country",
                index: 0,
                data: ["French", "Czech"],
                uris: ["/gdc/md/obj/1/elements?id=fr", "/gdc/md/obj/1/elements?id=cz"],
            },
        };

        const result = computeLegend(geoData, createColorStrategy(), {
            layerType: "pushpin",
            hasSizeData: false,
        });

        expect(result.items).toEqual([
            {
                type: "pushpin",
                name: "Czech",
                uri: "/gdc/md/obj/1/elements?id=cz",
                color: "#000000",
                legendIndex: 0,
                isVisible: true,
            },
            {
                type: "pushpin",
                name: "French",
                uri: "/gdc/md/obj/1/elements?id=fr",
                color: "#111111",
                legendIndex: 1,
                isVisible: true,
            },
        ]);
    });

    it("applies the same alphabetical ordering for area legends", () => {
        const geoData: IGeoCommonData = {
            segment: {
                name: "Country",
                index: 0,
                data: ["French", "Czech"],
                uris: ["/gdc/md/obj/1/elements?id=fr", "/gdc/md/obj/1/elements?id=cz"],
            },
        };

        const result = computeLegend(geoData, createColorStrategy(), {
            layerType: "area",
            hasSizeData: false,
        });

        expect(result.items.map((item) => item.name)).toEqual(["Czech", "French"]);
        expect(result.items.map((item) => item.type)).toEqual(["area", "area"]);
    });
});
