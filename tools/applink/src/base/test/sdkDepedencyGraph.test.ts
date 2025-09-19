// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { TestSdkDependencyGraph } from "./sdkDependencyGraph.fixture.js";
import { determinePackageBuildOrder } from "../dependencyGraph.js";

describe("dependency graph", () => {
    it("should create build order including all packages", () => {
        const buildOrder = determinePackageBuildOrder(TestSdkDependencyGraph);
        expect(buildOrder.flat().length).toEqual(TestSdkDependencyGraph.nodes.length);
    });

    it("should create correct build order", () => {
        expect(determinePackageBuildOrder(TestSdkDependencyGraph)).toMatchSnapshot();
    });

    it("should create correct build order for prod deps only", () => {
        expect(determinePackageBuildOrder(TestSdkDependencyGraph, ["prod"])).toMatchSnapshot();
    });
});
