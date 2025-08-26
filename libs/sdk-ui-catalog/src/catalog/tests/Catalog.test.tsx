// (C) 2025 GoodData Corporation

import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { testIds } from "../../automation/index.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { Catalog } from "../Catalog.js";

const wrapper = TestIntlProvider;

const props = {
    backend: dummyBackend(),
    workspace: "test-workspace",
};

describe("Catalog", () => {
    it("renders with proper data-testid", () => {
        render(<Catalog {...props} />, { wrapper });

        expect(screen.getByTestId(testIds.catalog)).toBeVisible();
    });

    it("renders with header title", () => {
        render(<Catalog {...props} />, { wrapper });

        expect(screen.getByText("Analytics Catalog")).toBeVisible();
    });
});
