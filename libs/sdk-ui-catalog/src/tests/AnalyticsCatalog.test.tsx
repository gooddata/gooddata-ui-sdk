// (C) 2025 GoodData Corporation

import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { AnalyticsCatalog } from "../AnalyticsCatalog.js";

const backend = dummyBackend();

describe("AnalyticsCatalog", () => {
    it("renders without errors", () => {
        render(<AnalyticsCatalog backend={backend} workspace="test-workspace" locale="en-US" />);

        expect(screen.getByText("Analytics Catalog")).toBeVisible();
    });
});
