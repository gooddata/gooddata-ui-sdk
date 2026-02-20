// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, useCallback, useEffect, useReducer, useRef, useState } from "react";

import type * as joint from "@joint/core";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import { type ObjectType } from "@gooddata/sdk-model";

import { applyLayout } from "./graph/applyLayout.js";
import { createEdge } from "./graph/createEdge.js";
import { createGraph } from "./graph/createGraph.js";
import { cleanupMeasurementElements, createNode } from "./graph/createNode.js";
import { createPaper } from "./graph/createPaper.js";
import { createScroller } from "./graph/createScroller.js";
import { filterLeafNodes, filterNodes, objRefToId } from "./utils.js";
import type { ICatalogItemRef } from "../catalogItem/types.js";

export interface IPaperInteractionCallback {
    onItemClick?: (event: MouseEvent, ref: ICatalogItemRef) => void;
}

export interface ILineageGraphOptions extends IPaperInteractionCallback {
    typesToFilter?: ObjectType[];
    leafTypesToFilter?: ObjectType[];
    direction?: "up" | "down";
}

export function useLineageGraph(
    nodes: IReferencesResult["nodes"] | undefined,
    edges: IReferencesResult["edges"] | undefined,
    opts: IPaperInteractionCallback & ILineageGraphOptions = {},
) {
    const direction = opts?.direction ?? "down";
    const [, update] = useReducer((x) => x + 1, 0);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const graph = useRef<joint.dia.Graph | null>(null);
    const paper = useRef<joint.dia.Paper | null>(null);
    const scroller = useRef<ReturnType<typeof createScroller> | null>(null);
    const { onItemClick, typesToFilter, leafTypesToFilter } = opts;

    useEffect(() => {
        if (!container || !nodes || !edges) {
            return;
        }

        const { nodes: filteredNodes, edges: filteredEdges } = filterNodes(nodes, edges, typesToFilter);

        const { nodes: filteredNodesByLeaf, edges: filteredEdgesByLeaf } = filterLeafNodes(
            filteredNodes,
            filteredEdges,
            leafTypesToFilter,
        );

        //GRAPH
        graph.current = createGraph();
        //PAPER
        paper.current = createPaper(graph.current, {
            onClick: (_, event, id) => {
                const node = filteredNodesByLeaf.find((node) => {
                    return objRefToId(node) === id;
                });
                if (!node) {
                    return;
                }
                onItemClick?.(event.originalEvent as unknown as MouseEvent, node as ICatalogItemRef);
            },
        });
        //SCROLLER
        scroller.current = createScroller(paper.current, update);

        //RENDER
        container.appendChild(scroller.current.el);
        paper.current.render();

        //DATA
        const nodeElements = filteredNodesByLeaf.map(createNode);
        graph.current.addCells(nodeElements);
        const edgeElements = filteredEdgesByLeaf.map(createEdge);
        graph.current.addCells(edgeElements);

        //LAYOUT
        applyLayout(graph.current, direction);

        //POSITIONS BY ROOT
        scroller.current.reset();
        update();

        return () => {
            cleanupMeasurementElements();
            scroller.current?.dispose();
            paper.current?.remove();
        };
    }, [nodes, edges, container, update, leafTypesToFilter, typesToFilter, onItemClick, direction]);

    const zoomIn = useCallback(() => {
        scroller.current?.zoomIn();
    }, []);

    const zoomOut = useCallback(() => {
        scroller.current?.zoomOut();
    }, []);

    const reset = useCallback(() => {
        scroller.current?.reset();
    }, []);

    const expand = useCallback(() => {
        scroller.current?.expand();
    }, []);

    const zoomInEnabled = scroller.current?.isZoomInEnable() ?? false;
    const zoomOutEnabled = scroller.current?.isZoomOutEnable() ?? false;

    return {
        reset,
        expand,
        zoomInEnabled,
        zoomIn,
        zoomOutEnabled,
        zoomOut,
        setContainer,
    };
}
