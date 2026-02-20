// (C) 2025-2026 GoodData Corporation

import type * as joint from "@joint/core";
import { DirectedGraph } from "@joint/layout-directed-graph";

export function applyLayout(graph: joint.dia.Graph, direction: "up" | "down" = "down") {
    // Layout
    DirectedGraph.layout(graph, {
        rankDir: direction === "down" ? "LR" : "RL",
    });
}
