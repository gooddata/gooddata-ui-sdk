// (C) 2025-2026 GoodData Corporation

import type * as joint from "@joint/core";
import { DirectedGraph } from "@joint/layout-directed-graph";

export function applyLayout(graph: joint.dia.Graph, direction: "up" | "down" | "both" = "down") {
    // Layout
    DirectedGraph.layout(graph, {
        rankDir: direction === "down" || direction === "both" ? "LR" : "RL",
    });
}
