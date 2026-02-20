// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import { type IdentifierRef } from "@gooddata/sdk-model";

import { filterLeafNodes } from "./utils.js";

describe("filterLeafNodes", () => {
    const nodes: IReferencesResult["nodes"] = [
        { identifier: "ds1", type: "dataSet", title: "ds1" },
        { identifier: "l1", type: "measure", title: "l1" },
        { identifier: "m1", type: "measure", title: "m1" },
        { identifier: "d1", type: "analyticalDashboard", title: "d1" },
    ];

    const edges: IReferencesResult["edges"] = [
        { from: { identifier: "ds1", type: "dataSet" }, to: { identifier: "l1", type: "measure" } },
        { from: { identifier: "ds1", type: "dataSet" }, to: { identifier: "m1", type: "measure" } },
        {
            from: { identifier: "m1", type: "measure" },
            to: { identifier: "d1", type: "analyticalDashboard" },
        },
    ];

    it("should remove leaf children of nodes of specified types", () => {
        // ds1 is connected to l1 (leaf) and m1 (not leaf).
        // If we filter 'dataSet', l1 should be removed because it's a leaf child of ds1.
        // m1 should NOT be removed because it's NOT a leaf child of ds1 (it has children).
        // ds1 should NOT be removed.

        const result = filterLeafNodes(nodes, edges, ["dataSet"]);

        const nodeIds = result.nodes.map((n) => (n as IdentifierRef).identifier);
        expect(nodeIds).toContain("ds1");
        expect(nodeIds).not.toContain("l1");
        expect(nodeIds).toContain("m1");
        expect(nodeIds).toContain("d1");
    });

    it("should remove edges connected to removed leaf nodes", () => {
        const result = filterLeafNodes(nodes, edges, ["dataSet"]);

        expect(result.edges).toHaveLength(2);
        expect(result.edges).not.toContainEqual({
            from: { identifier: "ds1", type: "dataSet" },
            to: { identifier: "l1", type: "measure" },
        });
    });

    it("should handle multiple filtered types", () => {
        const nodes: IReferencesResult["nodes"] = [
            { identifier: "ds1", type: "dataSet", title: "ds1" },
            { identifier: "a1", type: "attribute", title: "a1" },
            { identifier: "l1", type: "measure", title: "l1" },
        ];
        const edges: IReferencesResult["edges"] = [
            { from: { identifier: "ds1", type: "dataSet" }, to: { identifier: "l1", type: "measure" } },
            { from: { identifier: "a1", type: "attribute" }, to: { identifier: "l1", type: "measure" } },
        ];
        // l1 is a leaf child of both ds1 and a1.
        const result = filterLeafNodes(nodes, edges, ["dataSet", "attribute"]);
        const nodeIds = result.nodes.map((n) => (n as IdentifierRef).identifier);
        expect(nodeIds).not.toContain("l1");
        expect(nodeIds).toContain("ds1");
        expect(nodeIds).toContain("a1");
    });

    it("should NOT remove leaf child if it is NOT a child of a filtered type", () => {
        const nodes: IReferencesResult["nodes"] = [
            { identifier: "ds1", type: "dataSet", title: "ds1" },
            { identifier: "a1", type: "attribute", title: "a1" },
            { identifier: "l1", type: "measure", title: "l1" },
            { identifier: "l2", type: "measure", title: "l2" },
        ];
        const edges: IReferencesResult["edges"] = [
            { from: { identifier: "ds1", type: "dataSet" }, to: { identifier: "l1", type: "measure" } },
            { from: { identifier: "a1", type: "attribute" }, to: { identifier: "l2", type: "measure" } },
        ];
        // l1 is a leaf child of ds1.
        // l2 is a leaf child of a1.
        // If we only filter 'dataSet', l1 should be removed, but l2 should stay.
        const result = filterLeafNodes(nodes, edges, ["dataSet"]);
        const nodeIds = result.nodes.map((n) => (n as IdentifierRef).identifier);
        expect(nodeIds).not.toContain("l1");
        expect(nodeIds).toContain("l2");
        expect(nodeIds).toContain("ds1");
        expect(nodeIds).toContain("a1");
    });

    it("should NOT remove node if it is a child of a filtered type but is NOT a leaf", () => {
        const nodes: IReferencesResult["nodes"] = [
            { identifier: "ds1", type: "dataSet", title: "ds1" },
            { identifier: "m1", type: "measure", title: "m1" },
            { identifier: "d1", type: "analyticalDashboard", title: "d1" },
        ];
        const edges: IReferencesResult["edges"] = [
            { from: { identifier: "ds1", type: "dataSet" }, to: { identifier: "m1", type: "measure" } },
            {
                from: { identifier: "m1", type: "measure" },
                to: { identifier: "d1", type: "analyticalDashboard" },
            },
        ];
        // m1 is a child of ds1, but it's not a leaf.
        const result = filterLeafNodes(nodes, edges, ["dataSet"]);
        const nodeIds = result.nodes.map((n) => (n as IdentifierRef).identifier);
        expect(nodeIds).toContain("m1");
    });

    it("should NOT remove leaf node if it has more than one incoming connection", () => {
        const nodes: IReferencesResult["nodes"] = [
            { identifier: "ds1", type: "dataSet", title: "ds1" },
            { identifier: "p1", type: "insight", title: "p1" },
            { identifier: "l1", type: "measure", title: "l1" },
        ];
        const edges: IReferencesResult["edges"] = [
            { from: { identifier: "ds1", type: "dataSet" }, to: { identifier: "l1", type: "measure" } },
            { from: { identifier: "p1", type: "insight" }, to: { identifier: "l1", type: "measure" } },
        ];
        // l1 is a leaf (no outgoing edges).
        // l1 is a child of ds1 (filtered type).
        // BUT l1 is also a child of p1.
        // It should be kept because it has more than 1 incoming connection.

        const result = filterLeafNodes(nodes, edges, ["dataSet"]);
        const nodeIds = result.nodes.map((n) => (n as IdentifierRef).identifier);
        expect(nodeIds).toContain("l1");
    });
});
