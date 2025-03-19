// (C) 2020-2024 GoodData Corporation
import flatten from "lodash/flatten";
import { determinePackageBuildOrder } from "../dependencyGraph.js";
import { TestSdkDependencyGraph } from "./sdkDependencyGraph.fixture.js";
import { describe, it, expect } from "vitest";

describe("dependency graph", () => {
    it("should create build order including all packages", () => {
        const buildOrder = determinePackageBuildOrder(TestSdkDependencyGraph);
        expect(flatten(buildOrder).length).toEqual(TestSdkDependencyGraph.nodes.length);
    });

    it("should create correct build order", () => {
        expect(determinePackageBuildOrder(TestSdkDependencyGraph)).toMatchSnapshot();
    });

    it("should create correct build order for prod deps only", () => {
        expect(determinePackageBuildOrder(TestSdkDependencyGraph, ["prod"])).toMatchSnapshot();
    });
});
