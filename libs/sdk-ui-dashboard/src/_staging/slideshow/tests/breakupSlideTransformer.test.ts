// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { breakupSlideTransformer } from "../breakupSlideTransformer.js";

describe("BreakupSlideTransformer", () => {
    it("no title or description", () => {
        const data = breakupSlideTransformer({
            type: "IDashboardLayoutSection",
            items: [],
        });

        expect(data).toBe(undefined);
    });

    it("with title", () => {
        const data = breakupSlideTransformer({
            type: "IDashboardLayoutSection",
            items: [],
            header: {
                title: "Title",
            },
        });

        expect(data).toEqual([
            {
                header: {
                    title: "Title",
                },
                items: [],
                type: "IDashboardLayoutSection",
            },
        ]);
    });

    it("with description", () => {
        const data = breakupSlideTransformer({
            type: "IDashboardLayoutSection",
            items: [],
            header: {
                description: "Description",
            },
        });

        expect(data).toEqual([
            {
                header: {
                    description: "Description",
                },
                items: [],
                type: "IDashboardLayoutSection",
            },
        ]);
    });

    it("with title and description", () => {
        const data = breakupSlideTransformer({
            type: "IDashboardLayoutSection",
            items: [],
            header: {
                title: "Title",
                description: "Description",
            },
        });

        expect(data).toEqual([
            {
                header: {
                    title: "Title",
                    description: "Description",
                },
                items: [],
                type: "IDashboardLayoutSection",
            },
        ]);
    });
});
