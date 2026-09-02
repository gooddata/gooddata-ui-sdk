// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IReportsBrandKit, reportsBrandKitImageVariable, sanitizeReportsBrandKit } from "./brandKit.js";

describe("sanitizeReportsBrandKit", () => {
    const fullKit: IReportsBrandKit = {
        version: "1",
        colors: {
            brand: "#e4002b",
            chart: ["#e4002b", "#101820", "rgba(242, 169, 0, 0.8)"],
            ink: "#101820",
            inkMuted: "#5a5f66",
            paper: "#ffffff",
            paperAlt: "#f5f1eb",
        },
        typography: {
            fontFamily: "Inter, sans-serif",
            fonts: [
                { family: "Inter", url: "https://cdn.example.com/Inter-Regular.ttf", weight: 400 },
                {
                    family: "Inter",
                    url: "https://cdn.example.com/Inter-ExtraBold.ttf",
                    weight: 800,
                    style: "normal",
                },
            ],
        },
        assets: {
            logo: "https://cdn.example.com/logo.svg",
            logoInverse: "https://cdn.example.com/logo-white.svg",
            images: [{ id: "cover", url: "https://cdn.example.com/cover.jpg", description: "cover hero" }],
        },
    };

    it("keeps a fully valid kit intact", () => {
        expect(sanitizeReportsBrandKit(fullKit)).toEqual(fullKit);
    });

    it.each([undefined, null, "kit", 1, [], {}, { version: "2" }, { version: 1 }])("rejects %j", (value) => {
        expect(sanitizeReportsBrandKit(value)).toBeUndefined();
    });

    it("empties a kit whose every part is invalid", () => {
        expect(sanitizeReportsBrandKit({ version: "1", colors: { brand: "" }, assets: {} })).toEqual({
            version: "1",
        });
    });

    it("drops chart colors the palette could not read, and empty strings", () => {
        expect(
            sanitizeReportsBrandKit({
                version: "1",
                colors: {
                    brand: " ",
                    // A five-digit hex is no hex at all, and a named color is not one of the
                    // notations a chart color is stated in.
                    chart: ["#e4002b", "", 42, "#e4002", "salmon", "rgb(16, 24, 32)", "#101820"],
                    ink: "#101820",
                },
            }),
        ).toEqual({
            version: "1",
            colors: { chart: ["#e4002b", "rgb(16, 24, 32)", "#101820"], ink: "#101820" },
        });
    });

    it.each([
        "rgb(1, 2 3)",
        "rgba(1,2,3,.)",
        "rgb(1,2)",
        "rgb(1 2, 3)",
        "rgb(300, 0, 0)",
        "#e4002",
        "salmon",
    ])("drops the chart color %s, which is no color the palette can read", (color) => {
        expect(sanitizeReportsBrandKit({ version: "1", colors: { chart: [color] } })).toEqual({
            version: "1",
        });
    });

    it.each(["rgb(1, 2, 3)", "rgba(1, 2, 3, 0.5)", "rgb(1 2 3)", "rgb(1 2 3 / 50%)", "#abc", "#e4002b"])(
        "keeps the chart color %s",
        (color) => {
            expect(sanitizeReportsBrandKit({ version: "1", colors: { chart: [color] } })).toEqual({
                version: "1",
                colors: { chart: [color] },
            });
        },
    );

    it("keeps the other colors in whatever notation css takes them", () => {
        expect(
            sanitizeReportsBrandKit({
                version: "1",
                colors: { brand: "salmon", ink: "oklch(0.3 0.05 260)", paper: "var(--brand-paper)" },
            }),
        ).toEqual({
            version: "1",
            colors: { brand: "salmon", ink: "oklch(0.3 0.05 260)", paper: "var(--brand-paper)" },
        });
    });

    it("drops images with an invalid id, a missing url or a duplicate id", () => {
        expect(
            sanitizeReportsBrandKit({
                version: "1",
                assets: {
                    images: [
                        { id: "cover", url: "https://cdn.example.com/a.jpg" },
                        { id: "co-ver", url: "https://cdn.example.com/b.jpg" },
                        { id: "hero", url: "" },
                        { id: "cover", url: "https://cdn.example.com/c.jpg" },
                        "not-an-image",
                    ],
                },
            }),
        ).toEqual({
            version: "1",
            assets: { images: [{ id: "cover", url: "https://cdn.example.com/a.jpg" }] },
        });
    });

    it("drops invalid font faces and their invalid fields", () => {
        expect(
            sanitizeReportsBrandKit({
                version: "1",
                typography: {
                    fonts: [
                        { family: "Inter", url: "https://cdn.example.com/a.ttf", weight: 0, style: "bold" },
                        { family: "", url: "https://cdn.example.com/b.ttf" },
                        { family: "Inter", url: "" },
                        "no",
                    ],
                },
            }),
        ).toEqual({
            version: "1",
            typography: { fonts: [{ family: "Inter", url: "https://cdn.example.com/a.ttf" }] },
        });
    });

    it("drops non-object parts", () => {
        expect(
            sanitizeReportsBrandKit({
                version: "1",
                colors: "red",
                typography: { fontFamily: "Inter" },
                assets: [],
            }),
        ).toEqual({ version: "1", typography: { fontFamily: "Inter" } });
    });

    it("drops asset urls that are not http(s)", () => {
        expect(
            sanitizeReportsBrandKit({
                version: "1",
                assets: {
                    logo: "javascript:alert(1)",
                    logoInverse: "brand/logo.svg",
                    images: [
                        { id: "inline", url: "data:image/png;base64,AAAA" },
                        { id: "cover", url: "http://cdn.example.com/cover.jpg" },
                    ],
                },
            }),
        ).toEqual({
            version: "1",
            assets: { images: [{ id: "cover", url: "http://cdn.example.com/cover.jpg" }] },
        });
    });

    it("drops a font face whose url is not http(s)", () => {
        expect(
            sanitizeReportsBrandKit({
                version: "1",
                typography: { fonts: [{ family: "Brand", url: "data:font/woff2;base64,AAAA" }] },
            }),
        ).toEqual({ version: "1" });
    });
});

describe("reportsBrandKitImageVariable", () => {
    it("prefixes the image id", () => {
        expect(reportsBrandKitImageVariable("cover")).toBe("image_cover");
    });
});
