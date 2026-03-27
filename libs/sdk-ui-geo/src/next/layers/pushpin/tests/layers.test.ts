// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { PUSHPIN_STYLE_FEATURE_PROPERTIES } from "../constants.js";
import { createPushpinIconLayer } from "../layers.js";

describe("createPushpinIconLayer", () => {
    it("uses the configured static icon for oneIcon shape", () => {
        const layer = createPushpinIconLayer(
            "pushpins",
            { points: { shapeType: "oneIcon", icon: "airport" } },
            {
                location: {
                    name: "Location",
                    index: 0,
                    data: [{ lat: 40.7128, lng: -74.006 }],
                },
            },
        );

        expect(layer.layout?.["icon-image"]).toBe("airport");
    });

    it("keeps oneIcon shape blank when the icon is missing", () => {
        const layer = createPushpinIconLayer(
            "pushpins",
            { points: { shapeType: "oneIcon" } },
            {
                location: {
                    name: "Location",
                    index: 0,
                    data: [{ lat: 40.7128, lng: -74.006 }],
                },
                geoIcon: {
                    name: "Icon",
                    index: 1,
                    data: ["harbor"],
                },
            },
        );

        expect(layer.layout?.["icon-image"]).toBe("");
    });

    it("keeps icon sizing constant even when tooltip metrics are present", () => {
        const layer = createPushpinIconLayer(
            "pushpins",
            { points: { shapeType: "iconByValue" } },
            {
                location: {
                    name: "Location",
                    index: 0,
                    data: [{ lat: 40.7128, lng: -74.006 }],
                },
                measures: [
                    {
                        name: "Revenue",
                        index: 1,
                        data: [100, 300],
                        format: "#,##0",
                    },
                    {
                        name: "Margin",
                        index: 2,
                        data: [0.2, 0.5],
                        format: "#,##0.00%",
                    },
                ],
            },
        );

        expect(layer.layout?.["icon-image"]).toEqual(["get", PUSHPIN_STYLE_FEATURE_PROPERTIES.iconName]);
        expect(layer.layout?.["icon-size"]).toBe(1);
    });

    it("keeps icon sizing constant when tooltip metrics have no variance", () => {
        const layer = createPushpinIconLayer(
            "pushpins",
            { points: { shapeType: "iconByValue" } },
            {
                location: {
                    name: "Location",
                    index: 0,
                    data: [{ lat: 40.7128, lng: -74.006 }],
                },
                measures: [
                    {
                        name: "Revenue",
                        index: 1,
                        data: [100, 100],
                        format: "#,##0",
                    },
                    {
                        name: "Margin",
                        index: 2,
                        data: [0.2, 0.5],
                        format: "#,##0.00%",
                    },
                ],
            },
        );

        expect(layer.layout?.["icon-size"]).toBe(1);
    });
});
