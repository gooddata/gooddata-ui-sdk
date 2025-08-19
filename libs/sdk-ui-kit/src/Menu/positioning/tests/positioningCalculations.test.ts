// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { IMenuPositionConfig, calculateMenuPosition } from "../positioningCalculations.js";

const sharedSettings: IMenuPositionConfig = {
    alignment: ["bottom", "right"],
    toggler: {
        left: 500,
        width: 100,
        right: 600,
        top: 500,
        height: 100,
        bottom: 600,
    },
    menu: {
        width: 200,
        height: 200,
    },
    viewport: {
        left: 0,
        width: 1000,
        right: 1000,
        top: 0,
        height: 1000,
        bottom: 1000,
    },
    offset: 0,
    spacing: 0,
    topLevelMenu: true,
};

describe("calculateMenuPosition", () => {
    describe("alignment", () => {
        it("should position in correct alignment when there is enought space", () => {
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["right", "bottom"],
                }),
            ).toEqual({ left: 600, top: 500 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["right", "top"],
                }),
            ).toEqual({ left: 600, top: 400 });

            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["left", "bottom"],
                }),
            ).toEqual({ left: 300, top: 500 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["left", "top"],
                }),
            ).toEqual({ left: 300, top: 400 });

            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["top", "right"],
                }),
            ).toEqual({ left: 500, top: 300 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["top", "left"],
                }),
            ).toEqual({ left: 400, top: 300 });

            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["bottom", "right"],
                }),
            ).toEqual({ left: 500, top: 600 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["bottom", "left"],
                }),
            ).toEqual({ left: 400, top: 600 });
        });

        it("should position in correct direction at the edges", () => {
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    toggler: {
                        left: 700,
                        width: 100,
                        right: 800,
                        top: 800,
                        height: 100,
                        bottom: 900,
                    },
                    alignment: ["right", "bottom"],
                }),
            ).toEqual({ left: 800, top: 800 });

            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    toggler: {
                        left: 800,
                        width: 100,
                        right: 900,
                        top: 700,
                        height: 100,
                        bottom: 800,
                    },
                    alignment: ["bottom", "right"],
                }),
            ).toEqual({ left: 800, top: 800 });

            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    toggler: {
                        left: 200,
                        width: 100,
                        right: 300,
                        top: 100,
                        height: 100,
                        bottom: 200,
                    },
                    alignment: ["left", "top"],
                }),
            ).toEqual({ left: 0, top: 0 });

            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    toggler: {
                        left: 100,
                        width: 100,
                        right: 200,
                        top: 200,
                        height: 100,
                        bottom: 300,
                    },
                    alignment: ["top", "left"],
                }),
            ).toEqual({ left: 0, top: 0 });
        });

        it("position in less ideal place when main place is not big enough", () => {
            // Not enough space on right, place on left
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    toggler: {
                        left: 700,
                        width: 101,
                        right: 801,
                        top: 500,
                        height: 100,
                        bottom: 600,
                    },
                    alignment: ["right", "bottom"],
                }),
            ).toEqual({ left: 500, top: 500 });

            // Not enough space on right or left, place menu right to viewport right
            // (if direction left, we place it to viewport left)
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    toggler: {
                        left: 100,
                        width: 800,
                        right: 900,
                        top: 500,
                        height: 100,
                        bottom: 600,
                    },
                    alignment: ["right", "bottom"],
                }),
            ).toEqual({ left: 800, top: 500 });

            // Menu too wide, position menu left to viewport left
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    toggler: {
                        left: 100,
                        width: 800,
                        right: 900,
                        top: 500,
                        height: 100,
                        bottom: 600,
                    },
                    menu: {
                        width: 2000,
                        height: 100,
                    },
                    alignment: ["right", "bottom"],
                }),
            ).toEqual({ left: 0, top: 500 });
        });
    });

    describe("spacing", () => {
        it("should add space between menu and toggler", () => {
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["right", "bottom"],
                    spacing: 100,
                }),
            ).toEqual({ left: 700, top: 500 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["top", "left"],
                    spacing: 100,
                }),
            ).toEqual({ left: 400, top: 200 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["left", "top"],
                    spacing: 100,
                }),
            ).toEqual({ left: 200, top: 400 });
        });
    });

    describe("offset", () => {
        it("should add alignment/offset of menu relative to toggler in given direction", () => {
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["right", "bottom"],
                    offset: 50,
                }),
            ).toEqual({ left: 600, top: 550 });

            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["bottom", "right"],
                    offset: -50,
                }),
            ).toEqual({ left: 450, top: 600 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["bottom", "left"],
                    offset: -50,
                }),
            ).toEqual({ left: 450, top: 600 });

            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["top", "left"],
                    offset: 50,
                }),
            ).toEqual({ left: 350, top: 300 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["left", "top"],
                    offset: 50,
                }),
            ).toEqual({ left: 300, top: 350 });
        });
    });

    describe("topLevel", () => {
        it("should return coordinates relative to page", () => {
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["right", "bottom"],
                    topLevelMenu: true,
                }),
            ).toEqual({ left: 600, top: 500 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["top", "left"],
                    topLevelMenu: true,
                }),
            ).toEqual({ left: 400, top: 300 });
        });

        it("should return coordinates relative to toggler", () => {
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["right", "bottom"],
                    topLevelMenu: false,
                }),
            ).toEqual({ left: 100, top: 0 });
            expect(
                calculateMenuPosition({
                    ...sharedSettings,
                    alignment: ["top", "left"],
                    topLevelMenu: false,
                }),
            ).toEqual({ left: -100, top: -200 });
        });
    });
});
