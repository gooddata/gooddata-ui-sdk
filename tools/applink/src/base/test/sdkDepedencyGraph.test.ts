// (C) 2020-2025 GoodData Corporation
// @ts-expect-error Unknown
import flatten from "lodash/flatten";
import { describe, expect, it } from "vitest";

import { TestSdkDependencyGraph } from "./sdkDependencyGraph.fixture.js";
import { determinePackageBuildOrder } from "../dependencyGraph.js";

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
