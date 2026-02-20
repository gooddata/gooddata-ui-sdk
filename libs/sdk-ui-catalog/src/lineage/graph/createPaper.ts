// (C) 2025-2026 GoodData Corporation

import * as joint from "@joint/core";

const BASE_WIDTH = 1000;
const BASE_HEIGHT = 1000;

export interface IPaperInteractionCallback {
    onClick?: (element: joint.dia.ElementView, event: joint.dia.Event, id: string) => void;
}

export function createPaper(graph: joint.dia.Graph, int: IPaperInteractionCallback) {
    //PAPER
    const paper = new joint.dia.Paper({
        model: graph,
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        drawGrid: false,
        async: true,
        background: {
            color: "transparent",
        },
        interactive: {
            elementMove: false,
            linkMove: false,
        },
    });

    paper.on("element:pointerclick", (cellView, event) => {
        const nodeId = cellView.model.id as string;
        int.onClick?.(cellView, event, nodeId);
    });

    return paper;
}
