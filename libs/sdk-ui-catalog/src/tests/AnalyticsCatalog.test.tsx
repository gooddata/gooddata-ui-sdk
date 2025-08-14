// (C) 2025 GoodData Corporation

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { AnalyticsCatalog } from "../AnalyticsCatalog.js";

const backend = dummyBackend();

describe("AnalyticsCatalog", () => {
    it("renders without errors", () => {
        render(<AnalyticsCatalog backend={backend} workspace="test-workspace" locale="en-US" />);

        expect(screen.getByText("Analytics Catalog")).toBeVisible();
    });
});
