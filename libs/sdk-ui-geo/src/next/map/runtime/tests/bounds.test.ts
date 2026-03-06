// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { normalizeBoundsForShortestPath } from "../bounds.js";

describe("normalizeBoundsForShortestPath", () => {
    it("keeps regular bounds unchanged", () => {
        const normalized = normalizeBoundsForShortestPath({
            southWest: { lng: -20, lat: -10 },
            northEast: { lng: 40, lat: 15 },
        });

        expect(normalized).toEqual([
            [-20, -10],
            [40, 15],
        ]);
    });

    it("keeps wide min/max bounds unchanged when east longitude is higher than west longitude", () => {
        const normalized = normalizeBoundsForShortestPath({
            southWest: { lng: -170, lat: -25 },
            northEast: { lng: 170, lat: 30 },
        });

        expect(normalized).toEqual([
            [-170, -25],
            [170, 30],
        ]);
    });

    it("normalizes explicit wrapped bounds where east longitude is lower than west longitude", () => {
        const normalized = normalizeBoundsForShortestPath({
            southWest: { lng: 170, lat: -5 },
            northEast: { lng: -170, lat: 5 },
        });

        expect(normalized).toEqual([
            [170, -5],
            [190, 5],
        ]);
    });

    it("keeps full-world bounds unchanged", () => {
        const normalized = normalizeBoundsForShortestPath({
            southWest: { lng: -180, lat: -84 },
            northEast: { lng: 180, lat: 84 },
        });

        expect(normalized).toEqual([
            [-180, -84],
            [180, 84],
        ]);
    });
});
