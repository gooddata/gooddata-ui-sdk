// (C) 2025-2026 GoodData Corporation

import * as joint from "@joint/core";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";

import { objRefToId } from "../utils.js";

export function createEdge(edge: IReferencesResult["edges"][number]) {
    return new joint.shapes.standard.Link({
        source: {
            id: objRefToId(edge.from),
        },
        target: {
            id: objRefToId(edge.to),
        },

        connector: {
            name: "rounded", // optional: smoother corners
            args: { radius: 8 },
        },

        attrs: {
            line: {
                class: "edge-connector",
                stroke: "transparent",
                strokeWidth: 1.5,
                targetMarker: {
                    type: "none", // tree style, no arrows
                },
            },
        },
    });
}
