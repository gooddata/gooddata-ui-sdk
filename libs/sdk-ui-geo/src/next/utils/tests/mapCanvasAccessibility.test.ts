// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    getMapCanvasInstructionMessageId,
    getMapCanvasRuntimeCapabilities,
} from "../mapCanvasAccessibility.js";

describe("mapCanvasAccessibility", () => {
    it("returns static instruction for static maps", () => {
        expect(
            getMapCanvasInstructionMessageId({
                isStatic: true,
                canPan: false,
                canZoom: false,
                canRotatePitch: false,
            }),
        ).toBe("geochart.map.canvas.static");
    });

    it("returns pan+zoom+rotate instruction when all capabilities are enabled", () => {
        expect(
            getMapCanvasInstructionMessageId({
                isStatic: false,
                canPan: true,
                canZoom: true,
                canRotatePitch: true,
            }),
        ).toBe("geochart.map.canvas.instructions.panZoomRotatePitch");
    });

    it("returns pan+zoom instruction when pan and zoom are enabled", () => {
        expect(
            getMapCanvasInstructionMessageId({
                isStatic: false,
                canPan: true,
                canZoom: true,
                canRotatePitch: false,
            }),
        ).toBe("geochart.map.canvas.instructions.panZoom");
    });

    it("returns pan-only instruction when only pan is enabled", () => {
        expect(
            getMapCanvasInstructionMessageId({
                isStatic: false,
                canPan: true,
                canZoom: false,
                canRotatePitch: false,
            }),
        ).toBe("geochart.map.canvas.instructions.panOnly");
    });

    it("returns zoom-only instruction when only zoom is enabled", () => {
        expect(
            getMapCanvasInstructionMessageId({
                isStatic: false,
                canPan: false,
                canZoom: true,
                canRotatePitch: false,
            }),
        ).toBe("geochart.map.canvas.instructions.zoomOnly");
    });

    it("derives static map capabilities for frozen viewport", () => {
        expect(getMapCanvasRuntimeCapabilities({ viewport: { frozen: true } })).toEqual({
            isStatic: true,
            canPan: false,
            canZoom: false,
            canRotatePitch: false,
            isKeyboardInteractionEnabled: false,
            isKeyboardRotationEnabled: false,
        });
    });

    it("derives interactive capabilities and disabled rotation for default config", () => {
        expect(getMapCanvasRuntimeCapabilities({ viewport: { frozen: false } })).toEqual({
            isStatic: false,
            canPan: true,
            canZoom: true,
            canRotatePitch: false,
            isKeyboardInteractionEnabled: true,
            isKeyboardRotationEnabled: false,
        });
    });

    it("derives capabilities from runtime interaction overrides", () => {
        expect(
            getMapCanvasRuntimeCapabilities(
                { viewport: { frozen: false } },
                {
                    interactive: true,
                    dragRotate: true,
                    pitchWithRotate: false,
                    touchZoomRotate: false,
                },
            ),
        ).toEqual({
            isStatic: false,
            canPan: true,
            canZoom: true,
            canRotatePitch: true,
            isKeyboardInteractionEnabled: true,
            isKeyboardRotationEnabled: true,
        });
    });

    it("respects viewport navigation pan toggle", () => {
        expect(
            getMapCanvasRuntimeCapabilities({
                applyViewportNavigation: true,
                viewport: {
                    frozen: false,
                    navigation: {
                        pan: false,
                        zoom: true,
                    },
                },
            }),
        ).toEqual({
            isStatic: false,
            canPan: false,
            canZoom: true,
            canRotatePitch: false,
            isKeyboardInteractionEnabled: true,
            isKeyboardRotationEnabled: false,
        });
    });

    it("ignores viewport navigation toggles when applying viewport navigation is disabled", () => {
        expect(
            getMapCanvasRuntimeCapabilities({
                applyViewportNavigation: false,
                viewport: {
                    frozen: false,
                    navigation: {
                        pan: false,
                        zoom: false,
                    },
                },
            }),
        ).toEqual({
            isStatic: false,
            canPan: true,
            canZoom: true,
            canRotatePitch: false,
            isKeyboardInteractionEnabled: true,
            isKeyboardRotationEnabled: false,
        });
    });
});
