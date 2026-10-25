// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { HOVER_BOTTOM, HOVER_TOP, calculateDropIndex, getHoverPosition } from "./BucketReorderableItem.js";

describe("BucketReorderableItem", () => {
    describe("getHoverPosition", () => {
        it("should detect top position", () => {
            const y = 4;
            expect(getHoverPosition(y, { top: 0, bottom: 10 })).toEqual(HOVER_TOP);
        });

        it("should detect bottom position", () => {
            const y = 6;
            expect(getHoverPosition(y, { top: 0, bottom: 10 })).toEqual(HOVER_BOTTOM);
        });

        it("should return bottom for middle", () => {
            const y = 5;
            expect(getHoverPosition(y, { top: 0, bottom: 10 })).toEqual(HOVER_BOTTOM);
        });
    });

    describe("calculateDropIndex", () => {
        function expectDropIndex(
            config: {
                hoverPosition: string;
                draggedItemIndex: number | null;
                hoveredItemIndex: number;
                lastItemIndex?: number;
            },
            result: number,
        ) {
            expect(
                calculateDropIndex(
                    config.hoverPosition,
                    config.draggedItemIndex,
                    config.hoveredItemIndex,
                    config.lastItemIndex,
                ),
            ).toEqual(result);
        }

        it("should be null for next item top half when dragging downwards", () => {
            expectDropIndex(
                {
                    draggedItemIndex: 0,
                    hoveredItemIndex: 1,
                    hoverPosition: HOVER_TOP,
                },
                null,
            );
        });

        it("should be null for previous item bottom half when dragging upwards", () => {
            expectDropIndex(
                {
                    draggedItemIndex: 1,
                    hoveredItemIndex: 0,
                    hoverPosition: HOVER_BOTTOM,
                },
                null,
            );
        });

        it("should calculate correct dropIndex for dragging downwards", () => {
            expectDropIndex(
                {
                    draggedItemIndex: 0,
                    hoveredItemIndex: 2,
                    hoverPosition: HOVER_BOTTOM,
                },
                2,
            );

            expectDropIndex(
                {
                    draggedItemIndex: 0,
                    hoveredItemIndex: 2,
                    hoverPosition: HOVER_TOP,
                },
                1,
            );
        });

        it("should calculate correct dropIndex for dragging upwards", () => {
            expectDropIndex(
                {
                    draggedItemIndex: 2,
                    hoveredItemIndex: 0,
                    hoverPosition: HOVER_TOP,
                },
                0,
            );

            expectDropIndex(
                {
                    draggedItemIndex: 2,
                    hoveredItemIndex: 0,
                    hoverPosition: HOVER_BOTTOM,
                },
                1,
            );
        });

        it("should return null, if item is dragged to bottom part of last item", () => {
            expectDropIndex(
                {
                    draggedItemIndex: null,
                    hoveredItemIndex: 2,
                    hoverPosition: HOVER_BOTTOM,
                    lastItemIndex: 2,
                },
                null,
            );
        });
    });
});
